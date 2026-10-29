import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PostCard } from "@/components/site/cards";
import { Markdown } from "@/components/site/markdown";
import { DetailSkeleton } from "@/components/site/skeleton";
import { getPost, getPosts } from "@/lib/content";
import { formatDate, getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { ViewBeacon } from "@/components/site/view-beacon";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, currentLocale()]);
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: t(post.title, locale),
    description: t(post.excerpt, locale),
    image: post.cover || undefined,
    type: "article",
    publishedTime: post.date || undefined,
  });
}

export default function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PostDetail params={params} />
    </Suspense>
  );
}

function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

async function PostDetail({ params }: Pick<PageProps<"/[lang]/blog/[slug]">, "params">) {
  const [{ slug }, locale] = await Promise.all([params, currentLocale()]);
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const d = getDictionary(locale);
  const body = t(post.body, locale);
  // Same category first, then the most recent of the rest.
  const sameCategory = (p: typeof post) => p.category.en === post.category.en && p.category.en !== "";
  const others = all.filter((p) => p.id !== post.id);
  const more = [...others.filter(sameCategory), ...others.filter((p) => !sameCategory(p))].slice(0, 3);

  return (
    <>
      <ViewBeacon type="posts" slug={post.slug} />
      <section className="relative isolate overflow-hidden bg-brand-950 pt-36 pb-16 sm:pb-24">
        {post.cover && (
          <Image src={post.cover} alt="" fill priority sizes="100vw" quality={70} className="-z-20 object-cover opacity-30" />
        )}
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-brand-950 via-brand-950/80 to-brand-900/60" aria-hidden />
        <div className="container-page max-w-4xl">
          <Breadcrumbs
            locale={locale}
            items={[
              { href: `/${locale}`, label: d.nav.home },
              { href: `/${locale}/blog`, label: d.nav.blog },
            ]}
          />
          {t(post.category, locale) && (
            <p className="mt-8 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-800">
              {t(post.category, locale)}
            </p>
          )}
          <h1 className="font-display mt-5 text-title font-bold text-balance text-white">{t(post.title, locale)}</h1>
          <p className="mt-5 text-lg leading-8 text-white/75">{t(post.excerpt, locale)}</p>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
            {post.author && (
              <span>
                {d.common.by} <span className="font-semibold text-white">{post.author}</span>
              </span>
            )}
            {post.date && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
              </>
            )}
            <span aria-hidden>·</span>
            <span>
              {readingMinutes(body)} {d.common.minRead}
            </span>
          </p>
        </div>
      </section>

      <article className="container-page max-w-3xl py-16 lg:py-20">
        <Markdown>{body}</Markdown>
      </article>

      {more.length > 0 && (
        <section className="border-t border-slate-200/70 bg-brand-50/50 py-20">
          <div className="container-page">
            <h2 className="font-display text-subheading font-bold">{d.blog.related}</h2>
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
