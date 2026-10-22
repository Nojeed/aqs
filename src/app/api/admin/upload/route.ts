import path from "node:path";
import { randomBytes } from "node:crypto";
import { adminGuard } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/schema";
import { UPLOADS_DIR, writeFileAtomic } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

// Magic bytes, so a renamed file can't pretend to be an image.
function sniff(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  return null;
}

export async function POST(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "File is larger than 8 MB." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) return Response.json({ error: "Only JPG, PNG, WebP, AVIF or GIF images are allowed." }, { status: 415 });

  const base = slugify(path.parse(file.name).name) || "image";
  const name = `${base}-${randomBytes(4).toString("hex")}${EXT[type]}`;
  await writeFileAtomic(path.join(UPLOADS_DIR, name), buf);
  await audit("Uploaded image", name);
  return Response.json({ url: `/uploads/${name}` });
}
