import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { DeleteButton, History, StatusSelect, type InboxName } from "@/components/admin/inbox";
import type { HistoryEntry } from "@/lib/schema";

/** Detail page shell for one registration or message: facts, status, history and notes. */
export function RecordDetail({
  inbox,
  id,
  name,
  title,
  received,
  status,
  statuses,
  facts,
  children,
  history,
}: {
  inbox: InboxName;
  id: string;
  name: string;
  title: string;
  received: string;
  status: string;
  statuses: readonly { value: string; label: string }[];
  facts: [label: string, value: ReactNode][];
  children?: ReactNode;
  history: HistoryEntry[];
}) {
  const back = `/admin/${inbox}`;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <Link href={back} className="admin-btn">
        <ArrowLeft className="size-4" aria-hidden /> {inbox === "registrations" ? "Registrations" : "Messages"}
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 tabular-nums">
            Received {new Date(received).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelect inbox={inbox} id={id} status={status} statuses={statuses} label="Status" />
          <DeleteButton inbox={inbox} id={id} name={name} redirectTo={back} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
                <dd className="mt-1 font-medium break-words text-slate-800">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          {children && <div className="mt-6 border-t border-slate-100 pt-6">{children}</div>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display mb-5 font-bold">History and notes</h2>
          <History inbox={inbox} id={id} history={history} />
        </section>
      </div>
    </div>
  );
}
