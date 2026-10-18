"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { DataTable, type AdminColumn, type TableFilter } from "@/components/admin/data-table";
import { OrderButtons } from "@/components/admin/order-buttons";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { LevelIcon } from "@/components/level-icon";

export type CollectionRow = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  published: boolean;
  order: number;
  date: string;
  category: string;
  level: string;
  format: string;
};

type Collection = "services" | "courses" | "posts";

const publicPath = { services: "services", courses: "courses", posts: "blog" } as const;
const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
const formats = [
  { value: "inPerson", label: "In person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];
const statuses = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];
const labelOf = (list: { value: string; label: string }[], value: string) => list.find((o) => o.value === value)?.label ?? value;

export function CollectionTable({ collection, rows }: { collection: Collection; rows: CollectionRow[] }) {
  const columns: AdminColumn<CollectionRow>[] = [
    {
      id: "title",
      header: "Title",
      accessorFn: (r) => `${r.titleEn} ${r.titleAr} ${r.slug}`,
      sortFn: (a, b) => a.original.titleEn.localeCompare(b.original.titleEn),
      cell: ({ row: { original: r } }) => (
        <Link href={`/admin/${collection}/${r.id}`} className="group block min-w-56">
          <span className="block font-semibold text-brand-950 group-hover:text-brand-700 group-hover:underline">
            {r.titleEn || r.titleAr}
          </span>
          <span className="block text-slate-500" dir="rtl">
            {r.titleAr}
          </span>
        </Link>
      ),
    },
  ];

  if (collection === "courses") {
    columns.push(
      {
        id: "level",
        header: "Level",
        accessorKey: "level",
        filterFn: "equalsString",
        cell: (c) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <LevelIcon level={c.getValue() as string} className="size-4 text-brand-600" />
            {labelOf(levels, c.getValue() as string)}
          </span>
        ),
      },
      { id: "format", header: "Format", accessorKey: "format", filterFn: "equalsString", cell: (c) => labelOf(formats, c.getValue() as string) },
      { id: "category", header: "Category", accessorKey: "category", filterFn: "equalsString" },
    );
  }
  if (collection === "posts") {
    columns.push(
      { id: "date", header: "Date", accessorKey: "date", cell: (c) => <span className="whitespace-nowrap tabular-nums">{(c.getValue() as string) || "No date"}</span> },
      { id: "category", header: "Category", accessorKey: "category", filterFn: "equalsString" },
    );
  } else {
    const orders = rows.map((r) => r.order);
    columns.push({
      id: "order",
      header: "Order",
      accessorKey: "order",
      cell: ({ row: { original: r } }) => (
        <OrderButtons
          collection={collection}
          id={r.id}
          order={r.order}
          first={r.order === Math.min(...orders)}
          last={r.order === Math.max(...orders)}
        />
      ),
    });
  }
  columns.push(
    {
      id: "status",
      header: "Status",
      accessorFn: (r) => (r.published ? "published" : "draft"),
      filterFn: "equalsString",
      cell: ({ row: { original: r } }) => <PublishToggle collection={collection} id={r.id} published={r.published} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row: { original: r } }) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/${collection}/${r.id}`} className="admin-btn">
            <Pencil className="size-4" aria-hidden /> Edit
          </Link>
          {r.published && (
            <a
              href={`/en/${publicPath[collection]}/${r.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
              title="View on site"
            >
              <ExternalLink className="size-4" aria-label="View on site" />
            </a>
          )}
        </div>
      ),
    },
  );

  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))].sort().map((c) => ({ value: c, label: c }));
  const filters: TableFilter[] =
    collection === "courses"
      ? [
          { column: "level", label: "Level", options: levels },
          { column: "format", label: "Format", options: formats },
          { column: "category", label: "Category", options: categories },
          { column: "status", label: "Status", options: statuses },
        ]
      : collection === "posts"
        ? [
            { column: "category", label: "Category", options: categories },
            { column: "status", label: "Status", options: statuses },
          ]
        : [{ column: "status", label: "Status", options: statuses }];

  return (
    <DataTable
      data={rows}
      columns={columns}
      filters={filters}
      searchPlaceholder="Search titles"
      storageKey={collection}
      initialSort={collection === "posts" ? [{ id: "date", desc: true }] : [{ id: "order", desc: false }]}
    />
  );
}
