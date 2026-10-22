import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, ClipboardList, Inbox, Newspaper, Settings2, Wrench } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { BarList, RegistrationCharts } from "@/components/admin/registration-charts";
import { StatusBadge } from "@/components/ui/status-badge";
import { certificateStatus, readCertificates } from "@/lib/certificates";
import { readCollection } from "@/lib/content";
import { mailConfigured } from "@/lib/mail";
import { topViews, type ViewType } from "@/lib/views";
import { MESSAGES_FILE, REGISTRATIONS_FILE, type Message, type Registration } from "@/lib/schema";
import { readJson } from "@/lib/storage";

export const metadata: Metadata = { title: "Dashboard" };

type Chip = { tone: "success" | "warning" | "danger" | "neutral"; text: string };
const publishChips = (live: number, total: number): Chip[] => [
  { tone: "success", text: `${live} published` },
  ...(total > live ? [{ tone: "neutral" as const, text: `${total - live} draft${total - live === 1 ? "" : "s"}` }] : []),
];

export default async function Dashboard() {
  await requireAdmin();
  const [services, courses, posts, certs, registrations, messages, courseViews, postViews, serviceViews] = await Promise.all([
    readCollection("services"),
    readCollection("courses"),
    readCollection("posts"),
    readCertificates().catch(() => []),
    readJson<Registration[]>(REGISTRATIONS_FILE),
    readJson<Message[]>(MESSAGES_FILE),
    topViews("courses"),
    topViews("posts"),
    topViews("services"),
  ]);
  const newRegistrations = registrations.filter((r) => r.status === "new").length;
  const newMessages = messages.filter((m) => m.status === "new").length;

  const published = (list: { published: boolean }[]) => list.filter((i) => i.published).length;
  const certStatus = certs.map((c) => certificateStatus(c));
  const count = (status: string) => certStatus.filter((s) => s === status).length;
  const cards = [
    { href: "/admin/services", label: "Services", icon: Wrench, total: services.length, chips: publishChips(published(services), services.length) },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, total: courses.length, chips: publishChips(published(courses), courses.length) },
    { href: "/admin/posts", label: "Blog posts", icon: Newspaper, total: posts.length, chips: publishChips(published(posts), posts.length) },
    {
      href: "/admin/certificates",
      label: "Certificates",
      icon: BadgeCheck,
      total: certs.length,
      chips: [
        { tone: "success", text: `${count("valid")} valid` },
        ...(count("expired") ? [{ tone: "warning", text: `${count("expired")} expired` }] : []),
        ...(count("revoked") ? [{ tone: "danger", text: `${count("revoked")} revoked` }] : []),
      ] as Chip[],
    },
  ];

  // Most viewed detail pages (last 30 days), linked to their editor.
  const ranked = (type: ViewType, views: { slug: string; count: number }[], items: { id: string; slug: string; title: { en: string; ar: string } }[]) =>
    views
      .map((v) => {
        const item = items.find((i) => i.slug === v.slug);
        return item && { label: item.title.en || item.title.ar, value: v.count, href: `/admin/${type}/${item.id}` };
      })
      .filter((x): x is { label: string; value: number; href: string } => Boolean(x))
      .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-slate-500">Changes you save here appear on the website immediately.</p>

      {!mailConfigured && (
        <p className="mt-4 rounded-xl bg-info-50 px-4 py-3 text-sm text-info-800 ring-1 ring-info-200">
          <strong>Email alerts are off.</strong> New registrations and messages only show here. To also get them by email, set{" "}
          <code>SMTP_HOST</code>, <code>SMTP_USER</code> and <code>SMTP_PASS</code> on the server (see the README).
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(
          [
            ["/admin/registrations", ClipboardList, newRegistrations, "registration", `${registrations.length} total from the course and contact pages`],
            ["/admin/messages", Inbox, newMessages, "message", `${messages.length} total from the contact page`],
          ] as const
        ).map(([href, Icon, count, noun, sub]) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="font-display block font-bold text-brand-950">
                {count > 0 ? `${count} new ${noun}${count === 1 ? "" : "s"}` : `No new ${noun}s`}
              </span>
              <span className="text-sm text-slate-500">{sub}</span>
            </span>
            <ArrowRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-700" aria-hidden />
          </Link>
        ))}
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md">
              <span className="flex items-center justify-between">
                <c.icon className="size-5 text-brand-600" aria-hidden />
                <span className="text-sm text-slate-500">{c.label}</span>
              </span>
              <p className="font-display mt-3 text-3xl font-bold text-brand-950 tabular-nums">{c.total}</p>
              <span className="mt-2 flex flex-wrap gap-1.5">
                {c.chips.map((chip) => (
                  <StatusBadge key={chip.text} tone={chip.tone}>
                    {chip.text}
                  </StatusBadge>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8" aria-label="Registration charts">
        <RegistrationCharts registrations={registrations} />
      </section>

      <section className="mt-8" aria-labelledby="views-title">
        <h2 id="views-title" className="font-display text-lg font-bold">
          Most viewed pages
        </h2>
        <p className="text-sm text-slate-500">Last 30 days · counted once per visitor session, no cookies or personal data</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <BarList title="Courses" items={ranked("courses", courseViews, courses)} empty="No course views yet." />
          <BarList title="Blog posts" items={ranked("posts", postViews, posts)} empty="No blog views yet." />
          <BarList title="Services" items={ranked("services", serviceViews, services)} empty="No service views yet." />
        </div>
      </section>

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
