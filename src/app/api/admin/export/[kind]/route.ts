import { adminGuard } from "@/lib/api-auth";
import { toCsv } from "@/lib/csv";
import { MESSAGES_FILE, REGISTRATIONS_FILE, type Message, type Registration } from "@/lib/schema";
import { readJson } from "@/lib/storage";

const date = (iso: string) => new Date(iso).toISOString().replace("T", " ").slice(0, 16);

const exporters = {
  registrations: async () => {
    const rows = await readJson<Registration[]>(REGISTRATIONS_FILE);
    return [
      ["Received (UTC)", "Status", "Type", "Name", "Company", "Trainees", "Email", "Phone", "Course", "Date", "Notes", "Language"],
      ...rows.map((r) => [date(r.createdAt), r.status, r.type, r.name, r.company, r.trainees, r.email, r.phone, r.courseTitle, r.session, r.notes, r.locale]),
    ];
  },
  messages: async () => {
    const rows = await readJson<Message[]>(MESSAGES_FILE);
    return [
      ["Received (UTC)", "Status", "Name", "Email", "Phone", "Message", "Language"],
      ...rows.map((m) => [date(m.createdAt), m.status, m.name, m.email, m.phone, m.message, m.locale]),
    ];
  },
};

/** Download registrations or messages as a CSV that opens in Excel (UTF-8 with BOM, Arabic safe). */
export async function GET(request: Request, { params }: RouteContext<"/api/admin/export/[kind]">) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const { kind } = await params;
  if (!(kind in exporters)) return Response.json({ error: "Unknown export." }, { status: 404 });
  const csv = toCsv(await exporters[kind as keyof typeof exporters]());
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aqs-${kind}-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
