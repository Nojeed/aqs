import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SocialIcon, socialNames } from "@/components/social-icons";
import { getDictionary, t, type Locale } from "@/lib/i18n";
import type { Site } from "@/lib/schema";

/** Contact details as cards: the column beside the form on the contact page and on course pages. */
export function ContactCards({ locale, site }: { locale: Locale; site: Site }) {
  const d = getDictionary(locale);
  const c = site.contact;
  const wa = c.whatsapp.replace(/\D/g, "");

  const items = [
    c.email && { icon: Mail, label: d.contact.email, value: c.email, href: `mailto:${c.email}`, ltr: true },
    c.phone && { icon: Phone, label: d.contact.phone, value: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, "")}`, ltr: true },
    wa && { icon: MessageCircle, label: d.contact.whatsapp, value: `+${wa}`, href: `https://wa.me/${wa}`, ltr: true },
    t(c.address, locale) && { icon: MapPin, label: d.contact.address, value: t(c.address, locale), href: c.mapUrl || undefined },
    t(c.hours, locale) && { icon: Clock, label: d.contact.hours, value: t(c.hours, locale) },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string; ltr?: boolean }[];
  const socials = socialNames.filter((n) => site.social[n]);

  return (
    <>
      {items.map((item) => (
        <InfoCard key={item.label} {...item} />
      ))}
      {socials.length > 0 && (
        <div className="card p-5">
          <p className="text-sm text-slate-500">{d.contact.follow}</p>
          <div className="mt-3 flex gap-2">
            {socials.map((name) => (
              <a
                key={name}
                href={site.social[name]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="inline-flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-800 transition hover:bg-brand-800 hover:text-white"
              >
                <SocialIcon name={name} className="size-5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** One labelled value with an icon tile; a link when it has an href. */
export function InfoCard({ icon: Icon, label, value, href, ltr }: { icon: typeof Mail; label: string; value: string; href?: string; ltr?: boolean }) {
  const content = (
    <>
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-800 text-white">
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-sm text-slate-500">{label}</span>
        <span className="mt-0.5 block font-semibold text-brand-950" dir={ltr ? "ltr" : undefined}>
          {value}
        </span>
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="card flex items-center gap-4 p-5 transition hover:border-brand-200 hover:shadow-lg"
    >
      {content}
    </a>
  ) : (
    <div className="card flex items-center gap-4 p-5">{content}</div>
  );
}
