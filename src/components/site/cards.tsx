import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Monitor, Signal } from "lucide-react";
import { Icon } from "@/components/icon";
import { formatDate, getDictionary, t, type Locale } from "@/lib/i18n";
import type { Course, Post, Service } from "@/lib/schema";

export function ServiceCard({ service, locale }: { service: Service; locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <Link
      href={`/${locale}/services/${service.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden p-8 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/10"
    >
      <div
        className="absolute -end-16 -top-16 size-40 rounded-full bg-brand-50 transition duration-500 group-hover:scale-150 group-hover:bg-brand-100/70"
        aria-hidden
      />
      <span className="relative inline-flex size-14 items-center justify-center rounded-2xl bg-brand-800 text-white shadow-lg shadow-brand-800/25 transition group-hover:bg-brand-700">
        <Icon name={service.icon} className="size-7" strokeWidth={1.6} />
      </span>
      <h3 className="font-display relative mt-6 text-xl font-bold">{t(service.title, locale)}</h3>
      <p className="relative mt-3 flex-1 leading-7 text-slate-600">{t(service.summary, locale)}</p>
      <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        {d.common.learnMore}
        <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
      </span>
    </Link>
  );
}

export function CourseCard({ course, locale }: { course: Course; locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <Link
      href={`/${locale}/courses/${course.slug}`}
      className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        {course.image && (
          <Image
            src={course.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={70}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-brand-950/60 to-transparent" aria-hidden />
        {t(course.category, locale) && (
          <span className="absolute start-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-800 shadow">
            {t(course.category, locale)}
          </span>
        )}
        <span className="absolute start-4 bottom-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
          <Signal className="size-3.5" aria-hidden />
          {d.courses.levels[course.level]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold group-hover:text-brand-700">{t(course.title, locale)}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{t(course.summary, locale)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
          {t(course.duration, locale) && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-brand-500" aria-hidden />
              {t(course.duration, locale)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Monitor className="size-3.5 text-brand-500" aria-hidden />
            {d.courses.formats[course.format]}
          </span>
          {course.startDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-brand-500" aria-hidden />
              {formatDate(course.startDate, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="group flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-brand-100">
        {post.cover && (
          <Image
            src={post.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={70}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-500">
        {t(post.category, locale) && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">{t(post.category, locale)}</span>
        )}
        {post.date && <time dateTime={post.date}>{formatDate(post.date, locale)}</time>}
      </div>
      <h3 className="font-display mt-3 text-xl font-bold text-balance transition group-hover:text-brand-700">
        {t(post.title, locale)}
      </h3>
      <p className="mt-2 line-clamp-2 leading-7 text-slate-600">{t(post.excerpt, locale)}</p>
    </Link>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">{text}</div>
  );
}
