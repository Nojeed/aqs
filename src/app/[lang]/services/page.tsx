import type { Metadata } from "next";
import { EmptyState, ServiceCard } from "@/components/site/cards";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { getServices, getSite } from "@/lib/content";
import { getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, site] = await Promise.all([currentLocale(), getSite()]);
  return pageMetadata({
    locale,
    path: "/services",
    title: getDictionary(locale).nav.services,
    description: t(site.sections.servicesSubtitle, locale),
  });
}

export default async function ServicesPage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, services] = await Promise.all([getSite(), getServices()]);
  return (
    <>
      <PageHero
        title={t(site.sections.servicesTitle, locale)}
        subtitle={t(site.sections.servicesSubtitle, locale)}
       
        image="/images/production-line.jpg"
      />
      <section className="container-page py-16 lg:py-20">
        {services.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal as="li" key={service.id} delay={(i % 3) * 80}>
                <ServiceCard service={service} locale={locale} />
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
