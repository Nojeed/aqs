import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { RecordDetail } from "@/components/admin/record-detail";
import { requireAdmin } from "@/lib/auth";
import { MESSAGES_FILE, messageStatuses, type Message } from "@/lib/schema";
import { readJson } from "@/lib/storage";

export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: PageProps<"/admin/messages/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const m = (await readJson<Message[]>(MESSAGES_FILE)).find((x) => x.id === id);
  if (!m) notFound();

  return (
    <RecordDetail
      inbox="messages"
      id={m.id}
      name={m.name}
      title={m.name}
      received={m.createdAt}
      status={m.status}
      statuses={messageStatuses}
      history={m.history ?? []}
      facts={[
        [
          "Email",
          <a key="e" href={`mailto:${m.email}`} className="text-brand-700 hover:underline" dir="ltr">
            {m.email}
          </a>,
        ],
        [
          "Phone",
          m.phone && (
            <a key="p" href={`tel:${m.phone}`} className="text-brand-700 hover:underline" dir="ltr">
              {m.phone}
            </a>
          ),
        ],
        ["Form language", m.locale === "ar" ? "Arabic" : "English"],
      ]}
    >
      <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Message</h2>
      <p className="mt-2 leading-7 whitespace-pre-line text-slate-800" dir="auto">
        {m.message}
      </p>
      <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to AQS")}`} className="btn-primary mt-6 rounded-lg px-4 py-2">
        <Mail className="size-4" aria-hidden /> Reply by email
      </a>
    </RecordDetail>
  );
}
