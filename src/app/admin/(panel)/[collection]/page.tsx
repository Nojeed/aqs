import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { requireAdmin } from "@/lib/auth";
import { readCollection } from "@/lib/content";
import { collections, isCollection } from "@/lib/schema";

export async function generateMetadata({ params }: PageProps<"/admin/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollection(collection) ? collections[collection].label : "Not found" };
}

const publicPath = { services: "services", courses: "courses", posts: "blog" } as const;

export default async function CollectionPage({ params }: PageProps<"/admin/[collection]">) {
  await requireAdmin();
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  const config = collections[collection];
  const items = (await readCollection(collection)) as unknown as {
    id: string;
    slug: string;
    title: { ar: string; en: string };
    published: boolean;
    order?: number;
    date?: string;
  }[];
  const sorted =
    collection === "posts"
      ? [...items].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      : [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{config.label}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} total · {items.filter((i) => i.published).length} published
          </p>
        </div>
        <Link href={`/admin/${collection}/new`} className="btn-primary rounded-lg px-4 py-2">
          <Plus className="size-4" aria-hidden /> New {config.singular}
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {sorted.length === 0 ? (
          <p className="p-10 text-center text-slate-500">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50/70">
                <Link href={`/admin/${collection}/${item.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-950">{item.title.en || item.title.ar}</p>
                  <p className="truncate text-sm text-slate-500" dir="rtl">
                    {item.title.ar}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-slate-400">
                    /{publicPath[collection]}/{item.slug}
                    {collection === "posts" ? ` · ${item.date || "no date"}` : ` · order ${item.order ?? 0}`}
                  </p>
                </Link>
                <PublishToggle collection={collection} id={item.id} published={item.published} />
                <Link href={`/admin/${collection}/${item.id}`} className="admin-btn">
                  <Pencil className="size-4" aria-hidden /> Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
