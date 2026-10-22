"use client";

import { DataTable, type AdminColumn } from "@/components/admin/data-table";

type Row = { id: string; at: string; user: string; action: string; target?: string };

const columns: AdminColumn<Row>[] = [
  {
    id: "at",
    header: "When",
    accessorKey: "at",
    enableGlobalFilter: false,
    cell: (c) => (
      <span className="whitespace-nowrap text-slate-500 tabular-nums">
        {new Date(c.getValue() as string).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
      </span>
    ),
  },
  { id: "user", header: "Who", accessorKey: "user", filterFn: "equalsString", cell: (c) => <span className="font-mono text-xs">{c.getValue() as string}</span> },
  { id: "action", header: "What", accessorKey: "action", cell: (c) => <span className="font-medium text-slate-800">{c.getValue() as string}</span> },
  { id: "target", header: "Item", accessorFn: (r) => r.target ?? "", cell: (c) => <span className="text-slate-500">{c.getValue() as string}</span> },
];

export function ActivityTable({ rows }: { rows: Row[] }) {
  const users = [...new Set(rows.map((r) => r.user))].sort().map((u) => ({ value: u, label: u }));
  return (
    <DataTable
      data={rows}
      columns={columns}
      filters={[{ column: "user", label: "Who", options: users }]}
      searchPlaceholder="Search actions and items"
      initialSort={[{ id: "at", desc: true }]}
      emptyText="Nothing recorded yet. Sign-ins and every change in the admin appear here."
      pageSize={50}
      storageKey="activity"
    />
  );
}
