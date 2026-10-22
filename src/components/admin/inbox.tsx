"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { addInboxNote, deleteInboxRecords, setInboxStatus } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { badgeClass, type Tone } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import type { HistoryEntry } from "@/lib/schema";
import { cn } from "@/lib/utils";

/** Shared admin UI for registrations and messages. */
export type InboxName = "registrations" | "messages";
type Status = { value: string; label: string };

const tones: Record<string, Tone> = {
  new: "info",
  contacted: "warning",
  replied: "success",
  enrolled: "success",
  cancelled: "neutral",
  archived: "neutral",
};

export function StatusSelect({ inbox, id, status, statuses, label }: { inbox: InboxName; id: string; status: string; statuses: readonly Status[]; label: string }) {
  const { pending, run } = useAdminAction();
  return (
    <Select value={status} disabled={pending} onValueChange={(next) => run(() => setInboxStatus(inbox, [id], next))}>
      <SelectTrigger
        aria-label={label}
        className={cn(badgeClass(tones[status] ?? "neutral"), "h-8 w-auto gap-1 border-0 py-1 ps-3 pe-2 shadow-none hover:brightness-95 md:text-xs")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** `redirectTo` (detail pages) leaves the page after deleting. */
export function DeleteButton({ inbox, id, name, redirectTo }: { inbox: InboxName; id: string; name: string; redirectTo?: string }) {
  const router = useRouter();
  const { pending, run } = useAdminAction();
  const withLabel = Boolean(redirectTo);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete the entry from ${name}? A backup copy is kept (Admin → Backups).`)) run(() => deleteInboxRecords(inbox, [id]), { after: redirectTo ? () => router.push(redirectTo) : undefined });
      }}
      className={withLabel ? "admin-btn hover:border-danger-300 hover:bg-danger-50 hover:text-danger-700" : "rounded-lg p-2 text-slate-400 transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"}
      aria-label={withLabel ? undefined : `Delete entry from ${name}`}
    >
      <Trash2 className="size-4" aria-hidden />
      {withLabel && "Delete"}
    </button>
  );
}

/** Bulk bar content for DataTable: set status for all selected rows, or delete them. */
export function BulkActions({ inbox, ids, statuses, clear }: { inbox: InboxName; ids: string[]; statuses: readonly Status[]; clear: () => void }) {
  const { pending, run } = useAdminAction();
  return (
    <>
      <Select value="" disabled={pending} onValueChange={(status) => run(() => setInboxStatus(inbox, ids, status), { after: clear })}>
        <SelectTrigger aria-label="Set status for selected" className="h-9 w-auto rounded-lg bg-white px-3 md:text-sm">
          <SelectValue placeholder="Set status…" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete ${ids.length} selected? A backup copy is kept (Admin → Backups).`)) run(() => deleteInboxRecords(inbox, ids), { after: clear });
        }}
        className="admin-btn hover:border-danger-300 hover:bg-danger-50 hover:text-danger-700"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
        Delete selected
      </button>
    </>
  );
}

/** Timeline of status changes and staff notes, plus a box to add a note. */
export function History({ inbox, id, history }: { inbox: InboxName; id: string; history: HistoryEntry[] }) {
  const { pending, run } = useAdminAction();
  const [note, setNote] = useState("");
  return (
    <div>
      <ol className="space-y-4 border-s-2 border-slate-200 ps-5">
        {history.length === 0 && <li className="text-sm text-slate-500">No notes yet. Status changes and notes appear here.</li>}
        {[...history].reverse().map((h, i) => (
          <li key={i} className="relative">
            <span className="absolute -start-[1.6rem] top-1.5 size-2.5 rounded-full bg-brand-500 ring-4 ring-white" aria-hidden />
            <p className="text-xs text-slate-500 tabular-nums">
              {new Date(h.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-slate-800" dir="auto">
              {h.text}
            </p>
          </li>
        ))}
      </ol>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addInboxNote(inbox, id, note), { after: () => setNote("") });
        }}
      >
        <label htmlFor="inbox-note" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Add a note
        </label>
        <Textarea id="inbox-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Called, left a voicemail…" className="md:text-sm" dir="auto" />
        <div className="mt-2 flex items-center gap-3">
          <button type="submit" className="btn-primary rounded-lg px-4 py-2" disabled={pending || !note.trim()}>
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Save note
          </button>
        </div>
      </form>
    </div>
  );
}
