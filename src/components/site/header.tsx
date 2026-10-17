"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Languages, Menu, ShieldCheck, X } from "lucide-react";
import { Logo } from "@/components/logo";
import type { Locale } from "@/lib/i18n";

type NavItem = { href: string; label: string };

export function Header({
  locale,
  nav,
  brand,
  tagline,
  verifyLabel,
  languageLabel,
  menuLabel,
  closeLabel,
}: {
  locale: Locale;
  nav: NavItem[];
  brand: string;
  tagline: string;
  verifyLabel: string;
  languageLabel: string;
  menuLabel: string;
  closeLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link href={`/${locale}`} className="shrink-0" aria-label={brand} onClick={() => setOpen(false)}>
          <Logo variant={solid ? "dark" : "light"} name={brand} tagline={tagline} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <Suspense fallback={<NavLinks nav={nav} solid={solid} />}>
            <ActiveNavLinks nav={nav} solid={solid} />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2">
          <Suspense fallback={<LangLink href={`/${locale === "ar" ? "en" : "ar"}`} label={languageLabel} solid={solid} />}>
            <LangSwitch locale={locale} label={languageLabel} solid={solid} />
          </Suspense>
          <Link
            href={`/${locale}/verify`}
            className={`hidden sm:inline-flex ${solid ? "btn-primary" : "btn-light"} px-5 py-2.5`}
          >
            <ShieldCheck className="size-4" aria-hidden />
            {verifyLabel}
          </Link>
          <button
            type="button"
            className={`inline-flex size-11 items-center justify-center rounded-full lg:hidden ${
              solid ? "text-brand-900 hover:bg-brand-50" : "text-white hover:bg-white/10"
            }`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? closeLabel : menuLabel}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-5rem)] overflow-y-auto bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-6" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-4 text-lg font-semibold text-brand-950 hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <Link href={`/${locale}/verify`} onClick={() => setOpen(false)} className="btn-primary mt-4">
              <ShieldCheck className="size-4" aria-hidden />
              {verifyLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function linkClass(solid: boolean, active: boolean) {
  if (solid) {
    return active ? "bg-brand-50 text-brand-800" : "text-slate-700 hover:bg-slate-100 hover:text-brand-900";
  }
  return active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10 hover:text-white";
}

function NavLinks({ nav, solid, pathname }: { nav: NavItem[]; solid: boolean; pathname?: string }) {
  return nav.map((item) => {
    const isHome = item.href.split("/").length === 2;
    const active = !!pathname && (isHome ? pathname === item.href : pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${linkClass(solid, active)}`}
      >
        {item.label}
      </Link>
    );
  });
}

function ActiveNavLinks(props: { nav: NavItem[]; solid: boolean }) {
  return <NavLinks {...props} pathname={usePathname()} />;
}

function LangLink({ href, label, solid }: { href: string; label: string; solid: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
        solid ? "text-brand-900 hover:bg-brand-50" : "text-white hover:bg-white/10"
      }`}
    >
      <Languages className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

function LangSwitch({ locale, label, solid }: { locale: Locale; label: string; solid: boolean }) {
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";
  const rest = pathname.split("/").slice(2).join("/");
  return <LangLink href={`/${other}${rest ? `/${rest}` : ""}`} label={label} solid={solid} />;
}
