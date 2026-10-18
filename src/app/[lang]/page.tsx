import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleCheck, ShieldCheck, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import { duration, ease } from "@/lib/motion";
import { Icon } from "@/components/icon";
import { CourseCard, PostCard, ServiceCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { VerifyForm } from "@/components/site/verify-form";
import { getCourses, getPosts, getServices, getSite } from "@/lib/content";
import { getDictionary, localHref, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";

// Hero entrance, staggered by `delay` seconds.
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.hero, delay, ease },
});
// Headline and subtitle only slide: they stay visible in the server HTML, so they paint before JS loads.
const slideUp = (delay = 0) => ({ ...fadeUp(delay), initial: { y: 18 }, animate: { y: 0 } });

export default async function HomePage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, services, courses, posts] = await Promise.all([getSite(), getServices(), getCourses(), getPosts()]);
  const featured = (courses.filter((c) => c.featured).length ? courses.filter((c) => c.featured) : courses).slice(0, 4);
  const s = site.sections;
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-brand-950">
        <motion.div
          className="absolute inset-0 -z-20"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 18, ease: "easeOut" }}
        >
          <Image
            src={site.hero.image || "/images/hero-food-plant.jpg"}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover object-[70%_center]"
          />
        </motion.div>
        <div
          className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950 via-brand-950/85 to-brand-900/30 rtl:bg-linear-to-l"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-brand-950/80 via-transparent to-brand-950/40" aria-hidden />
        <div className="bg-lines absolute inset-0 -z-10 opacity-60" aria-hidden />

        <div className="container-page grid min-h-[min(100svh,880px)] items-center gap-12 pt-32 pb-36 lg:grid-cols-[1.25fr_1fr] lg:pb-40">
          <div className="max-w-2xl">
            <motion.p {...fadeUp()} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <Sparkles className="size-4 text-accent-300" aria-hidden />
              {t(site.hero.badge, locale)}
            </motion.p>
            <motion.h1 {...slideUp(0.12)} className="font-display mt-6 text-4xl leading-tight font-extrabold text-balance text-white sm:text-5xl lg:text-6xl">
              {t(site.hero.title, locale)}
              {t(site.hero.highlight, locale) && (
                <span className="mt-2 block text-accent-300">
                  {t(site.hero.highlight, locale)}
                </span>
              )}
            </motion.h1>
            <motion.p {...slideUp(0.24)} className="mt-6 max-w-xl text-lg leading-8 text-pretty text-white/75">
              {t(site.hero.subtitle, locale)}
            </motion.p>
            <motion.div {...fadeUp(0.36)} className="mt-10 flex flex-wrap gap-3">
              {site.hero.primaryCta.href && (
                <Link href={localHref(site.hero.primaryCta.href, locale)} className="btn-light px-7 py-3.5">
                  {t(site.hero.primaryCta.label, locale)}
                  <Arrow className="size-4" aria-hidden />
                </Link>
              )}
              {site.hero.secondaryCta.href && (
                <Link href={localHref(site.hero.secondaryCta.href, locale)} className="btn-ghost-light px-7 py-3.5">
                  {t(site.hero.secondaryCta.label, locale)}
                </Link>
              )}
            </motion.div>
            {site.hero.pillars.length > 0 && (
              <motion.ul {...fadeUp(0.48)} className="mt-12 flex flex-wrap gap-x-6 gap-y-4">
                {site.hero.pillars.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/85">
                    <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
                      <Icon name={p.icon} className="size-5 text-white" strokeWidth={1.6} />
                    </span>
                    <span className="max-w-32 leading-5">{t(p.label, locale)}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Quick certificate check */}
          <motion.div {...fadeUp(0.4)} className="hidden lg:block">
            <div className="ms-auto max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-8 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white text-brand-800 shadow-lg">
                <ShieldCheck className="size-7" strokeWidth={1.6} aria-hidden />
              </span>
              <h2 className="font-display mt-6 text-2xl font-bold text-white">{d.verify.quickTitle}</h2>
              <p className="mt-2 leading-7 text-white/70">{d.verify.quickText}</p>
              <div className="mt-6">
                <VerifyForm
                  locale={locale}
                  label={d.verify.label}
                  placeholder={d.verify.placeholder}
                  submit={d.verify.submit}
                  size="md"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      {site.stats.length > 0 && (
        <section className="relative z-10 -mt-20">
          <div className="container-page">
            <dl className="card grid grid-cols-2 divide-slate-100 overflow-hidden p-2 lg:grid-cols-4 lg:divide-x rtl:lg:divide-x-reverse">
              {site.stats.map((stat, i) => (
                <div key={i} className="px-6 py-6 text-center sm:py-8">
                  <dt className="sr-only">{t(stat.label, locale)}</dt>
                  <dd className="font-display text-3xl font-extrabold text-brand-800 sm:text-4xl" dir="ltr">
                    {stat.value}
                  </dd>
                  <dd className="mt-2 text-sm font-medium text-slate-500">{t(stat.label, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------- About */}
      <section className="py-24 sm:py-32">
        <div className="container-page grid items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="relative aspect-[4/5] w-4/5 overflow-hidden rounded-[2rem] bg-brand-100 shadow-2xl shadow-brand-900/20">
              {site.about.image && (
                <Image src={site.about.image} alt="" fill sizes="(min-width: 1024px) 40vw, 80vw" quality={70} className="object-cover" />
              )}
            </div>
            <div className="absolute end-0 bottom-0 aspect-square w-1/2 overflow-hidden rounded-[2rem] border-8 border-white bg-brand-100 shadow-2xl shadow-brand-900/20">
              {site.about.imageSecondary && (
                <Image src={site.about.imageSecondary} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" quality={70} className="object-cover" />
              )}
            </div>
            {site.about.badgeValue && (
              <div className="absolute end-[38%] top-10 rounded-3xl bg-brand-800 px-6 py-5 text-white shadow-xl shadow-brand-900/30 sm:end-[30%]">
                <p className="font-display text-4xl font-extrabold" dir="ltr">
                  {site.about.badgeValue}
                </p>
                <p className="mt-1 text-sm text-white/75">{t(site.about.badgeLabel, locale)}</p>
              </div>
            )}
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display mt-3 text-3xl font-bold text-balance sm:text-4xl">{t(site.about.title, locale)}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">{t(site.about.body, locale)}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {site.about.points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span className="leading-7 text-slate-700">{t(point, locale)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/${locale}/services`} className="btn-primary">
                {d.nav.services}
                <Arrow className="size-4" aria-hidden />
              </Link>
              <Link href={`/${locale}/contact`} className="btn-outline">
                {d.common.contactUs}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      {services.length > 0 && (
        <section className="relative bg-brand-50/60 py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading title={t(s.servicesTitle, locale)} subtitle={t(s.servicesSubtitle, locale)} />
            <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service, i) => (
                <Reveal as="li" key={service.id} delay={(i % 3) * 80}>
                  <ServiceCard service={service} locale={locale} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- Standards */}
      {site.standards.length > 0 && (
        <section className="border-y border-slate-200/70 bg-white py-12">
          <div className="container-page text-center">
            <p className="text-sm font-semibold text-slate-500">{t(s.standardsTitle, locale)}</p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4" dir="ltr">
              {site.standards.map((name) => (
                <li key={name} className="font-display text-xl font-bold tracking-tight text-silver-400 sm:text-2xl">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- Courses */}
      {featured.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading
              align="start"
             
              title={t(s.coursesTitle, locale)}
              subtitle={t(s.coursesSubtitle, locale)}
              action={
                <Link href={`/${locale}/courses`} className="btn-outline shrink-0">
                  {d.courses.all}
                  <Arrow className="size-4" aria-hidden />
                </Link>
              }
            />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((course, i) => (
                <Reveal as="li" key={course.id} delay={i * 80}>
                  <CourseCard course={course} locale={locale} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------- Why us */}
      {site.why.length > 0 && (
        <section className="relative isolate overflow-hidden bg-brand-900 py-24 sm:py-32">
          <div className="bg-lines absolute inset-0 -z-10" aria-hidden />
          <div className="absolute -start-40 top-1/3 -z-10 size-[28rem] rounded-full bg-accent-500/15 blur-3xl" aria-hidden />
          <div className="absolute end-0 top-0 -z-10 hidden h-full w-1/3 bg-brand-800/60 [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)] lg:block rtl:[clip-path:polygon(0_0,65%_0,100%_100%,0_100%)]" aria-hidden />
          <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <Reveal>
              <SectionHeading align="start" light title={t(s.whyTitle, locale)} subtitle={t(s.whySubtitle, locale)} />
              <div className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-[2rem] ring-1 ring-white/10 lg:block">
                <Image src="/images/lab-testing.jpg" alt="" fill sizes="40vw" quality={70} className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-brand-950/50 to-transparent" aria-hidden />
              </div>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2">
              {site.why.map((item, i) => (
                <Reveal as="li" key={i} delay={i * 80}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur transition hover:border-white/25 hover:bg-white/10">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-brand-800">
                      <Icon name={item.icon} className="size-6" strokeWidth={1.6} />
                    </span>
                    <h3 className="font-display mt-5 text-lg font-bold text-white">{t(item.title, locale)}</h3>
                    <p className="mt-2 leading-7 text-white/65">{t(item.text, locale)}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- Verify CTA */}
      <section className="py-24 sm:py-28">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand-50 via-white to-silver-100 p-8 ring-1 ring-brand-100 sm:p-14">
              <div className="absolute -end-20 -top-20 size-72 rounded-full bg-brand-100/60 blur-2xl" aria-hidden />
              <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr_1.1fr]">
                <span className="inline-flex size-20 items-center justify-center rounded-3xl bg-brand-800 text-white shadow-xl shadow-brand-800/25">
                  <ShieldCheck className="size-10" strokeWidth={1.5} aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">{t(site.verifyCta.title, locale)}</h2>
                  <p className="mt-3 text-lg leading-8 text-slate-600">{t(site.verifyCta.text, locale)}</p>
                </div>
                <VerifyForm locale={locale} label={d.verify.label} placeholder={d.verify.placeholder} submit={d.verify.submit} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Blog */}
      {posts.length > 0 && (
        <section className="pb-24 sm:pb-32">
          <div className="container-page">
            <SectionHeading
              align="start"
             
              title={t(s.blogTitle, locale)}
              subtitle={t(s.blogSubtitle, locale)}
              action={
                <Link href={`/${locale}/blog`} className="btn-outline shrink-0">
                  {d.common.viewAll}
                  <Arrow className="size-4" aria-hidden />
                </Link>
              }
            />
            <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post, i) => (
                <Reveal as="li" key={post.id} delay={i * 80}>
                  <PostCard post={post} locale={locale} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- Contact CTA */}
      <ContactCta title={t(site.contactCta.title, locale)} text={t(site.contactCta.text, locale)}>
        {site.contactCta.button.href && (
          <Link href={localHref(site.contactCta.button.href, locale)} className="btn-light px-8 py-4">
            {t(site.contactCta.button.label, locale)}
            <Arrow className="size-4" aria-hidden />
          </Link>
        )}
      </ContactCta>
    </>
  );
}

function ContactCta({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <Image src="/images/kitchen-hygiene.jpg" alt="" fill sizes="100vw" quality={70} className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-brand-950/85" aria-hidden />
      <div className="bg-lines absolute inset-0 -z-10" aria-hidden />
      <div className="container-page text-center">
        <h2 className="font-display mx-auto max-w-3xl text-3xl font-bold text-balance text-white sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">{text}</p>
        <div className="mt-10 flex justify-center">{children}</div>
      </div>
    </section>
  );
}
