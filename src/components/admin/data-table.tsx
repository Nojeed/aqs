"use client";

import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "all"; // Radix Select items can not use an empty value

// Module scope: TanStack Table needs stable feature and row-model inputs.
const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  filterFns: { includesString: filterFn_includesString, equalsString: filterFn_equalsString },
});

// `any` value type so one array can mix string, number and display-only columns.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminColumn<T extends RowData> = ColumnDef<typeof features, T, any>;
export type TableFilter = { column: string; label: string; options: readonly { value: string; label: string }[] };

type Saved = { sorting?: SortingState; columnFilters?: ColumnFiltersState; pageSize?: number };

/**
 * Admin list table: global search, dropdown filters on columns, sortable headers, pagination.
 * Columns used by a filter need an `id`, `filterFn: "equalsString"` and an accessor returning the option value.
 * - `storageKey` remembers sorting, filters and page size in this browser.
 * - `bulkActions` adds row checkboxes and renders its result above the table while rows are selected.
 * - Press "/" anywhere on the page to jump to the search box.
 */
export function DataTable<T extends RowData & { id: string }>({
  data,
  columns,
  filters = [],
  searchPlaceholder = "Search",
  initialSort = [],
  emptyText = "Nothing here yet.",
  pageSize = 25,
  storageKey,
  bulkActions,
}: {
  data: T[];
  columns: AdminColumn<T>[];
  filters?: TableFilter[];
  searchPlaceholder?: string;
  initialSort?: SortingState;
  emptyText?: string;
  pageSize?: number;
  storageKey?: string;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
}) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    enableRowSelection: Boolean(bulkActions),
    globalFilterFn: "includesString",
    initialState: { sorting: initialSort, pagination: { pageIndex: 0, pageSize } },
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const key = storageKey && `aqs-table:${storageKey}`;

  // Restore the saved view once in the browser (the server render always uses the defaults).
  useEffect(() => {
    if (!key) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as Saved | null;
      if (saved?.sorting) table.setSorting(saved.sorting);
      // Drop remembered filters whose option is gone (e.g. a deleted course), or the table would look empty.
      const valid = saved?.columnFilters?.filter((f) => filters.find((x) => x.column === f.id)?.options.some((o) => o.value === f.value));
      if (valid?.length) table.setColumnFilters(valid);
      if (saved?.pageSize) table.setPageSize(saved.pageSize);
    } catch {
      // Storage blocked or corrupt: keep the defaults.
    }
    // Runs once per table: later changes to the filter options must not reapply the saved view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, table]);

  const { globalFilter, columnFilters, sorting, pagination, rowSelection } = table.state;
  useEffect(() => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ sorting, columnFilters, pageSize: pagination.pageSize } satisfies Saved));
    } catch {
      // Storage blocked: nothing to remember.
    }
  }, [key, sorting, columnFilters, pagination.pageSize]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || el.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = table.getRowModel().rows;
  const filtered = table.getFilteredRowModel().rows.length;
  const active = Boolean(globalFilter) || columnFilters.length > 0;
  const selected = bulkActions ? table.getSelectedRowModel().rows.map((r) => r.original) : [];
  const clearSelection = () => table.resetRowSelection(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            ref={searchRef}
            type="search"
            value={(globalFilter as string) ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && table.setGlobalFilter("")}
            placeholder={searchPlaceholder}
            className="h-10 rounded-lg ps-9 pe-10 md:text-sm"
          />
          <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 text-xs text-slate-400 sm:block">
            /
          </kbd>
        </label>
        {filters.map((f) => {
          const column = table.getColumn(f.column);
          return (
            <Select
              key={f.column}
              value={(column?.getFilterValue() as string) ?? ALL}
              onValueChange={(v) => column?.setFilterValue(v === ALL ? undefined : v)}
            >
              <SelectTrigger aria-label={`Filter by ${f.label}`} className="h-10 w-auto min-w-36 rounded-lg px-3 md:text-sm">
                <span className="text-slate-500">{f.label}:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
        {active && (
          <button
            type="button"
            onClick={() => {
              table.setGlobalFilter("");
              table.resetColumnFilters(true);
            }}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <X className="size-4" aria-hidden /> Clear
          </button>
        )}
        <span className="ms-auto text-sm text-slate-500 tabular-nums">
          {filtered === data.length ? `${data.length} total` : `${filtered} of ${data.length}`}
        </span>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50/70 px-4 py-2.5 text-sm" role="region" aria-label="Bulk actions">
          <span className="font-semibold text-brand-900 tabular-nums">{selected.length} selected</span>
          {bulkActions?.(selected, clearSelection)}
          <button type="button" onClick={clearSelection} className="ms-auto text-sm font-semibold text-slate-500 hover:text-slate-800">
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {bulkActions && (
                  <th className="w-10 ps-5">
                    <input
                      type="checkbox"
                      aria-label="Select all rows on this page"
                      checked={table.getIsAllPageRowsSelected()}
                      ref={(el) => {
                        if (el) el.indeterminate = table.getIsSomePageRowsSelected();
                      }}
                      onChange={() => table.toggleAllPageRowsSelected()}
                      className="size-4 cursor-pointer rounded"
                    />
                  </th>
                )}
                {group.headers.map((header) => {
                  const sort = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
                      className="px-5 py-3 text-start whitespace-nowrap"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 uppercase transition hover:bg-slate-200/70 hover:text-slate-800"
                        >
                          <table.FlexRender header={header} />
                          {sort === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : sort === "desc" ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row.id}
                data-selected={rowSelection[row.id] ? "" : undefined}
                className="transition-colors hover:bg-brand-50/40 data-selected:bg-brand-50/70"
              >
                {bulkActions && (
                  <td className="ps-5">
                    <input
                      type="checkbox"
                      aria-label="Select row"
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      className="size-4 cursor-pointer rounded"
                    />
                  </td>
                )}
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3 align-middle">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-10 text-center text-slate-500">{active ? "No rows match these filters." : emptyText}</p>
        )}
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3 text-sm text-slate-500">
          <span className="tabular-nums">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="admin-btn"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="admin-btn"
            aria-label="Next page"
          >
            <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
