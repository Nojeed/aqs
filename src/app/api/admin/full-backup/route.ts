import { promises as fs } from "node:fs";
import { Readable } from "node:stream";
import { create } from "tar";
import { adminGuard } from "@/lib/api-auth";
import { DATA_DIR } from "@/lib/storage";

/**
 * Everything the admin has created (data files + uploaded images) as one .tar.gz, so a copy can live
 * off the server. The automatic backups/ folder is left out: it's history, not current data.
 */
export async function GET(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const entries = (await fs.readdir(DATA_DIR)).filter((name) => name !== "backups" && !name.endsWith(".tmp"));
  const archive = create({ gzip: true, cwd: DATA_DIR, portable: true }, entries);
  const day = new Date().toISOString().slice(0, 10);
  return new Response(Readable.toWeb(archive as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="aqs-data-${day}.tar.gz"`,
      "Cache-Control": "no-store",
    },
  });
}
