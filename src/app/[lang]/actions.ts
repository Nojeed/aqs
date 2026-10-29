"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { getCourses, getSite } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { sendMessageEmails, sendRegistrationEmails } from "@/lib/mail";
import { sessionAvailability } from "@/lib/sessions";
import { MESSAGES_FILE, REGISTRATIONS_FILE, type Message, type Registration } from "@/lib/schema";
import { lockFile } from "@/lib/lock";
import { withinRetention } from "@/lib/retention";
import { readJson, writeJson } from "@/lib/storage";
import { clientIp } from "@/lib/client-ip";

type FieldError = "required" | "email" | "phone" | "session" | "full";
export type RegisterResult =
  | { ok: true }
  | { ok: false; error?: "rateLimit" | "generic"; fields?: Partial<Record<"name" | "email" | "phone" | "company" | "session", FieldError>> };

// In-memory throttle per IP: 5 submissions per 10 minutes. Resets on restart, which is fine for spam bursts.
const recent = new Map<string, number[]>();
const WINDOW = 10 * 60_000;

async function throttled() {
  const ip = clientIp((await headers()).get("x-forwarded-for"));
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (times.length >= 5) return true;
  recent.set(ip, [...times, now]);
  return false;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function register(_prev: RegisterResult | null, formData: FormData): Promise<RegisterResult> {
  // Bots fill every field; people never see this one. Pretend it worked.
  if (formData.get("website")) return { ok: true };

  const field = (key: string, max: number) => String(formData.get(key) ?? "").trim().slice(0, max);
  const type = field("type", 20) === "company" ? "company" : "individual";
  const name = field("name", 120);
  const email = field("email", 200);
  const phone = field("phone", 40);
  const company = type === "company" ? field("company", 160) : "";
  const notes = field("notes", 2000);
  const locale = field("locale", 5);

  const fields: NonNullable<Extract<RegisterResult, { ok: false }>["fields"]> = {};
  if (!name) fields.name = "required";
  if (!isEmail(email)) fields.email = email ? "email" : "required";
  if (phone.replace(/\D/g, "").length < 7) fields.phone = phone ? "phone" : "required";
  if (type === "company" && !company) fields.company = "required";
  if (Object.keys(fields).length) return { ok: false, fields };

  const courseId = field("courseId", 80);
  const course = courseId === "custom" ? null : (await getCourses()).find((c) => c.id === courseId);
  if ((courseId !== "custom" && !course) || !isLocale(locale)) return { ok: false, error: "generic" };
  const trainees = type === "company" ? Math.min(500, Math.max(1, Math.round(Number(formData.get("trainees")) || 1))) : 1;

  // Courses with dates: a date must be picked and have enough seats for everyone being registered.
  // Seats are counted while holding the file, so two people can't both take the last one.
  using _lock = await lockFile(REGISTRATIONS_FILE);
  const sessions = course ? await sessionAvailability(course) : [];
  const session = sessions.find((s) => s.key === field("session", 200));
  if (sessions.length && !session) return { ok: false, fields: { session: "session" } };
  if (session && session.left !== null && session.left < trainees) return { ok: false, fields: { session: "full" } };
  if (await throttled()) return { ok: false, error: "rateLimit" };

  const entry: Registration = {
    id: `reg-${randomBytes(5).toString("hex")}`,
    createdAt: new Date().toISOString(),
    status: "new",
    type,
    name,
    email,
    phone,
    ...(type === "company" && { company, trainees }),
    ...(session && { session: session.key }),
    courseId,
    courseTitle: course ? course.title.en || course.title.ar : "Custom / in-house training",
    ...(notes && { notes }),
    locale,
  };
  // Entries past the admin's keep period are dropped on the next save.
  const list = withinRetention(await readJson<Registration[]>(REGISTRATIONS_FILE), (await getSite()).privacy?.retentionMonths);
  list.push(entry);
  await writeJson(REGISTRATIONS_FILE, list);
  after(() => sendRegistrationEmails(entry)); // after the response: email never slows the form down
  return { ok: true };
}

export type MessageResult =
  | { ok: true }
  | { ok: false; error?: "rateLimit" | "generic"; fields?: Partial<Record<"name" | "email" | "message", FieldError>> };

export async function sendMessage(_prev: MessageResult | null, formData: FormData): Promise<MessageResult> {
  if (formData.get("website")) return { ok: true };

  const field = (key: string, max: number) => String(formData.get(key) ?? "").trim().slice(0, max);
  const name = field("name", 120);
  const email = field("email", 200);
  const phone = field("phone", 40);
  const message = field("message", 4000);
  const locale = field("locale", 5);

  const fields: NonNullable<Extract<MessageResult, { ok: false }>["fields"]> = {};
  if (!name) fields.name = "required";
  if (!isEmail(email)) fields.email = email ? "email" : "required";
  if (!message) fields.message = "required";
  if (Object.keys(fields).length) return { ok: false, fields };
  if (!isLocale(locale)) return { ok: false, error: "generic" };
  if (await throttled()) return { ok: false, error: "rateLimit" };

  using _lock = await lockFile(MESSAGES_FILE);
  const entry: Message = {
    id: `msg-${randomBytes(5).toString("hex")}`,
    createdAt: new Date().toISOString(),
    status: "new",
    name,
    email,
    ...(phone && { phone }),
    message,
    locale,
  };
  const list = withinRetention(await readJson<Message[]>(MESSAGES_FILE), (await getSite()).privacy?.retentionMonths);
  list.push(entry);
  await writeJson(MESSAGES_FILE, list);
  after(() => sendMessageEmails(entry));
  return { ok: true };
}
