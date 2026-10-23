import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseCard, EmptyState } from "@/components/site/cards";
import { CourseFilters, CourseGrid } from "@/components/site/course-filters";
import { PageHero } from "@/components/site/page-hero";
import { getCourses, getSite } from "@/lib/content";
import { getDictionary, t } from "@/lib/i18n";
import { filterSettings } from "@/lib/schema";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, site] = await Promise.all([currentLocale(), getSite()]);
  return pageMetadata({
    locale,
    path: "/courses",
    title: getDictionary(locale).nav.courses,
    description: t(site.sections.coursesSubtitle, locale),
  });
}

export default async function CoursesPage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, courses] = await Promise.all([getSite(), getCourses()]);
  const items = courses.map((course) => ({
    id: course.id,
    level: course.level,
    format: course.format,
    startDate: course.startDate,
    category: t(course.category, locale),
    title: t(course.title, locale),
    card: <CourseCard course={course} locale={locale} />,
  }));
  return (
    <>
      <PageHero
        title={d.courses.all}
        subtitle={t(site.sections.coursesSubtitle, locale)}
       
        image="/images/training-room.jpg"
      />
      <section className="container-page py-20" aria-labelledby="course-list-title">
        {/* Screen-reader heading so the card titles (h3) sit under an h2, not straight under the page h1. */}
        <h2 id="course-list-title" className="sr-only">
          {d.nav.courses}
        </h2>
        {courses.length ? (
          <Suspense fallback={<CourseGrid items={items} />}>
            <CourseFilters locale={locale} items={items} show={filterSettings(site)} />
          </Suspense>
        ) : (
          <EmptyState text={d.common.empty} />
        )}
      </section>
    </>
  );
}
