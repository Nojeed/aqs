import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { EmptyState, PostCard } from "@/components/site/cards";
import { PageHero } from "@/components/site/page-hero";
import { BlogFilters, BlogList } from "@/components/site/blog-filters";
import { getPosts, getSite } from "@/lib/content";
import { formatDate, getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { filterSettings } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, site] = await Promise.all([currentLocale(), getSite()]);
  return pageMetadata({
    locale,
    path: "/blog",
    title: getDictionary(locale).nav.blog,
    description: t(site.sections.blogSubtitle, locale),
  });
}

export default async function BlogPage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, posts] = await Promise.all([getSite(), getPosts()]);
  const [lead] = posts;
  // The newest post is featured large while nothing is filtered.
  const leadCard = lead && (
          <Link href={`/${locale}/blog/${lead.slug}`} className="group card grid overflow-hidden lg:grid-cols-2">
            <div className="relative aspect-[16/10] bg-brand-100 lg:aspect-auto lg:min-h-96">
              {lead.cover && (
                <Image
                  src={lead.cover}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  quality={80}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                {t(lead.category, locale) && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">{t(lead.category, locale)}</span>
                )}
                {lead.date && <time dateTime={lead.date}>{formatDate(lead.date, locale)}</time>}
              </div>
              <h2 className="font-display mt-4 text-subheading font-bold text-balance transition group-hover:text-brand-700">
                {t(lead.title, locale)}
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">{t(lead.excerpt, locale)}</p>
              <span className="mt-8 text-sm font-semibold text-brand-700">{d.common.readMore} {locale === "ar" ? "←" : "→"}</span>
            </div>
          </Link>
  );
  const items = posts.map((post) => ({
    id: post.id,
    topic: t(post.category, locale),
    year: post.date?.slice(0, 4) ?? "",
    title: t(post.title, locale),
    excerpt: t(post.excerpt, locale),
    card: <PostCard post={post} locale={locale} />,
  }));

  return (
    <>
      <PageHero
        title={t(site.sections.blogTitle, locale)}
        subtitle={t(site.sections.blogSubtitle, locale)}
        image="/images/food-lab-produce.jpg"
      />
      <section className="container-page py-16 lg:py-20">
        {posts.length === 0 ? (
          <EmptyState text={d.common.empty} />
        ) : (
          <Suspense fallback={<BlogList lead={leadCard} items={items} />}>
            <BlogFilters locale={locale} lead={leadCard} items={items} show={filterSettings(site)} />
          </Suspense>
        )}
      </section>
    </>
  );
}
