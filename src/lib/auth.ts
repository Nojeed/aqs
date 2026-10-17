import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

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

export function checkCredentials(username: string, password: string) {
  if (authConfigError()) return false;
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const userOk = safeEqual(username.trim().toLowerCase(), expectedUser.toLowerCase());
  const passOk = safeEqual(password, process.env.ADMIN_PASSWORD!);
  return userOk && passOk;
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_DAYS * 86_400_000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || authConfigError()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function setSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
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

export async function isAdmin() {
  // Session checks compare against the current time, so they must run per request, never in a prerender.
  await connection();
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
