import { adminGuard } from "@/lib/api-auth";
import { MESSAGES_FILE, REGISTRATIONS_FILE, type Message, type Registration } from "@/lib/schema";
import { readJson } from "@/lib/storage";

/** New-item counts and the latest arrivals, polled by the admin panel for badges and alerts. */
export async function GET(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const [registrations, messages] = await Promise.all([
    readJson<Registration[]>(REGISTRATIONS_FILE),
    readJson<Message[]>(MESSAGES_FILE),
  ]);
  const latest = [
    ...registrations.map((r) => ({ kind: "registrations" as const, id: r.id, name: r.company || r.name, detail: r.courseTitle, createdAt: r.createdAt })),
    ...messages.map((m) => ({ kind: "messages" as const, id: m.id, name: m.name, detail: m.message.slice(0, 80), createdAt: m.createdAt })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  return Response.json(
    {
      registrations: registrations.filter((r) => r.status === "new").length,
      messages: messages.filter((m) => m.status === "new").length,
      latest,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
