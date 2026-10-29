import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { lockFile } from "./lock";
import { hashPassword, verifyPassword } from "./password";
import { readJson, writeJson } from "./storage";

/**
 * Admin accounts. The owner account from the server environment (ADMIN_USERNAME / ADMIN_PASSWORD) always
 * exists. Staff accounts, and the owner's password once changed in the admin, live in users.json.
 * To recover a forgotten owner password, remove the owner's entry from users.json on the server.
 */
export const USERS_FILE = "users.json";

export type Role = "owner" | "staff";
export type AdminUser = { username: string; name: string; role: Role; passwordHash: string; changedAt: string; createdAt: string };
/** What a session knows about who is signed in. `v` changes with the password, ending other sessions. */
export type SessionUser = { username: string; name: string; role: Role; v: string };

export const ownerUsername = () => (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
export const readUsers = () => readJson<AdminUser[]>(USERS_FILE);
export const writeUsers = (users: AdminUser[]) => writeJson(USERS_FILE, users);

function safeEqual(a: string, b: string) {
  // Hash first so inputs of different lengths still compare in constant time.
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

const toSession = (u: AdminUser): SessionUser => ({ username: u.username, name: u.name, role: u.role, v: u.changedAt });
const envOwner = (): SessionUser => ({ username: ownerUsername(), name: "Owner", role: "owner", v: "env" });

/** Check a username and password; returns the signed-in user or null. */
export async function authenticate(username: string, password: string): Promise<SessionUser | null> {
  const name = username.trim().toLowerCase();
  const stored = (await readUsers()).find((u) => u.username === name);
  if (stored) return verifyPassword(password, stored.passwordHash) ? toSession(stored) : null;
  if (name === ownerUsername() && safeEqual(password, process.env.ADMIN_PASSWORD ?? "")) return envOwner();
  return null;
}

/** Is the user behind a session still valid (not removed, password unchanged)? Returns their current details. */
export async function currentUser(username: string, v: string): Promise<SessionUser | null> {
  const stored = (await readUsers()).find((u) => u.username === username);
  if (stored) return stored.changedAt === v ? toSession(stored) : null;
  return username === ownerUsername() && v === "env" ? envOwner() : null;
}

/** Set a password (for the owner too: the first change moves the owner into users.json). */
export async function setPassword(username: string, password: string, defaults?: { name: string; role: Role }) {
  using _lock = await lockFile(USERS_FILE);
  const users = await readUsers();
  const now = new Date().toISOString();
  const existing = users.find((u) => u.username === username);
  if (existing) Object.assign(existing, { passwordHash: hashPassword(password), changedAt: now });
  else if (defaults) users.push({ username, ...defaults, passwordHash: hashPassword(password), changedAt: now, createdAt: now });
  else return false;
  await writeUsers(users);
  return true;
}
