import "server-only";
import { promises as fs } from "node:fs";
import { dataPath, writeFileAtomic } from "./storage";

/** Page views per detail page and day: { "courses/haccp-level-3": { "2026-10-18": 12 } }. No personal data. */
type Views = Record<string, Record<string, number>>;

export const VIEW_TYPES = ["courses", "posts", "services"] as const;
export type ViewType = (typeof VIEW_TYPES)[number];

const FILE = "views.json";
const KEEP_DAYS = 120;
const DAY = 86_400_000;

async function read(): Promise<Views> {
  try {
    return JSON.parse(await fs.readFile(dataPath(FILE), "utf8")) as Views;
  } catch {
    return {}; // first view, or unreadable: counts are not worth failing a request over
  }
}

// shortcut: writes are queued per server process; with several processes some counts can be lost, use a database then.
let queue: Promise<unknown> = Promise.resolve();

/** Count one view. Not backed up (counters only), and days older than 120 are dropped. */
export function recordView(type: ViewType, slug: string) {
  queue = queue
    .then(async () => {
      const views = await read();
      const days = (views[`${type}/${slug}`] ??= {});
      const today = new Date().toISOString().slice(0, 10);
      days[today] = (days[today] ?? 0) + 1;
      const cutoff = new Date(Date.now() - KEEP_DAYS * DAY).toISOString().slice(0, 10);
      for (const day of Object.keys(days)) if (day < cutoff) delete days[day];
      await writeFileAtomic(dataPath(FILE), JSON.stringify(views));
    })
    .catch(() => {});
  return queue;
}

/** Views per slug over the last `days` days, most viewed first. */
export async function topViews(type: ViewType, days = 30) {
  const views = await read();
  const since = new Date(Date.now() - days * DAY).toISOString().slice(0, 10);
  return Object.entries(views)
    .filter(([key]) => key.startsWith(`${type}/`))
    .map(([key, perDay]) => ({
      slug: key.slice(type.length + 1),
      count: Object.entries(perDay).reduce((n, [day, c]) => (day >= since ? n + c : n), 0),
    }))
    .filter((v) => v.count > 0)
    .sort((a, b) => b.count - a.count);
}
