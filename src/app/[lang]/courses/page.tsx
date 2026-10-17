import type { Metadata } from "next";
import { CourseCard, EmptyState } from "@/components/site/cards";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { getCourses, getSite } from "@/lib/content";
import { getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getDictionary(await currentLocale()).nav.courses };
}

export default async function CoursesPage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, courses] = await Promise.all([getSite(), getCourses()]);
  return (
    <>
      <PageHero
        title={d.courses.all}
        subtitle={t(site.sections.coursesSubtitle, locale)}
        eyebrow={d.nav.courses}
        image="/images/training-room.jpg"
      />
      <section className="container-page py-20">
        {courses.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <Reveal as="li" key={course.id} delay={(i % 3) * 80}>
                <CourseCard course={course} locale={locale} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <EmptyState text={d.common.empty} />
        )}
      </section>
    </>
  );
}
