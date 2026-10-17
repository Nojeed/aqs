import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { getDictionary } from "@/lib/i18n";
import { currentLocale } from "@/lib/locale";

export default async function NotFound() {
  const locale = await currentLocale();
  const d = getDictionary(locale);
  return (
    <>
      <PageHero title={d.notFound.title} subtitle={d.notFound.text} eyebrow="404" />
      <div className="container-page py-20">
        <Link href={`/${locale}`} className="btn-primary">
          {d.notFound.home}
        </Link>
      </div>
    </>
  );
}
