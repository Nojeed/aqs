"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { AnimatedCount, AnimatedGrid } from "@/components/site/animated-grid";
import { ClearFilters, FilterBar, FilterSearch, FilterSelect, SortSelect, useUrlFilters } from "@/components/site/filter-controls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { easeLuxe } from "@/lib/motion";
import type { FilterKey } from "@/lib/schema";

/** Posts arrive newest first. `lead` is the large featured card for the newest post. */
type Item = { id: string; topic: string; year: string; title: string; excerpt: string; card: ReactNode };

const grid = "grid gap-10 sm:grid-cols-2 lg:grid-cols-3";

/** Static layout (featured post + grid) shown in the HTML and until the filters hydrate. */
export function BlogList({ lead, items }: { lead: ReactNode; items: Item[] }) {
  return (
    <>
      {lead}
      {items.length > 1 && (
        <ul className={`mt-16 ${grid}`}>
          {items.slice(1).map((i) => (
            <li key={i.id}>{i.card}</li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * Blog filters: search, topic (from the posts' categories), year, newest/oldest. While nothing is filtered the
 * newest post stays featured; filtering shows every match in the grid. The admin picks which filters show.
 */
export function BlogFilters({ locale, lead, items, show }: { locale: Locale; lead: ReactNode; items: Item[]; show: Record<FilterKey, boolean> }) {
  const f = getDictionary(locale).blog.filters;
  const [filters, update] = useUrlFilters(["q", "topic", "year", "sort"] as const);
  // A filter the admin switched off is ignored even if an old shared link still carries it.
  const query = show.blogSearch ? filters.q : "";
  const topic = show.blogTopic ? filters.topic : "";
  const year = show.blogYear ? filters.year : "";
  const oldest = show.blogSort && filters.sort === "oldest";

  const topics = [...new Set(items.map((i) => i.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale));
  const years = [...new Set(items.map((i) => i.year).filter(Boolean))].sort().reverse();

  const needle = query.trim().toLocaleLowerCase(locale);
  const shown = items.filter(
    (i) =>
      (!needle || [i.title, i.excerpt, i.topic].some((text) => text.toLocaleLowerCase(locale).includes(needle))) &&
      (!topic || i.topic === topic) &&
      (!year || i.year === year),
  );
  if (oldest) shown.reverse();
  const active = Boolean(needle || topic || year);
  const featured = !active && !oldest && shown.length > 0;
  const anyControl = show.blogSearch || show.blogTopic || show.blogYear;

  return (
    <>
      {anyControl && (
        <FilterBar>
          {show.blogSearch && <FilterSearch id="blog-search" label={f.search} value={filters.q} onChange={(q) => update({ q })} />}
          {show.blogTopic && topics.length > 0 && (
            <FilterSelect
              id="filter-topic"
              label={f.topic}
              anyLabel={f.any}
              value={topic}
              onChange={(topic) => update({ topic })}
              locale={locale}
              options={topics.map((v) => ({ value: v, label: v }))}
            />
          )}
          {show.blogYear && years.length > 0 && (
            <FilterSelect
              id="filter-year"
              label={f.year}
              anyLabel={f.any}
              value={year}
              onChange={(year) => update({ year })}
              locale={locale}
              options={years.map((v) => ({ value: v, label: <span className="tabular-nums">{v}</span> }))}
            />
          )}
        </FilterBar>
      )}

      {(anyControl || show.blogSort) && (
        <div className="mt-6 mb-10 flex min-h-9 items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p aria-live="polite">
              {f.count}: <AnimatedCount value={shown.length} /> / {items.length}
            </p>
            {show.blogSort && (
              <SortSelect
                label={f.sort}
                value={oldest ? "oldest" : "newest"}
                onChange={(v) => update({ sort: v === "oldest" ? "oldest" : "" })}
                locale={locale}
                options={[
                  { value: "newest", label: f.newest },
                  { value: "oldest", label: f.oldest },
                ]}
              />
            )}
          </div>
          {active && <ClearFilters label={f.clear} onClick={() => update({ q: "", topic: "", year: "" })} />}
        </div>
      )}

      <AnimatePresence initial={false}>
        {featured && (
          <motion.div
            key="lead"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transitionEnd: { filter: "none" },
              transition: { duration: 0.8, ease: easeLuxe, delay: 0.15 },
            }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
            className="mb-16"
          >
            {lead}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatedGrid className={grid} empty={f.none} items={(featured ? shown.slice(1) : shown).map((i) => ({ id: i.id, node: i.card }))} />
    </>
  );
}
