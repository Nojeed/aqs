import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteItem, saveItem } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/editor/content-editor";
import { requireAdmin } from "@/lib/auth";
import { readCollection } from "@/lib/content";
import { collections, emptyObject, isCollection } from "@/lib/schema";

const publicPath = { services: "services", courses: "courses", posts: "blog" } as const;

export async function generateMetadata({ params }: PageProps<"/admin/[collection]/[id]">): Promise<Metadata> {
  const { collection, id } = await params;
  if (!isCollection(collection)) return {};
  return { title: id === "new" ? `New ${collections[collection].singular}` : `Edit ${collections[collection].singular}` };
}

export default async function EditItemPage({ params }: PageProps<"/admin/[collection]/[id]">) {
  await requireAdmin();
  const { collection, id } = await params;
  if (!isCollection(collection)) notFound();
  const config = collections[collection];
  const isNew = id === "new";

  let initial: Record<string, unknown>;
  if (isNew) {
    initial = { ...emptyObject(config.fields), published: true };
    if (collection === "posts") initial.date = new Date().toISOString().slice(0, 10);
  } else {
    const items = (await readCollection(collection)) as unknown as Record<string, unknown>[];
    const item = items.find((i) => i.id === id);
    if (!item) notFound();
    // Fill in any fields added to the schema after the item was created.
    initial = { ...emptyObject(config.fields), ...item };
  }

  const title = isNew
    ? `New ${config.singular}`
    : ((initial.title as { en: string; ar: string }).en || (initial.title as { ar: string }).ar || config.singular);

  return (
    <ContentEditor
      key={id}
      title={title}
      fields={config.fields}
      initial={initial}
      save={saveItem.bind(null, collection, isNew ? null : id)}
      remove={isNew ? undefined : deleteItem.bind(null, collection, id)}
      backHref={`/admin/${collection}`}
      backLabel={config.label}
      viewUrl={isNew || !initial.published ? undefined : `/ar/${publicPath[collection]}/${initial.slug}`}
      createdBasePath={isNew ? `/admin/${collection}/` : undefined}
    />
  );
}
