"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  clearSessionCookie,
  authConfigError,
  requireAdmin,
  setSessionCookie,
} from "@/lib/auth";
import { CONTENT_TAG, readCollection } from "@/lib/content";
import { collections, isCollection, sanitizeObject, siteFields, slugify } from "@/lib/schema";
import { writeJson } from "@/lib/storage";

export type ActionResult = { ok: true; id?: string; message?: string } | { ok: false; error: string };

/* --------------------------------------------------------------- auth */

// Simple in-memory brute-force protection: 5 failures per IP locks it out for 10 minutes.
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const configError = authConfigError();
  if (configError) return { ok: false, error: `Admin login is not configured: ${configError}` };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const entry = attempts.get(ip);
  if (entry && entry.until > Date.now()) {
    return { ok: false, error: "Too many failed attempts. Try again in a few minutes." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    const count = (entry?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= 5 ? Date.now() + 10 * 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "Incorrect username or password." };
  }

  attempts.delete(ip);
  await setSessionCookie();
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ------------------------------------------------------------ content */

export async function saveSite(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  await writeJson("site.json", sanitizeObject(siteFields, data));
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Site content saved." };
}

export async function saveItem(collection: string, id: string | null, data: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isCollection(collection)) return { ok: false, error: "Unknown collection." };
  const config = collections[collection];
  const items = (await readCollection(collection)) as unknown as Record<string, unknown>[];
  const clean = sanitizeObject(config.fields, data) as Record<string, unknown> & {
    slug: string;
    title: { en: string; ar: string };
  };

  if (!clean.title.en.trim() && !clean.title.ar.trim()) return { ok: false, error: "Please enter a title." };

  clean.slug = slugify(clean.slug || clean.title.en) || `${config.singular}-${randomBytes(3).toString("hex")}`;
  if (items.some((item) => item.slug === clean.slug && item.id !== id)) {
    return { ok: false, error: `Another ${config.singular} already uses the URL slug “${clean.slug}”.` };
  }

  let savedId = id;
  if (id) {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return { ok: false, error: "This item no longer exists. It may have been deleted." };
    items[index] = { id, ...clean };
  } else {
    savedId = `${config.singular}-${randomBytes(5).toString("hex")}`;
    items.push({ id: savedId, ...clean });
  }

  await writeJson(config.file, items);
  updateTag(CONTENT_TAG);
  return { ok: true, id: savedId!, message: "Saved." };
}

export async function deleteItem(collection: string, id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isCollection(collection)) return { ok: false, error: "Unknown collection." };
  const config = collections[collection];
  const items = (await readCollection(collection)) as unknown as { id: string }[];
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return { ok: false, error: "Item not found." };
  await writeJson(config.file, next);
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Deleted." };
}

export async function togglePublished(collection: string, id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isCollection(collection)) return { ok: false, error: "Unknown collection." };
  const config = collections[collection];
  const items = (await readCollection(collection)) as unknown as { id: string; published: boolean }[];
  const item = items.find((i) => i.id === id);
  if (!item) return { ok: false, error: "Item not found." };
  item.published = !item.published;
  await writeJson(config.file, items);
  updateTag(CONTENT_TAG);
  return { ok: true };
}
