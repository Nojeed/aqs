"use client";

import Link from "next/link";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { BulkActions, DeleteButton, StatusSelect } from "@/components/admin/inbox";
import { messageStatuses, type Message } from "@/lib/schema";

const columns: AdminColumn<Message>[] = [
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
    id: "from",
    header: "From",
    accessorFn: (m) => `${m.name} ${m.email} ${m.phone ?? ""}`,
    sortFn: (a, b) => a.original.name.localeCompare(b.original.name),
    cell: ({ row: { original: m } }) => (
      <div className="min-w-44">
        <Link href={`/admin/messages/${m.id}`} className="font-semibold text-brand-950 hover:text-brand-700 hover:underline">
          {m.name}
        </Link>
        <a href={`mailto:${m.email}`} className="block text-slate-500 hover:text-brand-700 hover:underline" dir="ltr">
          {m.email}
        </a>
        {m.phone && (
          <a href={`tel:${m.phone}`} className="block text-slate-500 tabular-nums hover:text-brand-700 hover:underline" dir="ltr">
            {m.phone}
          </a>
        )}
      </div>
    ),
  },
  {
    id: "message",
    header: "Message",
    accessorKey: "message",
    enableSorting: false,
    cell: ({ row: { original: m } }) => (
      <Link href={`/admin/messages/${m.id}`} className="block max-w-md text-slate-700 hover:text-brand-800" dir="auto">
        <span className="line-clamp-2">{m.message}</span>
      </Link>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    filterFn: "equalsString",
    cell: ({ row: { original: m } }) => (
      <StatusSelect inbox="messages" id={m.id} status={m.status} statuses={messageStatuses} label={`Status for message from ${m.name}`} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    cell: ({ row: { original: m } }) => <DeleteButton inbox="messages" id={m.id} name={m.name} />,
  },
];

export function MessagesTable({ rows }: { rows: Message[] }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      filters={[{ column: "status", label: "Status", options: messageStatuses }]}
      searchPlaceholder="Search name, email, phone or message"
      initialSort={[{ id: "createdAt", desc: true }]}
      emptyText="No messages yet. They appear here when someone uses the form on the contact page."
      storageKey="messages"
      bulkActions={(selected, clear) => <BulkActions inbox="messages" ids={selected.map((m) => m.id)} statuses={messageStatuses} clear={clear} />}
    />
  );
}
