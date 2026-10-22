import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/admin/print-button";
import { requireAdmin } from "@/lib/auth";
import { certificateStatus, neverExpires, readCertificates } from "@/lib/certificates";
import { formatDate } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import logo from "../../../../../../public/brand/logo-full.png";

export const metadata: Metadata = { title: "Print certificate" };

/** A4 landscape certificate with a QR code to its verification page. Outside the admin layout so only the certificate prints. */
export default function PrintCertificatePage({ params }: PageProps<"/admin/print/certificates/[id]">) {
  // Reading the session is request-time work, so it streams inside a boundary (this page sits outside the admin layout).
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-400">Loading certificate…</p>}>
      <PrintCertificate params={params} />
    </Suspense>
  );
}

async function PrintCertificate({ params }: Pick<PageProps<"/admin/print/certificates/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const cert = (await readCertificates()).find((c) => c.id === id);
  if (!cert) notFound();

  const verifyUrl = `${siteUrl}/verify?id=${encodeURIComponent(cert.id)}`;
  const qr = await QRCode.toString(verifyUrl, { type: "svg", margin: 0, color: { dark: "#001d4c", light: "#ffffff" } });
  const status = certificateStatus(cert);
  const expires = neverExpires(cert);
  const facts: [string, string, string][] = [
    ["Issue date", "تاريخ الإصدار", cert.issueDate ? `${formatDate(cert.issueDate, "en")} · ${formatDate(cert.issueDate, "ar")}` : ""],
    ["Valid until", "صالحة حتى", expires ? "Does not expire · لا تنتهي صلاحيتها" : `${formatDate(cert.expiryDate!, "en")} · ${formatDate(cert.expiryDate!, "ar")}`],
    ["Training hours", "ساعات التدريب", cert.hours ? String(cert.hours) : ""],
    ["Grade", "التقدير", [cert.grade, cert.gradeAr].filter(Boolean).join(" · ")],
  ];

  return (
    <div className="min-h-dvh bg-slate-100 py-8 print:bg-white print:py-0">
      <style>{`@page { size: A4 landscape; margin: 0; } @media print { html, body { background: #fff; } }`}</style>
      <div className="mx-auto mb-6 flex max-w-[297mm] items-center justify-between gap-4 px-4 print:hidden">
        <Link href="/admin/certificates" className="admin-btn">
          <ArrowLeft className="size-4" aria-hidden /> Certificates
        </Link>
        {status !== "valid" && (
          <p className="rounded-lg bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-800 ring-1 ring-warning-200">
            This certificate is {status}. The QR code will say so too.
          </p>
        )}
        <PrintButton />
      </div>

      <article className="relative mx-auto flex h-[210mm] w-[297mm] flex-col overflow-hidden bg-white p-[14mm] shadow-xl print:shadow-none">
        <div className="pointer-events-none absolute inset-[7mm] rounded-sm border-[3px] border-brand-800" aria-hidden />
        <div className="pointer-events-none absolute inset-[9mm] rounded-sm border border-brand-300" aria-hidden />

        <header className="relative flex items-start justify-between">
          <Image src={logo} alt="AQS – Advanced Quality Skills" className="h-[18mm] w-auto" priority />
          <p className="font-mono text-sm text-slate-500" dir="ltr">
            No. {cert.id}
          </p>
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-[11mm] leading-none font-extrabold tracking-tight text-brand-900">Certificate of Completion</p>
          <p className="mt-[3mm] text-[7mm] font-bold text-brand-800" dir="rtl">
            شهادة إتمام
          </p>
          <p className="mt-[8mm] text-sm tracking-wide text-slate-500 uppercase">This certifies that · تشهد AQS بأن</p>
          <p className="font-display mt-[3mm] text-[10mm] leading-tight font-bold text-brand-950">{cert.name}</p>
          {cert.nameAr && (
            <p className="text-[7mm] font-semibold text-brand-950" dir="rtl">
              {cert.nameAr}
            </p>
          )}
          {cert.course && (
            <>
              <p className="mt-[6mm] text-sm tracking-wide text-slate-500 uppercase">has successfully completed · قد أتمّ بنجاح</p>
              <p className="font-display mt-[2mm] text-[6.5mm] font-bold text-brand-800">{cert.course}</p>
              {cert.courseAr && (
                <p className="text-[5.5mm] font-semibold text-brand-800" dir="rtl">
                  {cert.courseAr}
                </p>
              )}
            </>
          )}
        </div>

        <footer className="relative flex items-end justify-between gap-[8mm]">
          <dl className="grid flex-1 grid-cols-2 gap-x-[8mm] gap-y-[3mm] text-sm">
            {facts
              .filter(([, , v]) => v)
              .map(([en, ar, value]) => (
                <div key={en}>
                  <dt className="text-xs text-slate-500">
                    {en} · <span dir="rtl">{ar}</span>
                  </dt>
                  <dd className="font-semibold text-brand-950">{value}</dd>
                </div>
              ))}
          </dl>
          <div className="flex items-end gap-[4mm]">
            <p className="max-w-[48mm] text-end text-xs leading-5 text-slate-500">
              Scan to verify · امسح للتحقق
              <br />
              <span className="font-mono break-all" dir="ltr">
                {verifyUrl.replace(/^https?:\/\//, "")}
              </span>
            </p>
            {/* QRCode returns a plain SVG string built from our own URL. */}
            <div className="size-[30mm] [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
          </div>
        </footer>
      </article>
    </div>
  );
}
