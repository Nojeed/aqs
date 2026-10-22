import { promises as fs } from "node:fs";
import path from "node:path";
import { adminGuard } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { dataPath, UPLOADS_DIR } from "@/lib/storage";

const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;

async function list(dir: string) {
  try {
    const names = (await fs.readdir(dir)).filter((n) => IMAGE.test(n));
    const stats = await Promise.all(names.map(async (n) => ({ n, t: (await fs.stat(path.join(dir, n))).mtimeMs })));
    return stats.sort((a, b) => b.t - a.t).map((s) => s.n);
  } catch {
    return [];
  }
}

/** Lists uploaded images (newest first) followed by the bundled stock photos. */
export async function GET(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const stockDir = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "images");
  const [uploads, stock] = await Promise.all([list(UPLOADS_DIR), list(stockDir)]);
  return Response.json({
    items: [
      ...uploads.map((name) => ({ url: `/uploads/${name}`, name, source: "upload" })),
      ...stock.map((name) => ({ url: `/images/${name}`, name, source: "stock" })),
    ],
  });
}

// Content files that can reference an uploaded image.
const CONTENT = { "site.json": "Site content", "services.json": "Services", "courses.json": "Courses", "posts.json": "Blog posts" };

/**
 * Delete an uploaded image. If any page still uses it, answers 409 with where it is used,
 * unless `force=1` is passed (the admin confirmed). Stock images can't be deleted.
 */
export async function DELETE(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const name = url.searchParams.get("name") ?? "";
  // Plain file names only: no folders, no "..".
  if (!IMAGE.test(name) || name !== path.basename(name)) return Response.json({ error: "Invalid file name." }, { status: 400 });

  const ref = `/uploads/${name}`;
  const usedIn: string[] = [];
  for (const [file, label] of Object.entries(CONTENT)) {
    const text = await fs.readFile(dataPath(file), "utf8").catch(() => "");
    if (text.includes(ref)) usedIn.push(label);
  }
  if (usedIn.length && url.searchParams.get("force") !== "1") {
    return Response.json({ error: "in-use", usedIn }, { status: 409 });
  }
  try {
    await fs.rm(path.join(UPLOADS_DIR, name));
  } catch {
    return Response.json({ error: "Image not found." }, { status: 404 });
  }
  await audit("Deleted image", name);
  return Response.json({ ok: true, usedIn });
}
