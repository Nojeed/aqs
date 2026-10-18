import { adminGuard } from "@/lib/api-auth";
import { DATA_FILES } from "@/lib/schema";
import { readBackup } from "@/lib/storage";

/** Download one backup file. readBackup only accepts real backup names, so no path tricks. */
export async function GET(request: Request, { params }: RouteContext<"/api/admin/backups/[name]">) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const { name } = await params;
  const backup = await readBackup(name, Object.keys(DATA_FILES));
  if (!backup) return Response.json({ error: "Backup not found." }, { status: 404 });
  return new Response(backup.text, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
