import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

/** Serves files the admin uploaded into DATA_DIR/uploads. */
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await params;
  const name = path.basename(parts.join("/"));
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || name.startsWith(".")) return new Response("Not found", { status: 404 });
  try {
    const file = await fs.readFile(path.join(UPLOADS_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        // Uploaded names include a random suffix, so they never change.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
