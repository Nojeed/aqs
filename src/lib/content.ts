import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readJson } from "./storage";
import { collections, upcomingSessions, type CollectionItem, type CollectionName, type Site } from "./schema";

/** Every public read is tagged with this so admin saves can refresh the site instantly. */
export const CONTENT_TAG = "content";

export async function getSite(): Promise<Site> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return readJson<Site>("site.json");
}

/** Raw collection, including unpublished items. Admin pages use readCollection() instead. */
async function getAll<C extends CollectionName>(name: C): Promise<CollectionItem[C][]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return readJson<CollectionItem[C][]>(collections[name].file);
}

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

export async function getServices() {
  return (await getAll("services")).filter((s) => s.published).sort(byOrder);
}

export async function getCourses() {
  // Cached because it reads today's date (for the next session); refreshed hourly and on every admin save.
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return (await getAll("courses"))
    .filter((c) => c.published)
    .sort(byOrder)
    // With dates listed, the card's start date is the next upcoming one.
    .map((c) => ({ ...c, startDate: upcomingSessions(c.sessions)[0]?.date ?? c.startDate }));
}

export async function getPosts() {
  return (await getAll("posts"))
    .filter((p) => p.published)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

export async function getCourse(slug: string) {
  return (await getCourses()).find((c) => c.slug === slug) ?? null;
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

/** Uncached read for the admin panel, so editors always see what is on disk. */
export async function readCollection<C extends CollectionName>(name: C) {
  return readJson<CollectionItem[C][]>(collections[name].file);
}

export async function readSite() {
  return readJson<Site>("site.json");
}

/** Current year for the footer; cached so it can be part of the prerendered shell. */
export async function getYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
