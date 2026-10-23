"use client";

import type { ReactNode } from "react";
import { LevelIcon } from "@/components/level-icon";
import { AnimatedCount, AnimatedGrid } from "@/components/site/animated-grid";
import { ClearFilters, FilterBar, FilterSearch, FilterSelect, SortSelect, useUrlFilters } from "@/components/site/filter-controls";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Course, FilterKey } from "@/lib/schema";

type Item = Pick<Course, "id" | "level" | "format" | "startDate"> & { category: string; title: string; card: ReactNode };

const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

/** Plain grid shown in the static HTML and until the filters hydrate. */
export function CourseGrid({ items }: { items: Item[] }) {
  return (
    <ul className={grid}>
      {items.map((i) => (
        <li key={i.id}>{i.card}</li>
      ))}
    </ul>
  );
}

/**
 * Filters server-rendered course cards in place: search, level, format, category and sort.
 * The admin decides which of these visitors see (Site content → Filters on the website).
 */
export function CourseFilters({ locale, items, show }: { locale: Locale; items: Item[]; show: Record<FilterKey, boolean> }) {
  const d = getDictionary(locale).courses;
  const f = d.filters;
  const [filters, update] = useUrlFilters(["q", "level", "format", "category", "sort"] as const);
  // A filter the admin switched off is ignored even if an old shared link still carries it.
  const query = show.courseSearch ? filters.q : "";
  const level = show.courseLevel ? filters.level : "";
  const format = show.courseFormat ? filters.format : "";
  const category = show.courseCategory ? filters.category : "";
  const sort = show.courseSort && filters.sort === "upcoming" ? "upcoming" : "";

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
  if (sort) shown.sort((a, b) => (a.startDate || "9999").localeCompare(b.startDate || "9999"));
  const active = Boolean(needle || level || format || category);
  const anyControl = show.courseSearch || show.courseLevel || show.courseFormat || show.courseCategory;

  return (
    <>
      {anyControl && (
        <FilterBar>
          {show.courseSearch && <FilterSearch id="course-search" label={f.search} value={filters.q} onChange={(q) => update({ q })} />}
          {show.courseLevel && (
            <FilterSelect
              id="filter-level"
              label={f.level}
              anyLabel={f.any}
              value={level}
              onChange={(level) => update({ level })}
              locale={locale}
              options={levels.map((v) => ({
                value: v,
                label: (
                  <span className="inline-flex items-center gap-2">
                    <LevelIcon level={v} className="size-4 text-brand-600" />
                    {d.levels[v]}
                  </span>
                ),
              }))}
            />
          )}
          {show.courseFormat && (
            <FilterSelect
              id="filter-format"
              label={f.format}
              anyLabel={f.any}
              value={format}
              onChange={(format) => update({ format })}
              locale={locale}
              options={formats.map((v) => ({ value: v, label: d.formats[v] }))}
            />
          )}
          {show.courseCategory && (
            <FilterSelect
              id="filter-category"
              label={f.category}
              anyLabel={f.any}
              value={category}
              onChange={(category) => update({ category })}
              locale={locale}
              options={categories.map((v) => ({ value: v, label: v }))}
            />
          )}
        </FilterBar>
      )}

      {(anyControl || show.courseSort) && (
        <div className="mt-6 flex min-h-9 items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p aria-live="polite">
              {f.count}: <AnimatedCount value={shown.length} /> / {items.length}
            </p>
            {show.courseSort && (
              <SortSelect
                label={f.sort}
                value={sort || "default"}
                onChange={(v) => update({ sort: v === "upcoming" ? "upcoming" : "" })}
                locale={locale}
                options={[
                  { value: "default", label: f.sortDefault },
                  { value: "upcoming", label: f.sortUpcoming },
                ]}
              />
            )}
          </div>
          {active && <ClearFilters label={f.clear} onClick={() => update({ q: "", level: "", format: "", category: "" })} />}
        </div>
      )}

      <AnimatedGrid className={`mt-4 ${grid}`} empty={f.none} items={shown.map((i) => ({ id: i.id, node: i.card }))} />
    </>
  );
}
