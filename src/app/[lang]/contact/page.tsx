import type { Metadata } from "next";
import { Clock, GraduationCap, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { RegistrationForm } from "@/components/site/registration-form";
import { SocialIcon, socialNames } from "@/components/social-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourses, getSite } from "@/lib/content";
import { dir, getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/contact", title: d.contact.title, description: d.contact.subtitle });
}

export default async function ContactPage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, courses] = await Promise.all([getSite(), getCourses()]);
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
      <PageHero title={d.contact.title} subtitle={d.contact.subtitle} image="/images/training-workshop.jpg" />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-20">
        <div className="space-y-4">
          {items.map((item) => {
            const content = (
              <>
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-800 text-white">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm text-slate-500">{item.label}</span>
                  <span className="mt-0.5 block font-semibold text-brand-950" dir={item.ltr ? "ltr" : undefined}>
                    {item.value}
                  </span>
                </span>
              </>
            );
            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="card flex items-center gap-4 p-5 transition hover:border-brand-200 hover:shadow-lg"
              >
                {content}
              </a>
            ) : (
              <div key={item.label} className="card flex items-center gap-4 p-5">
                {content}
              </div>
            );
          })}
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
        </div>

        <div className="card p-6 sm:p-10">
          <h2 className="font-display text-2xl font-bold">{d.contact.formTitle}</h2>
          <Tabs defaultValue="message" dir={dir(locale)} className="mt-6">
            <TabsList>
              <TabsTrigger value="message">
                <Mail className="size-4" aria-hidden />
                {d.contact.tabMessage}
              </TabsTrigger>
              <TabsTrigger value="register">
                <GraduationCap className="size-4" aria-hidden />
                {d.contact.tabRegister}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="message">
              <ContactForm locale={locale} whatsapp={wa} />
            </TabsContent>
            <TabsContent value="register">
              <RegistrationForm locale={locale} courses={courses.map((co) => ({ id: co.id, title: t(co.title, locale) }))} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
