import type { Metadata } from "next";
import { Download } from "lucide-react";
import { RestoreButton } from "@/components/admin/restore-button";
import { requireAdmin } from "@/lib/auth";
import { DATA_FILES } from "@/lib/schema";
import { listBackups } from "@/lib/storage";

export const metadata: Metadata = { title: "Backups" };

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
const size = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

export default async function BackupsPage() {
  await requireAdmin();
  const backups = await listBackups(Object.keys(DATA_FILES));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Backups</h1>
        {/* A plain link so the browser downloads the file instead of client-side navigating. */}
        <a href="/api/admin/full-backup" download className="btn-primary rounded-lg px-4 py-2">
          <Download className="size-4" aria-hidden /> Download full backup
        </a>
      </div>
      <p className="mt-1 max-w-2xl text-slate-500">
        Every save keeps the previous version of the file (the last 15 per file). The time shown is when that version was replaced.
        Restoring backs up the current version first, so you can undo a restore.
        <strong className="font-semibold text-slate-700"> These versions live on the server.</strong> Download a full backup
        (all data and images) regularly and keep it somewhere else.
      </p>

      <div className="mt-8 space-y-6">
        {(Object.entries(DATA_FILES) as [keyof typeof DATA_FILES, string][]).map(([file, label]) => {
          const list = backups.filter((b) => b.file === file);
          return (
            <section key={file} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h2 className="font-display flex items-center justify-between border-b border-slate-200 px-5 py-3 font-bold">
                {label}
                <span className="text-sm font-normal text-slate-500 tabular-nums">
                  {list.length} version{list.length === 1 ? "" : "s"}
                </span>
              </h2>
              {list.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">No backups yet. One is made the first time this is saved.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {list.map((b) => (
                    <li key={b.name} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-50/40">
                      <span className="font-medium text-slate-800 tabular-nums">{when(b.savedAt)}</span>
                      <span className="text-sm text-slate-500 tabular-nums">{size(b.bytes)}</span>
                      <span className="ms-auto inline-flex items-center gap-2">
                        <RestoreButton name={b.name} label={label} when={when(b.savedAt)} />
                        <a href={`/api/admin/backups/${b.name}`} download className="admin-btn" aria-label={`Download ${label} backup from ${when(b.savedAt)}`}>
                          <Download className="size-4" aria-hidden />
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
