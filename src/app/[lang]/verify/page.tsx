import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleAlert, CircleCheck, CircleX, FileQuestion, QrCode } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { VerifyForm } from "@/components/site/verify-form";
import { CopyButton } from "@/components/copy-button";
import { certificateStatus, findCertificate, neverExpires, type CertificateStatus } from "@/lib/certificates";
import { formatDate, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/verify", title: d.verify.title, description: d.verify.subtitle });
}

type Search = PageProps<"/[lang]/verify">["searchParams"];

async function queryId(searchParams: Search) {
  const { id } = await searchParams;
  return (Array.isArray(id) ? id[0] : id)?.trim() ?? "";
}

export default async function VerifyPage({ searchParams }: PageProps<"/[lang]/verify">) {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const formProps = { locale, label: d.verify.label, placeholder: d.verify.placeholder, submit: d.verify.submit };

  return (
    <>
      <PageHero title={d.verify.title} subtitle={d.verify.subtitle} image="/images/audit-clipboard.jpg">
        <div className="mt-10 max-w-2xl">
          <Suspense fallback={<VerifyForm {...formProps} />}>
            {queryId(searchParams).then((id) => (
              <VerifyForm {...formProps} defaultValue={id} />
            ))}
          </Suspense>
        </div>
      </PageHero>

      <section className="container-page grid gap-8 py-16 lg:grid-cols-[1fr_20rem] lg:py-20">
        <div aria-live="polite">
          <Suspense fallback={<p className="text-slate-500">{d.verify.checking}</p>}>
            <Result searchParams={searchParams} locale={locale} d={d} />
          </Suspense>
        </div>
        <aside className="card h-fit p-7">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <QrCode className="size-6" aria-hidden />
          </span>
          <h2 className="font-display mt-5 text-lg font-bold">{d.verify.howTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{d.verify.howText}</p>
        </aside>
      </section>
    </>
  );
}

const statusStyle: Record<CertificateStatus, { ring: string; badge: string; icon: typeof CircleCheck }> = {
  valid: { ring: "ring-success-200 bg-success-50/60", badge: "bg-success-600 text-white", icon: CircleCheck },
  expired: { ring: "ring-warning-200 bg-warning-50/60", badge: "bg-warning-500 text-white", icon: CircleAlert },
  revoked: { ring: "ring-danger-200 bg-danger-50/60", badge: "bg-danger-600 text-white", icon: CircleX },
};

async function Result({ searchParams, locale, d }: { searchParams: Search; locale: Locale; d: Dictionary }) {
  const id = await queryId(searchParams);
  if (!id) return <EmptyHint d={d} />;

  const cert = await findCertificate(id);
  if (!cert) {
    return (
      <div className="rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-200 sm:p-10">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-600">
            <FileQuestion className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">{d.verify.notFound}</h2>
            <p className="mt-1 font-mono text-sm text-slate-500" dir="ltr">
              {id.toUpperCase()}
            </p>
            <p className="mt-4 leading-7 text-slate-600">{d.verify.notFoundText}</p>
          </div>
        </div>
      </div>
    );
  }

  const status = certificateStatus(cert);
  const style = statusStyle[status];
  const ar = locale === "ar";
  const rows = [
    { label: d.verify.holder, value: (ar && cert.nameAr) || cert.name },
    { label: d.verify.course, value: (ar && cert.courseAr) || cert.course },
    { label: d.verify.certificateNo, value: cert.id, mono: true },
    { label: d.verify.issued, value: cert.issueDate ? formatDate(cert.issueDate, locale) : "" },
    { label: d.verify.expires, value: neverExpires(cert) ? d.verify.noExpiry : formatDate(cert.expiryDate!, locale) },
    { label: d.verify.hours, value: cert.hours ? String(cert.hours) : "" },
    { label: d.verify.grade, value: (ar && cert.gradeAr) || cert.grade },
  ].filter((r) => r.value);

  return (
    <div className={`rounded-3xl p-8 ring-1 sm:p-10 ${style.ring}`}>
      <div className="flex flex-wrap items-center gap-4">
        <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${style.badge}`}>
          <style.icon className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold">{d.verify[status]}</h2>
          <p className="mt-1 text-slate-600">{d.verify[`${status}Text`]}</p>
        </div>
      </div>
      <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-slate-200/70 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="bg-white p-5 sm:last:odd:col-span-2">
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{r.label}</dt>
            <dd className={`mt-1.5 flex items-center gap-1 font-semibold text-brand-950 ${r.mono ? "font-mono" : ""}`} dir={r.mono ? "ltr" : undefined}>
              {r.value}
              {r.mono && <CopyButton text={r.value} label={d.common.copy} copiedLabel={d.common.copied} className="-my-1.5" />}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EmptyHint({ d }: { d: Dictionary }) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-10 text-center">
      <CircleCheck className="size-10 text-brand-300" aria-hidden />
      <p className="mt-4 max-w-md leading-7 text-slate-500">{d.verify.subtitle}</p>
    </div>
  );
}
