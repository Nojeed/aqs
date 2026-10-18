import type { Metadata } from "next";
import { Download } from "lucide-react";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { requireAdmin } from "@/lib/auth";
import { REGISTRATIONS_FILE, type Registration } from "@/lib/schema";
import { readJson } from "@/lib/storage";

export const metadata: Metadata = { title: "Registrations" };

export default async function RegistrationsPage() {
  await requireAdmin();
  const rows = await readJson<Registration[]>(REGISTRATIONS_FILE);
  const waiting = rows.filter((r) => r.status === "new").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Registrations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Course registrations from the website. {waiting > 0 && <strong className="text-brand-800">{waiting} new</strong>}
          </p>
        </div>
        {/* A plain link so the browser downloads the file instead of client-side navigating. */}
        <a href="/api/admin/export/registrations" download className="admin-btn py-2">
          <Download className="size-4" aria-hidden /> Export CSV
        </a>
      </div>
      <div className="mt-8">
        <RegistrationsTable rows={rows} />
      </div>
    </div>
  );
}
