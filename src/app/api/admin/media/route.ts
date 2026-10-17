import { promises as fs } from "node:fs";
import path from "node:path";
import { adminGuard } from "@/lib/api-auth";
import { UPLOADS_DIR } from "@/lib/storage";

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
