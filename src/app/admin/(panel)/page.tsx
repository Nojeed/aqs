import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Newspaper, Settings2, Wrench } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { certificateStats } from "@/lib/certificates";
import { readCollection } from "@/lib/content";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await requireAdmin();
  const [services, courses, posts, certs] = await Promise.all([
    readCollection("services"),
    readCollection("courses"),
    readCollection("posts"),
    certificateStats().catch(() => null),
  ]);

  const cards = [
    { href: "/admin/services", label: "Services", icon: Wrench, count: services.length, live: services.filter((s) => s.published).length },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, count: courses.length, live: courses.filter((c) => c.published).length },
    { href: "/admin/posts", label: "Blog posts", icon: Newspaper, count: posts.length, live: posts.filter((p) => p.published).length },
    { href: "/admin/certificates", label: "Certificates", icon: BadgeCheck, count: certs?.count ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-slate-500">Changes you save here appear on the website immediately.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md">
              <c.icon className="size-5 text-brand-600" aria-hidden />
              <p className="font-display mt-4 text-3xl font-bold text-brand-950">{c.count}</p>
              <p className="text-sm text-slate-500">
                {c.label}
                {c.live !== undefined && c.live !== c.count && <span> · {c.live} published</span>}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/site" className="group flex items-center gap-4 rounded-2xl bg-brand-900 p-6 text-white">
          <Settings2 className="size-8 text-accent-300" aria-hidden />
          <span className="flex-1">
            <span className="font-display block font-bold text-white">Edit site content</span>
            <span className="text-sm text-white/70">Hero, about, numbers, contact details, social links, SEO…</span>
          </span>
          <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
        </Link>
        <Link href="/admin/courses/new" className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <BookOpen className="size-8 text-brand-600" aria-hidden />
          <span className="flex-1">
            <span className="font-display block font-bold">Add a course</span>
            <span className="text-sm text-slate-500">Create a new training program page.</span>
          </span>
          <ArrowRight className="size-5 text-slate-400 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
