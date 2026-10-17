import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: { href?: string; label: string }[] }) {
  const Sep = locale === "ar" ? ChevronLeft : ChevronRight;
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <Sep className="size-3.5" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/90">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
