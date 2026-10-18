"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { LevelIcon } from "@/components/level-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dir, getDictionary, type Locale } from "@/lib/i18n";
import { ease } from "@/lib/motion";
import type { Course } from "@/lib/schema";

type Item = Pick<Course, "id" | "level" | "format" | "startDate"> & { category: string; title: string; card: ReactNode };

const ALL = "all"; // Radix Select items can not use an empty value

/** Plain grid shown in the static HTML and until the filters hydrate. */
export function CourseGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.id}>{i.card}</li>
      ))}
    </ul>
  );
}

/**
 * Filters server-rendered course cards in place: search, level, format and category.
 * Filters live in the URL (?q=&level=&format=&category=) so a filtered list can be shared.
 */
export function CourseFilters({ locale, items }: { locale: Locale; items: Item[] }) {
  const d = getDictionary(locale).courses;
  const f = d.filters;
  const params = useSearchParams();
  const [filters, setFilters] = useState({
    q: params.get("q") ?? "",
    level: params.get("level") ?? "",
    format: params.get("format") ?? "",
    category: params.get("category") ?? "",
    sort: params.get("sort") === "upcoming" ? "upcoming" : "",
  });
  const { q: query, level, format, category } = filters;

  const update = (next: Partial<typeof filters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    const search = new URLSearchParams(Object.entries(merged).filter(([, v]) => v));
    // Next keeps useSearchParams in sync with the native History API, without a navigation.
    window.history.replaceState(null, "", search.size ? `?${search}` : window.location.pathname);
  };
  const setQuery = (v: string) => update({ q: v });
  const setLevel = (v: string) => update({ level: v });
  const setFormat = (v: string) => update({ format: v });
  const setCategory = (v: string) => update({ category: v });

  // Only offer values that at least one course has.
  const levels = (Object.keys(d.levels) as Course["level"][]).filter((v) => items.some((i) => i.level === v));
  const formats = (Object.keys(d.formats) as Course["format"][]).filter((v) => items.some((i) => i.format === v));
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale));

  const needle = query.trim().toLocaleLowerCase(locale);
  const shown = items.filter(
    (i) =>
      (!needle || i.title.toLocaleLowerCase(locale).includes(needle) || i.category.toLocaleLowerCase(locale).includes(needle)) &&
      (!level || i.level === level) &&
      (!format || i.format === format) &&
      (!category || i.category === category),
  );
  // Upcoming first: dated courses by start date, undated ones keep their order at the end.
  if (filters.sort === "upcoming") {
    shown.sort((a, b) => (a.startDate || "9999").localeCompare(b.startDate || "9999"));
  }
  const active = Boolean(needle || level || format || category);

  const select = (id: string, label: string, value: string, onChange: (v: string) => void, options: [string, string][]) => (
    <div>
      <Label htmlFor={id} className="text-xs font-bold tracking-wide text-slate-500 uppercase">
        {label}
      </Label>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)} dir={dir(locale)}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{f.any}</SelectItem>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {id === "filter-level" ? (
                <span className="inline-flex items-center gap-2">
                  <LevelIcon level={v} className="size-4 text-brand-600" />
                  {l}
                </span>
              ) : (
                l
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <div className="card grid gap-4 p-4 sm:p-5 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:items-end">
        <div>
          <Label htmlFor="course-search" className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {f.search}
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              id="course-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={f.search}
              className="ps-10"
            />
          </div>
        </div>
        {select("filter-level", f.level, level, setLevel, levels.map((v) => [v, d.levels[v]]))}
        {select("filter-format", f.format, format, setFormat, formats.map((v) => [v, d.formats[v]]))}
        {select("filter-category", f.category, category, setCategory, categories.map((v) => [v, v]))}
      </div>

      <div className="mt-6 flex min-h-9 items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p aria-live="polite">
            {f.count}: <span className="font-semibold text-brand-950 tabular-nums">{shown.length}</span> / {items.length}
          </p>
          <Select value={filters.sort || "default"} onValueChange={(v) => update({ sort: v === "upcoming" ? "upcoming" : "" })} dir={dir(locale)}>
            <SelectTrigger aria-label={f.sort} className="h-9 w-auto gap-2 rounded-full px-4 text-sm">
              <span className="text-slate-500">{f.sort}:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{f.sortDefault}</SelectItem>
              <SelectItem value="upcoming">{f.sortUpcoming}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {active && (
          <button
            type="button"
            onClick={() => update({ q: "", level: "", format: "", category: "" })}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <X className="size-4" aria-hidden />
            {f.clear}
          </button>
        )}
      </div>

      {/* Cards fade out/in and the rest glide to their new places (Motion layout animations). */}
      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((i) => (
            <motion.li
              key={i.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease }}
            >
              {i.card}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <AnimatePresence>
        {shown.length === 0 && (
          <motion.p
            key="none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500"
          >
            {f.none}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
