import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { SocialIcon, socialNames } from "@/components/social-icons";
import { getDictionary, t, type Locale } from "@/lib/i18n";
import type { Site } from "@/lib/schema";

export function Footer({ locale, site, year }: { locale: Locale; site: Site; year: number }) {
  const d = getDictionary(locale);
  const links = [
    { href: `/${locale}/services`, label: d.nav.services },
    { href: `/${locale}/courses`, label: d.nav.courses },
    { href: `/${locale}/blog`, label: d.nav.blog },
    { href: `/${locale}/verify`, label: d.nav.verify },
    { href: `/${locale}/contact`, label: d.nav.contact },
  ];
  const socials = socialNames.filter((n) => site.social[n]);

  return (
    <footer className="relative overflow-hidden bg-brand-950 text-white/70">
      <div className="bg-lines absolute inset-0" aria-hidden />
      <div className="container-page relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo variant="light" name={site.brand.name} tagline={t(site.brand.fullName, "en")} />
          <p className="mt-6 text-sm leading-7">{t(site.seo.description, locale)}</p>
          <p className="font-display mt-4 text-sm font-semibold text-silver-300">{t(site.brand.tagline, locale)}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map((name) => (
                <a
                  key={name}
                  href={site.social[name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <SocialIcon name={name} className="size-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">{d.footer.quickLinks}</h2>
          <ul className="mt-5 space-y-1 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">{d.footer.contact}</h2>
          <ul className="mt-5 space-y-4 text-sm">
            {site.contact.email && (
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
                <a href={`mailto:${site.contact.email}`} className="inline-flex min-h-11 items-center hover:text-white pointer-fine:min-h-0" dir="ltr">
                  {site.contact.email}
                </a>
              </li>
            )}
            {site.contact.phone && (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
                <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-11 items-center hover:text-white pointer-fine:min-h-0" dir="ltr">
                  {site.contact.phone}
                </a>
              </li>
            )}
            {t(site.contact.address, locale) && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
                <span>{t(site.contact.address, locale)}</span>
              </li>
            )}
            {t(site.contact.hours, locale) && (
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
                <span>{t(site.contact.hours, locale)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>
            © {year} {t(site.brand.fullName, locale)} ({site.brand.name}). {d.footer.rights}
          </p>
          <p className="text-white/50">{t(site.brand.tagline, "en")}</p>
        </div>
      </div>
    </footer>
  );
}
