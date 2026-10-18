import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { CollectionTable } from "@/components/admin/collection-table";
import { requireAdmin } from "@/lib/auth";
import { readCollection } from "@/lib/content";
import { collections, isCollection } from "@/lib/schema";

export async function generateMetadata({ params }: PageProps<"/admin/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollection(collection) ? collections[collection].label : "Not found" };
}

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
    category?: { ar: string; en: string };
    level?: string;
    format?: string;
  }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{config.label}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} total · {items.filter((i) => i.published).length} published
          </p>
        </div>
        <Link href={`/admin/${collection}/new`} className="btn-primary rounded-lg px-4 py-2" data-shortcut="new">
          <Plus className="size-4" aria-hidden /> New {config.singular}
        </Link>
      </div>

      <div className="mt-8">
        <CollectionTable
          collection={collection}
          rows={items.map((i) => ({
            id: i.id,
            slug: i.slug,
            titleEn: i.title.en,
            titleAr: i.title.ar,
            published: i.published,
            order: i.order ?? 0,
            date: i.date ?? "",
            category: i.category?.en || i.category?.ar || "",
            level: i.level ?? "",
            format: i.format ?? "",
          }))}
        />
      </div>
    </div>
  );
}
