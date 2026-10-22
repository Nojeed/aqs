import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { currentUser, type SessionUser } from "./users";

export const SESSION_COOKIE = "aqs_admin";
const SESSION_DAYS = 7;

export function authConfigError(): string | null {
  if (!process.env.ADMIN_PASSWORD) return "ADMIN_PASSWORD is not set.";
  if ((process.env.SESSION_SECRET ?? "").length < 32) return "SESSION_SECRET must be at least 32 characters.";
  return null;
}

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "").update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash first so inputs of different lengths still compare in constant time.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

type Payload = { exp: number; u: string; v: string };

export function createSessionToken(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_DAYS * 86_400_000, u: user.username, v: user.v } satisfies Payload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token: string | undefined): Payload | null {
  if (!token || authConfigError()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Payload;
    // Tokens from before staff accounts have no user: treat them as signed out.
    return typeof data.exp === "number" && data.exp > Date.now() && data.u && data.v ? data : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in admin, or null. Removed users and changed passwords end their sessions. */
export async function getSession(): Promise<SessionUser | null> {
  // Session checks compare against the current time, so they must run per request, never in a prerender.
  await connection();
  const data = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  return data ? currentUser(data.u, data.v) : null;
}

export async function isAdmin() {
  return Boolean(await getSession());
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Owner-only pages and actions (users, activity log). Staff are sent back to the dashboard. */
export async function requireOwner() {
  const session = await requireAdmin();
  if (session.role !== "owner") redirect("/admin");
  return session;
}
