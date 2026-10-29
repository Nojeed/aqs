import type { Metadata } from "next";
import { GraduationCap, Mail } from "lucide-react";
import { ContactCards } from "@/components/site/contact-cards";
import { ContactForm } from "@/components/site/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { RegistrationForm } from "@/components/site/registration-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourses, getSite } from "@/lib/content";
import { dir, getDictionary, t } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/contact", title: d.contact.title, description: d.contact.subtitle, image: "/images/training-workshop.jpg" });
}

export default async function ContactPage() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  const [site, courses] = await Promise.all([getSite(), getCourses()]);
  const wa = site.contact.whatsapp.replace(/\D/g, "");

  return (
    <>
      <PageHero title={d.contact.title} subtitle={d.contact.subtitle} image="/images/training-workshop.jpg" />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-20">
        <div className="space-y-4">
          <ContactCards locale={locale} site={site} />
        </div>

        <div className="card p-6 sm:p-10">
          <h2 className="font-display text-subheading font-bold">{d.contact.formTitle}</h2>
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
              <ContactForm locale={locale} whatsapp={wa} keepMonths={site.privacy?.retentionMonths} />
            </TabsContent>
            <TabsContent value="register">
              <RegistrationForm
                locale={locale}
                courses={courses.map((co) => ({ id: co.id, title: t(co.title, locale) }))}
                keepMonths={site.privacy?.retentionMonths}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
