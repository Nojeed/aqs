import type { Metadata } from "next";
import Form from "next/form";
import { promises as fs } from "node:fs";
import Link from "next/link";
import { Download, ExternalLink, Pencil, Plus, Search } from "lucide-react";
import { CertificateUpload } from "@/components/admin/certificate-upload";
import { RevokeToggle } from "@/components/admin/revoke-toggle";
import { requireAdmin } from "@/lib/auth";
import {
  CERTIFICATES_FILE,
  certificateStats,
  certificateStatus,
  normalizeId,
  parseCertificates,
  type Certificate,
} from "@/lib/certificates";
import { dataPath } from "@/lib/storage";

export const metadata: Metadata = { title: "Certificates" };

const example = `[
  {
    "id": "AQS-2026-0001",
    "name": "Ahmed Mohamed Ali",
    "nameAr": "أحمد محمد علي",
    "course": "HACCP Level 3",
    "courseAr": "HACCP – المستوى الثالث",
    "issueDate": "2026-03-15",
    "expiryDate": "2029-03-15",
    "hours": 24,
    "grade": "Excellent",
    "gradeAr": "ممتاز",
    "status": "valid"
  }
]`;

const badge = {
  valid: "bg-emerald-50 text-emerald-700",
  expired: "bg-amber-50 text-amber-700",
  revoked: "bg-red-50 text-red-700",
};

export default async function CertificatesPage({ searchParams }: PageProps<"/admin/certificates">) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  let list: Certificate[] = [];
  let error = "";
  let stats: Awaited<ReturnType<typeof certificateStats>> | null = null;
  try {
    stats = await certificateStats();
    list = parseCertificates(JSON.parse(await fs.readFile(dataPath(CERTIFICATES_FILE), "utf8")));
  } catch (e) {
    error = (e as Error).message;
  }

  const needle = normalizeId(query);
  const filtered = query
    ? list.filter(
        (c) =>
          normalizeId(c.id).includes(needle) ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.nameAr ?? "").includes(query),
      )
    : list;
  const shown = filtered.slice(0, 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Certificates</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        The verification page reads <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">certificates.json</code> on
        every lookup. Add or edit certificates one at a time here, or upload a whole new file. Changes take effect immediately.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          The current file could not be read: {error}. Visitors will see an error until it is fixed.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Certificates" value={String(stats?.count ?? 0)} />
        <Stat label="Last updated" value={stats ? stats.updatedAt.toLocaleString("en-GB") : "—"} />
        <Stat label="File on server" value={stats?.path ?? "—"} mono />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <Link href="/admin/certificates/new" className="btn-primary rounded-lg px-4 py-2">
          <Plus className="size-4" aria-hidden /> New certificate
        </Link>
        <CertificateUpload />
        {/* A plain link so the browser downloads the file instead of client-side navigating. */}
        <a href="/api/admin/certificates" download className="admin-btn py-2">
          <Download className="size-4" aria-hidden /> Download current file
        </a>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <h2 className="font-display font-bold">
            Records <span className="font-normal text-slate-400">({filtered.length})</span>
          </h2>
          <Form action="/admin/certificates" className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search number or name"
                className="w-64 rounded-lg border border-slate-300 py-2 ps-9 pe-3 text-sm focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
            </div>
          </Form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-start text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-start">Number</th>
                <th className="px-5 py-3 text-start">Name</th>
                <th className="px-5 py-3 text-start">Course</th>
                <th className="px-5 py-3 text-start">Issued</th>
                <th className="px-5 py-3 text-start">Expires</th>
                <th className="px-5 py-3 text-start">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((c) => {
                const status = certificateStatus(c);
                return (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-mono text-xs whitespace-nowrap">{c.id}</td>
                    <td className="px-5 py-3">{c.name}</td>
                    <td className="px-5 py-3 text-slate-500">{c.course}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{c.issueDate}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{c.expiryDate}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge[status]}`}>{status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/certificates/${encodeURIComponent(c.id)}`} className="admin-btn">
                          <Pencil className="size-4" aria-hidden /> Edit
                        </Link>
                        <RevokeToggle id={c.id} revoked={status === "revoked"} />
                        <a href={`/en/verify?id=${encodeURIComponent(c.id)}`} target="_blank" className="text-slate-400 hover:text-brand-700" title="Open public page">
                          <ExternalLink className="size-4" aria-label="Open public verification page" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="p-8 text-center text-slate-500">No matching certificates.</p>}
          {filtered.length > shown.length && (
            <p className="border-t border-slate-100 p-4 text-center text-xs text-slate-500">
              Showing the first {shown.length} of {filtered.length}. Use search to narrow down.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display font-bold">File format</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          A JSON array of objects. <strong>id</strong> (certificate number) and <strong>name</strong> are required; all
          other fields are optional. Arabic fields (<code>nameAr</code>, <code>courseAr</code>, <code>gradeAr</code>) are shown
          on the Arabic page when present. Dates use <code>YYYY-MM-DD</code>. A certificate past its{" "}
          <code>expiryDate</code> shows as expired automatically; set <code>&quot;status&quot;: &quot;revoked&quot;</code> to
          revoke one. Lookups ignore upper/lower case and spaces.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-5 text-xs leading-5 text-slate-100" dir="ltr">
          {example}
        </pre>
      </section>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className={`mt-2 font-semibold break-all text-brand-950 ${mono ? "font-mono text-xs" : "text-lg"}`}>{value}</p>
    </div>
  );
}
