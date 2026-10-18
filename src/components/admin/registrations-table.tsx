"use client";

import Link from "next/link";
import { Building2, User } from "lucide-react";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { BulkActions, DeleteButton, StatusSelect } from "@/components/admin/inbox";
import { registrationStatuses, type Registration } from "@/lib/schema";

const types = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
];

const columns: AdminColumn<Registration>[] = [
  {
    id: "createdAt",
    header: "Received",
    accessorKey: "createdAt",
    enableGlobalFilter: false,
    cell: (c) => (
      <span className="whitespace-nowrap text-slate-500 tabular-nums">
        {new Date(c.getValue() as string).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
      </span>
    ),
  },
  {
    id: "name",
    header: "Trainee / contact",
    accessorFn: (r) => `${r.name} ${r.email} ${r.phone} ${r.company ?? ""}`,
    sortFn: (a, b) => a.original.name.localeCompare(b.original.name),
    cell: ({ row: { original: r } }) => (
      <div className="min-w-48">
        <Link href={`/admin/registrations/${r.id}`} className="font-semibold text-brand-950 hover:text-brand-700 hover:underline">
          {r.name}
        </Link>
        <a href={`mailto:${r.email}`} className="block text-slate-500 hover:text-brand-700 hover:underline" dir="ltr">
          {r.email}
        </a>
        <a href={`tel:${r.phone}`} className="block text-slate-500 tabular-nums hover:text-brand-700 hover:underline" dir="ltr">
          {r.phone}
        </a>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    filterFn: "equalsString",
    cell: ({ row: { original: r } }) =>
      r.type === "company" ? (
        <div className="min-w-36">
          <p className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <Building2 className="size-4 text-brand-600" aria-hidden /> {r.company}
          </p>
          <p className="text-slate-500 tabular-nums">{r.trainees} trainees</p>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <User className="size-4 text-brand-600" aria-hidden /> Individual
        </span>
      ),
  },
  {
    id: "course",
    header: "Course",
    accessorKey: "courseTitle",
    filterFn: "equalsString",
    cell: ({ row: { original: r } }) => (
      <div className="min-w-44">
        <p className="text-slate-700">{r.courseTitle}</p>
        {(r.notes || r.history?.length) && (
          <Link href={`/admin/registrations/${r.id}`} className="text-xs font-semibold text-brand-700 hover:underline">
            {r.history?.length ? `${r.history.length} update${r.history.length === 1 ? "" : "s"}` : "Has notes"}
          </Link>
        )}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    filterFn: "equalsString",
    cell: ({ row: { original: r } }) => (
      <StatusSelect inbox="registrations" id={r.id} status={r.status} statuses={registrationStatuses} label={`Status for ${r.name}`} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    cell: ({ row: { original: r } }) => <DeleteButton inbox="registrations" id={r.id} name={r.name} />,
  },
];

export function RegistrationsTable({ rows }: { rows: Registration[] }) {
  const courses = [...new Set(rows.map((r) => r.courseTitle))].sort().map((c) => ({ value: c, label: c }));
  return (
    <DataTable
      data={rows}
      columns={columns}
      filters={[
        { column: "status", label: "Status", options: registrationStatuses },
        { column: "type", label: "Type", options: types },
        { column: "course", label: "Course", options: courses },
      ]}
      searchPlaceholder="Search name, email, phone or company"
      initialSort={[{ id: "createdAt", desc: true }]}
      emptyText="No registrations yet. They appear here when someone submits the form on a course page or the contact page."
      storageKey="registrations"
      bulkActions={(selected, clear) => (
        <BulkActions inbox="registrations" ids={selected.map((r) => r.id)} statuses={registrationStatuses} clear={clear} />
      )}
    />
  );
}
