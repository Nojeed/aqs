import { headers } from "next/headers";
import { getCourses, getPosts, getServices } from "@/lib/content";
import { recordView, VIEW_TYPES, type ViewType } from "@/lib/views";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|headless/i;
const lists = { courses: getCourses, posts: getPosts, services: getServices } satisfies Record<ViewType, () => Promise<{ slug: string }[]>>;

// Same visitor and page counted at most once per 30 minutes (on top of the once-per-session browser check).
const seen = new Map<string, number>();
const REPEAT = 30 * 60_000;

/** Count a page view for the admin dashboard. Anonymous: no cookies, nothing personal is stored. */
export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  const h = await headers();
  if (BOT.test(h.get("user-agent") ?? "")) return done;

  const body = (await request.json().catch(() => null)) as { type?: string; slug?: string } | null;
  const type = body?.type as ViewType;
  const slug = String(body?.slug ?? "");
  if (!VIEW_TYPES.includes(type) || !/^[a-z0-9-]{1,100}$/.test(slug)) return done;
  // Only real, published pages: stops junk keys from growing the file.
  if (!(await lists[type]()).some((item) => item.slug === slug)) return done;

  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}|${type}/${slug}`;
  const now = Date.now();
  if (now - (seen.get(key) ?? 0) < REPEAT) return done;
  if (seen.size > 10_000) seen.clear();
  seen.set(key, now);

  await recordView(type, slug);
  return done;
}
