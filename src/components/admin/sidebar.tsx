"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  ClipboardList,
  History,
  Inbox,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings2,
  Wrench,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/actions";
import mark from "../../../public/brand/logo-mark-light.png";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/site", label: "Site content", icon: Settings2 },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/posts", label: "Blog posts", icon: Newspaper },
  { href: "/admin/certificates", label: "Certificates", icon: BadgeCheck },
  { href: "/admin/backups", label: "Backups", icon: History },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex h-16 items-center justify-between bg-brand-950 px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display font-bold text-white">
          <Image src={mark} alt="" className="h-8 w-auto" /> Admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <div className={`${open ? "block" : "hidden"} bg-brand-950 lg:block`}>
        <aside className="text-white/70 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
          <Link href="/admin" className="hidden items-center gap-3 px-6 pt-7 pb-8 lg:flex">
            <Image src={mark} alt="" className="h-9 w-auto" />
            <span className="leading-tight">
              <span className="font-display block text-lg font-extrabold text-white">AQS</span>
              <span className="block text-xs text-white/50">Admin panel</span>
            </span>
          </Link>
          <nav className="flex-1 space-y-1 px-3 py-3 lg:py-0" onClick={() => setOpen(false)}>
            <Suspense fallback={<NavItems />}>
              <ActiveNavItems />
            </Suspense>
          </nav>
          <div className="space-y-1 border-t border-white/10 p-3">
            <a
              href="/ar"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="size-4" aria-hidden /> View website
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" aria-hidden /> Sign out
              </button>
            </form>
            <p className="hidden px-3 pt-2 text-xs text-white/40 pointer-fine:block">
              Press <kbd className="rounded border border-white/20 px-1 font-sans">?</kbd> for keyboard shortcuts
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function ActiveNavItems() {
  return <NavItems pathname={usePathname()} />;
}

function NavItems({ pathname }: { pathname?: string }) {
  return links.map(({ href, label, icon: Icon }) => {
    const active = pathname ? (href === "/admin" ? pathname === href : pathname.startsWith(href)) : false;
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          active ? "bg-white text-brand-900" : "hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="size-4" aria-hidden />
        {label}
      </Link>
    );
  });
}
