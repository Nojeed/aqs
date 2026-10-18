import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CircleCheck, MessageSquare } from "lucide-react";
import { Icon } from "@/components/icon";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Markdown } from "@/components/site/markdown";
import { PageHero } from "@/components/site/page-hero";
import { DetailSkeleton } from "@/components/site/skeleton";
import { getService, getServices } from "@/lib/content";
import { getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { ViewBeacon } from "@/components/site/view-beacon";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, currentLocale()]);
  const service = await getService(slug);
  if (!service) return {};
  return pageMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: t(service.title, locale),
    description: t(service.summary, locale),
    image: service.image || undefined,
  });
}

export default function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

async function ServiceDetail({ params }: Pick<PageProps<"/[lang]/services/[slug]">, "params">) {
  const [{ slug }, locale] = await Promise.all([params, currentLocale()]);
  const [service, all] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();
  const d = getDictionary(locale);
  const others = all.filter((s) => s.id !== service.id).slice(0, 4);

  return (
    <>
      <ViewBeacon type="services" slug={service.slug} />
      <PageHero
        title={t(service.title, locale)}
        subtitle={t(service.summary, locale)}
        image={service.image}
        eyebrow={
          <Breadcrumbs
            locale={locale}
            items={[
              { href: `/${locale}`, label: d.nav.home },
              { href: `/${locale}/services`, label: d.nav.services },
              { label: t(service.title, locale) },
            ]}
          />
        }
      />
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_22rem] lg:py-20">
        <article>
          {service.image && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-brand-100">
              <Image src={service.image} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" quality={80} className="object-cover" />
            </div>
          )}
          <Markdown>{t(service.body, locale)}</Markdown>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {service.features.length > 0 && (
            <div className="card p-7">
              <h2 className="font-display text-lg font-bold">{d.services.includes}</h2>
              <ul className="mt-5 space-y-3">
                {service.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-6">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                    {t(f, locale)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl bg-brand-900 p-7 text-white">
            <MessageSquare className="size-8 text-accent-300" aria-hidden />
            <h2 className="font-display mt-4 text-lg font-bold text-white">{d.services.cta}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{d.services.ctaText}</p>
            <Link
              href={`/${locale}/contact?subject=${encodeURIComponent(t(service.title, locale))}`}
              className="btn-light mt-6 w-full"
            >
              {d.common.contactUs}
            </Link>
          </div>
          {others.length > 0 && (
            <nav className="card p-3" aria-label={d.nav.services}>
              {others.map((s) => (
                <Link
                  key={s.id}
                  href={`/${locale}/services/${s.slug}`}
                  className="flex items-center gap-3 rounded-2xl p-3 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-800"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon name={s.icon} className="size-4.5" />
                  </span>
                  {t(s.title, locale)}
                </Link>
              ))}
            </nav>
          )}
        </aside>
      </div>
    </>
  );
}
