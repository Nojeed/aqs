import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { CertificateUpload } from "@/components/admin/certificate-upload";
import { CertificatesTable } from "@/components/admin/certificates-table";
import { requireAdmin } from "@/lib/auth";
import {
  CERTIFICATES_FILE,
  certificateStats,
  certificateStatus,
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

export default async function CertificatesPage() {
  await requireAdmin();

  let list: Certificate[] = [];
  let error = "";
  let stats: Awaited<ReturnType<typeof certificateStats>> | null = null;
  try {
    stats = await certificateStats();
    list = parseCertificates(JSON.parse(await fs.readFile(dataPath(CERTIFICATES_FILE), "utf8")));
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Certificates</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        The verification page reads <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">certificates.json</code> on
        every lookup. Add or edit certificates one at a time, or upload a CSV from Excel (download the current list as CSV to get
        the columns). Changes take effect immediately.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-danger-50 p-4 text-sm text-danger-700 ring-1 ring-danger-200">
          The current file could not be read: {error}. Visitors will see an error until it is fixed.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Certificates" value={String(stats?.count ?? 0)} />
        <Stat label="Last updated" value={stats ? stats.updatedAt.toLocaleString("en-GB") : "—"} />
        <Stat label="File on server" value={stats?.path ?? "—"} mono />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <Link href="/admin/certificates/new" className="btn-primary rounded-lg px-4 py-2" data-shortcut="new">
          <Plus className="size-4" aria-hidden /> New certificate
        </Link>
        <CertificateUpload />
        {/* A plain link so the browser downloads the file instead of client-side navigating. */}
        <span className="ms-auto flex flex-wrap gap-2">
          <a href="/api/admin/certificates?format=csv" download className="admin-btn py-2">
            <Download className="size-4" aria-hidden /> Download CSV (Excel)
          </a>
          <a href="/api/admin/certificates" download className="admin-btn py-2">
            <Download className="size-4" aria-hidden /> Download JSON
          </a>
        </span>
      </div>

      <div className="mt-8">
        <CertificatesTable rows={list.map((c) => ({ ...c, status: certificateStatus(c), lifetime: c.status === "lifetime" }))} />
      </div>

      <details className="group mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <summary className="font-display cursor-pointer font-bold transition hover:text-brand-700">
          File format for uploads (CSV or JSON)
        </summary>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          <strong>CSV:</strong> the first row names the columns:{" "}
          <code>id, name, nameAr, course, courseAr, issueDate, expiryDate, hours, grade, gradeAr, status</code>. Dates can be{" "}
          <code>2026-03-15</code> or <code>15/03/2026</code>.
          <br />
          <strong>JSON:</strong> an array of objects. <strong>id</strong> (certificate number) and <strong>name</strong> are required; all
          other fields are optional. Arabic fields (<code>nameAr</code>, <code>courseAr</code>, <code>gradeAr</code>) are shown
          on the Arabic page when present. Dates use <code>YYYY-MM-DD</code>. A certificate past its{" "}
          <code>expiryDate</code> shows as expired automatically; set <code>&quot;status&quot;: &quot;lifetime&quot;</code> for a certificate that never expires, or <code>&quot;revoked&quot;</code> to
          revoke one. Lookups ignore upper/lower case and spaces.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-5 text-xs leading-5 text-slate-100" dir="ltr">
          {example}
        </pre>
      </details>
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
