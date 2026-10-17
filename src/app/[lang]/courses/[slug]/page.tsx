import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Calendar, CircleCheck, Clock, Monitor, Signal, Tag, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CourseCard } from "@/components/site/cards";
import { Markdown } from "@/components/site/markdown";
import { PageHero } from "@/components/site/page-hero";
import { DetailSkeleton } from "@/components/site/skeleton";
import { getCourse, getCourses } from "@/lib/content";
import { formatDate, getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";

export async function generateStaticParams() {
  return (await getCourses()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, currentLocale()]);
  const course = await getCourse(slug);
  if (!course) return {};
  return {
    title: t(course.title, locale),
    description: t(course.summary, locale),
    openGraph: course.image ? { images: [course.image] } : undefined,
  };
}

export default function CoursePage({ params }: PageProps<"/[lang]/courses/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CourseDetail params={params} />
    </Suspense>
  );
}

async function CourseDetail({ params }: Pick<PageProps<"/[lang]/courses/[slug]">, "params">) {
  const [{ slug }, locale] = await Promise.all([params, currentLocale()]);
  const [course, all] = await Promise.all([getCourse(slug), getCourses()]);
  if (!course) notFound();
  const d = getDictionary(locale);
  const related = all.filter((c) => c.id !== course.id).slice(0, 3);

  const facts = [
    { icon: Signal, label: d.courses.level, value: d.courses.levels[course.level] },
    { icon: Monitor, label: d.courses.format, value: d.courses.formats[course.format] },
    { icon: Clock, label: d.courses.duration, value: t(course.duration, locale) },
    { icon: Calendar, label: d.courses.startDate, value: course.startDate ? formatDate(course.startDate, locale) : "" },
    { icon: Tag, label: d.courses.price, value: course.price || d.courses.priceOnRequest },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        title={t(course.title, locale)}
        subtitle={t(course.summary, locale)}
        image={course.image}
        eyebrow={
          <Breadcrumbs
            locale={locale}
            items={[
              { href: `/${locale}`, label: d.nav.home },
              { href: `/${locale}/courses`, label: d.nav.courses },
              { label: t(course.title, locale) },
            ]}
          />
        }
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {t(course.category, locale) && (
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-800">
              {t(course.category, locale)}
            </span>
          )}
          {facts.slice(0, 3).map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur"
            >
              <f.icon className="size-4" aria-hidden />
              {f.value}
            </span>
          ))}
        </div>
      </PageHero>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_22rem] lg:py-20">
        <article className="min-w-0">
          {course.image && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-brand-100">
              <Image src={course.image} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" quality={80} className="object-cover" />
            </div>
          )}

          {course.outcomes.length > 0 && (
            <section className="mb-10 rounded-3xl bg-brand-50/70 p-8">
              <h2 className="font-display text-xl font-bold">{d.courses.outcomes}</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {course.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 leading-7">
                    <CircleCheck className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                    {t(o, locale)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Markdown>{t(course.body, locale)}</Markdown>

          {t(course.audience, locale) && (
            <section className="mt-10 flex gap-5 rounded-3xl border border-slate-200 p-8">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-800 text-white">
                <Users className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">{d.courses.audience}</h2>
                <p className="mt-2 leading-7 text-slate-600">{t(course.audience, locale)}</p>
              </div>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <dl className="divide-y divide-slate-100 px-7 py-3">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-4 py-4">
                  <dt className="inline-flex items-center gap-2.5 text-sm text-slate-500">
                    <f.icon className="size-4 text-brand-500" aria-hidden />
                    {f.label}
                  </dt>
                  <dd className="text-end text-sm font-semibold text-brand-950">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="bg-brand-900 p-7 text-white">
              <h2 className="font-display text-lg font-bold text-white">{d.courses.enrollCta}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{d.courses.enrollText}</p>
              <Link
                href={`/${locale}/contact?subject=${encodeURIComponent(t(course.title, locale))}`}
                className="btn-light mt-6 w-full"
              >
                {d.common.enroll}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-brand-50/60 py-20">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold">{d.courses.all}</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <li key={c.id}>
                  <CourseCard course={c} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
