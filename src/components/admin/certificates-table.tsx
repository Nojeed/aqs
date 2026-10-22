"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Printer } from "lucide-react";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { RevokeToggle } from "@/components/admin/revoke-toggle";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/ui/status-badge";

type Row = {
  id: string;
  name: string;
  nameAr?: string;
  course?: string;
  issueDate?: string;
  expiryDate?: string;
  status: "valid" | "expired" | "revoked";
  lifetime: boolean;
};

const tone = { valid: "success", expired: "warning", revoked: "danger" } as const;
const statuses = [
  { value: "valid", label: "Valid" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
];
const date = (v: unknown) => <span className="whitespace-nowrap text-slate-500 tabular-nums">{(v as string) || "—"}</span>;

const columns: AdminColumn<Row>[] = [
  {
    id: "id",
    header: "Number",
    accessorKey: "id",
    cell: ({ row: { original: c } }) => (
      <span className="inline-flex items-center gap-1">
        <Link
          href={`/admin/certificates/${encodeURIComponent(c.id)}`}
          className="font-mono text-xs whitespace-nowrap text-brand-800 hover:text-brand-600 hover:underline"
        >
          {c.id}
        </Link>
        <CopyButton text={c.id} label="Copy number" />
      </span>
    ),
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (c) => `${c.name} ${c.nameAr ?? ""}`,
    sortFn: (a, b) => a.original.name.localeCompare(b.original.name),
    cell: ({ row: { original: c } }) => (
      <div className="min-w-40">
        <p className="font-medium text-slate-800">{c.name}</p>
        {c.nameAr && (
          <p className="text-slate-500" dir="rtl">
            {c.nameAr}
          </p>
        )}
      </div>
    ),
  },
  { id: "course", header: "Course", accessorFn: (c) => c.course ?? "", cell: (c) => <span className="text-slate-600">{c.getValue() as string}</span> },
  { id: "issueDate", header: "Issued", accessorFn: (c) => c.issueDate ?? "", enableGlobalFilter: false, cell: (c) => date(c.getValue()) },
  {
    id: "expiryDate",
    header: "Expires",
    accessorFn: (c) => (c.lifetime ? "9999" : (c.expiryDate ?? "")),
    enableGlobalFilter: false,
    cell: ({ row: { original: c } }) =>
      c.lifetime ? <StatusBadge tone="info">Never expires</StatusBadge> : date(c.expiryDate),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    cell: ({ row: { original: c } }) => (
      <StatusBadge tone={tone[c.status]} className="capitalize">
        {c.status}
      </StatusBadge>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    cell: ({ row: { original: c } }) => (
      <div className="flex items-center justify-end gap-2">
        <Link href={`/admin/certificates/${encodeURIComponent(c.id)}`} className="admin-btn">
          <Pencil className="size-4" aria-hidden /> Edit
        </Link>
        <RevokeToggle id={c.id} revoked={c.status === "revoked"} />
        <a
          href={`/admin/print/certificates/${encodeURIComponent(c.id)}`}
          target="_blank"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
          title="Print certificate"
        >
          <Printer className="size-4" aria-label="Print certificate" />
        </a>
        <a
          href={`/en/verify?id=${encodeURIComponent(c.id)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
          title="Open public verification page"
        >
          <ExternalLink className="size-4" aria-label="Open public verification page" />
        </a>
      </div>
    ),
  },
];

export function CertificatesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      filters={[{ column: "status", label: "Status", options: statuses }]}
      searchPlaceholder="Search number, name or course"
      initialSort={[{ id: "issueDate", desc: true }]}
      emptyText="No certificates yet. Add one with New certificate."
      pageSize={50}
      storageKey="certificates"
    />
  );
}
