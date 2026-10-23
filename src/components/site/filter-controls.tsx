"use client";

import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dir, type Locale } from "@/lib/i18n";

const ALL = "all"; // Radix Select items can not use an empty value
const labelClass = "text-xs font-bold tracking-wide text-slate-500 uppercase";

/**
 * Filter values kept in the URL (?q=&topic=…) so a filtered list can be shared or bookmarked.
 * Next keeps useSearchParams in sync with the native History API, so no navigation happens.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const params = useSearchParams();
  const [values, setValues] = useState(() => Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""])) as Record<K, string>);
  const update = (next: Partial<Record<K, string>>) => {
    const merged = { ...values, ...next };
    setValues(merged);
    const search = new URLSearchParams(Object.entries(merged as Record<string, string>).filter(([, v]) => v));
    window.history.replaceState(null, "", search.size ? `?${search}` : window.location.pathname);
  };
  return [values, update] as const;
}

/** The white bar holding the filter controls; wraps nicely whatever number of controls is switched on. */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="card flex flex-wrap items-end gap-4 p-4 sm:p-5 [&>*]:min-w-44 [&>*]:flex-1">{children}</div>;
}

export function FilterSearch({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="sm:flex-[1.6]">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <Input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="ps-10" />
      </div>
    </div>
  );
}

export function FilterSelect({
  id,
  label,
  anyLabel,
  value,
  onChange,
  options,
  locale,
}: {
  id: string;
  label: string;
  anyLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: ReactNode }[];
  locale: Locale;
}) {
  return (
    <div>
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)} dir={dir(locale)}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{anyLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Small pill select for sorting, sitting next to the results count. */
export function SortSelect({
  label,
  value,
  onChange,
  options,
  locale,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  locale: Locale;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)} dir={dir(locale)}>
      <SelectTrigger aria-label={label} className="h-9 w-auto gap-2 rounded-full px-4 text-sm">
        <span className="text-slate-500">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ClearFilters({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-brand-700 transition hover:bg-brand-50"
    >
      <X className="size-4" aria-hidden />
      {label}
    </button>
  );
}
