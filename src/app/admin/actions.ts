"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { authConfigError, clearSessionCookie, getSession, requireAdmin, requireOwner, setSessionCookie } from "@/lib/auth";
import { passwordProblem } from "@/lib/password";
import { USERS_FILE, authenticate, ownerUsername, readUsers, setPassword, writeUsers, type Role } from "@/lib/users";
import { lockFile } from "@/lib/lock";
import { CERTIFICATES_FILE, nextCertificateId, parseCertificates, readCertificates, type Certificate } from "@/lib/certificates";
import { CONTENT_TAG, readCollection } from "@/lib/content";
import {
  certificateFields,
  collections,
  isCollection,
  DATA_FILES,
  GRADES,
  MESSAGES_FILE,
  NONE,
  messageStatuses,
  REGISTRATIONS_FILE,
  registrationStatuses,
  sanitizeObject,
  siteFields,
  slugify,
} from "@/lib/schema";
import { readBackup, readJson, writeJson } from "@/lib/storage";
import { clientIp } from "@/lib/client-ip";

export type ActionResult = { ok: true; id?: string; message?: string } | { ok: false; error: string };

/* --------------------------------------------------------------- auth */

// Simple in-memory brute-force protection: 5 failures per IP locks it out for 10 minutes.
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const configError = authConfigError();
  if (configError) return { ok: false, error: `Admin login is not configured: ${configError}` };

  const ip = clientIp((await headers()).get("x-forwarded-for"));
  const entry = attempts.get(ip);
  if (entry && entry.until > Date.now()) {
    return { ok: false, error: "Too many failed attempts. Try again in a few minutes." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await authenticate(username, password);
  if (!user) {
    const count = (entry?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= 5 ? Date.now() + 10 * 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "Incorrect username or password." };
  }

  attempts.delete(ip);
  await setSessionCookie(user);
  await audit("Signed in", undefined, user.username);
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  if (session) await audit("Signed out", undefined, session.username);
  await clearSessionCookie();
  redirect("/admin/login");
}

/* -------------------------------------------------------------- users */

/** Change your own password. The owner's first change moves the owner into users.json. */
export async function changeOwnPassword(current: string, next: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!(await authenticate(session.username, String(current ?? "")))) return { ok: false, error: "Your current password is not correct." };
  const problem = passwordProblem(String(next ?? ""));
  if (problem) return { ok: false, error: problem };
  await setPassword(session.username, next, { name: session.name, role: session.role });
  // The password version changed, so this browser needs a fresh session too.
  const users = await readUsers();
  const me = users.find((u) => u.username === session.username)!;
  await setSessionCookie({ username: me.username, name: me.name, role: me.role, v: me.changedAt });
  await audit("Changed own password");
  return { ok: true, message: "Password changed. Other devices signed in with your account are signed out." };
}

const USERNAME = /^[a-z0-9._-]{3,32}$/;

export async function createUser(data: { name: string; username: string; role: string; password: string }): Promise<ActionResult> {
  await requireOwner();
  const name = String(data.name ?? "").trim().slice(0, 80);
  const username = String(data.username ?? "").trim().toLowerCase();
  const role: Role = data.role === "owner" ? "owner" : "staff";
  if (!name) return { ok: false, error: "Enter the person's name." };
  if (!USERNAME.test(username)) return { ok: false, error: "Username: 3–32 lowercase letters, numbers, dots, dashes or underscores." };
  if (username === ownerUsername() || (await readUsers()).some((u) => u.username === username)) {
    return { ok: false, error: `The username “${username}” is already taken.` };
  }
  const problem = passwordProblem(String(data.password ?? ""));
  if (problem) return { ok: false, error: problem };
  await setPassword(username, data.password, { name, role });
  await audit("Added user", `${username} (${role})`);
  return { ok: true, message: `${name} can now sign in as “${username}”.` };
}

export async function resetUserPassword(username: string, password: string): Promise<ActionResult> {
  const session = await requireOwner();
  if (username === session.username) return { ok: false, error: "Use Account to change your own password." };
  const problem = passwordProblem(String(password ?? ""));
  if (problem) return { ok: false, error: problem };
  if (!(await setPassword(username, password))) return { ok: false, error: "User not found." };
  await audit("Reset password", username);
  return { ok: true, message: `New password set for ${username}. They are signed out everywhere.` };
}

export async function deleteUser(username: string): Promise<ActionResult> {
  const session = await requireOwner();
  if (username === session.username) return { ok: false, error: "You can't remove your own account." };
  using _lock = await lockFile(USERS_FILE);
  if (username === ownerUsername()) return { ok: false, error: "The main owner account can't be removed." };
  const users = await readUsers();
  const next = users.filter((u) => u.username !== username);
  if (next.length === users.length) return { ok: false, error: "User not found." };
  await writeUsers(next);
  await audit("Removed user", username);
  return { ok: true, message: `${username} removed and signed out.` };
}

/* ------------------------------------------------------------ content */

export async function saveSite(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  using _lock = await lockFile("site.json");
  await writeJson("site.json", sanitizeObject(siteFields, data));
  updateTag(CONTENT_TAG);
  await audit("Saved site content");
  return { ok: true, message: "Site content saved." };
}

export async function saveItem(collection: string, id: string | null, data: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isCollection(collection)) return { ok: false, error: "Unknown collection." };
  const config = collections[collection];
  using _lock = await lockFile(config.file);
  // Renaming a course can also update certificates below.
  using _certificatesLock = await lockFile(CERTIFICATES_FILE);
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

  const before = id ? items.find((item) => item.id === id) : undefined;
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

  // Renaming a course: certificates issued under the old name follow the new one (English and Arabic).
  const oldTitle = (before?.title as { en?: string; ar?: string } | undefined)?.en;
  if (collection === "courses" && oldTitle && oldTitle !== clean.title.en) {
    const certificates = await readCertificates();
    const renamed = certificates.filter((c) => c.course === oldTitle);
    if (renamed.length) {
      for (const c of renamed) Object.assign(c, { course: clean.title.en || clean.title.ar, courseAr: clean.title.ar });
      await writeJson(CERTIFICATES_FILE, certificates);
      await audit(`Saved ${config.singular}`, clean.title.en || clean.title.ar);
      return { ok: true, id: savedId!, message: `Saved. ${renamed.length} certificate${renamed.length === 1 ? "" : "s"} updated to the new course name.` };
    }
  }
  await audit(`Saved ${config.singular}`, clean.title.en || clean.title.ar);
  return { ok: true, id: savedId!, message: "Saved." };
}

export async function deleteItem(collection: string, id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isCollection(collection)) return { ok: false, error: "Unknown collection." };
  const config = collections[collection];
  using _lock = await lockFile(config.file);
  const items = (await readCollection(collection)) as unknown as { id: string }[];
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return { ok: false, error: "Item not found." };
  await writeJson(config.file, next);
  updateTag(CONTENT_TAG);
  await audit(`Deleted ${config.singular}`, id);
  return { ok: true, message: "Deleted." };
}

/* ------------------------------------------------------- certificates */

export async function saveCertificate(id: string | null, data: unknown): Promise<ActionResult> {
  await requireAdmin();
  using _lock = await lockFile(CERTIFICATES_FILE);
  let list: Certificate[];
  try {
    list = await readCertificates();
  } catch (error) {
    return { ok: false, error: `certificates.json could not be read: ${(error as Error).message}` };
  }
  const index = id ? list.findIndex((c) => c.id === id) : -1;
  if (id && index === -1) return { ok: false, error: "This certificate no longer exists. It may have been deleted." };
  const existing = id ? list[index] : undefined;

  const courses = await readCollection("courses");
  const titleOf = (c: (typeof courses)[number]) => c.title.en || c.title.ar;
  const fields = certificateFields(courses.map(titleOf), { course: existing?.course, grade: existing?.grade });
  const clean = sanitizeObject(fields, data);
  if (!String(clean.name).trim()) return { ok: false, error: "Please enter the trainee's name." };

  // Fill in the Arabic course name and grade so staff only pick once.
  const course = courses.find((c) => titleOf(c) === clean.course);
  if (clean.course === NONE) Object.assign(clean, { course: "", courseAr: "" });
  else if (course) clean.courseAr = course.title.ar;
  const grade = GRADES.find((g) => g.en === clean.grade);
  if (clean.grade === NONE) Object.assign(clean, { grade: "", gradeAr: "" });
  else if (grade) clean.gradeAr = grade.ar;
  if (clean.status === "lifetime") clean.expiryDate = "";
  const certId = id ?? nextCertificateId(list, String(clean.issueDate));
  // Keep any extra fields from an uploaded file; drop empty ones so the file stays tidy.
  const record: Record<string, unknown> = { id: certId, ...existing, ...clean };
  for (const [key, value] of Object.entries(record)) if (value === "" || value === 0) delete record[key];
  if (record.status !== "revoked") delete record.revokedFrom;

  if (index === -1) list.push(record as Certificate);
  else list[index] = record as Certificate;
  await writeJson(CERTIFICATES_FILE, list);
  await audit(id ? "Saved certificate" : "Created certificate", certId);
  return { ok: true, id: certId, message: id ? "Saved." : `Created certificate ${certId}.` };
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  await requireAdmin();
  using _lock = await lockFile(CERTIFICATES_FILE);
  const list = await readCertificates();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return { ok: false, error: "Certificate not found." };
  await writeJson(CERTIFICATES_FILE, next);
  await audit("Deleted certificate", id);
  return { ok: true, message: "Deleted." };
}

export async function toggleCertificateRevoked(id: string): Promise<ActionResult> {
  await requireAdmin();
  using _lock = await lockFile(CERTIFICATES_FILE);
  const list = await readCertificates();
  const cert = list.find((c) => c.id === id);
  if (!cert) return { ok: false, error: "Certificate not found." };
  // Remember what it was, so restoring a "never expires" certificate keeps that.
  const c = cert as Certificate & { revokedFrom?: string };
  if (c.status === "revoked") {
    c.status = c.revokedFrom || "valid";
    delete c.revokedFrom;
  } else {
    c.revokedFrom = c.status || "valid";
    c.status = "revoked";
  }
  await writeJson(CERTIFICATES_FILE, list);
  await audit(c.status === "revoked" ? "Revoked certificate" : "Restored certificate", id);
  return { ok: true };
}

/* ------------------------------------------------- registrations, messages */

type Inbox = { file: string; statuses: readonly { value: string; label: string }[]; noun: string };
const inboxes = {
  registrations: { file: REGISTRATIONS_FILE, statuses: registrationStatuses, noun: "registration" },
  messages: { file: MESSAGES_FILE, statuses: messageStatuses, noun: "message" },
} satisfies Record<string, Inbox>;
type InboxName = keyof typeof inboxes;
type InboxRecord = { id: string; status: string; history?: { at: string; text: string }[] };

/** Set the status of one or more registrations or messages; logs the change in each record's history. */
export async function setInboxStatus(inbox: InboxName, ids: string[], status: string): Promise<ActionResult> {
  await requireAdmin();
  const { file, statuses, noun } = inboxes[inbox];
  using _lock = await lockFile(file);
  const label = statuses.find((s) => s.value === status)?.label;
  if (!label) return { ok: false, error: "Unknown status." };
  const list = await readJson<InboxRecord[]>(file);
  const targets = list.filter((r) => ids.includes(r.id) && r.status !== status);
  if (!targets.length) return { ok: true };
  const at = new Date().toISOString();
  for (const r of targets) {
    r.status = status;
    r.history = [...(r.history ?? []), { at, text: `Status changed to ${label}` }];
  }
  await writeJson(file, list);
  await audit(`Marked ${noun}s ${label}`, `${targets.length} item${targets.length === 1 ? "" : "s"}`);
  return { ok: true, message: `${targets.length} ${noun}${targets.length === 1 ? "" : "s"} marked ${label}.` };
}

export async function deleteInboxRecords(inbox: InboxName, ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  const { file, noun } = inboxes[inbox];
  using _lock = await lockFile(file);
  const list = await readJson<InboxRecord[]>(file);
  const next = list.filter((r) => !ids.includes(r.id));
  const removed = list.length - next.length;
  if (!removed) return { ok: false, error: `${noun[0].toUpperCase()}${noun.slice(1)} not found.` };
  await writeJson(file, next);
  await audit(`Deleted ${noun}s`, `${removed} item${removed === 1 ? "" : "s"}`);
  return { ok: true, message: `Deleted ${removed} ${noun}${removed === 1 ? "" : "s"}.` };
}

/** Internal note on a registration or message (staff only, never shown to the visitor). */
export async function addInboxNote(inbox: InboxName, id: string, text: string): Promise<ActionResult> {
  await requireAdmin();
  const note = String(text ?? "").trim().slice(0, 2000);
  if (!note) return { ok: false, error: "Write a note first." };
  const { file, noun } = inboxes[inbox];
  using _lock = await lockFile(file);
  const list = await readJson<InboxRecord[]>(file);
  const entry = list.find((r) => r.id === id);
  if (!entry) return { ok: false, error: `This ${noun} no longer exists.` };
  entry.history = [...(entry.history ?? []), { at: new Date().toISOString(), text: note }];
  await writeJson(file, list);
  await audit(`Added a note to a ${noun}`, id);
  return { ok: true, message: "Note added." };
}

/* ------------------------------------------------------------ backups */

export async function restoreBackup(name: string): Promise<ActionResult> {
  await requireAdmin();
  const backup = await readBackup(name, Object.keys(DATA_FILES));
  if (!backup) return { ok: false, error: "Backup not found." };
  using _lock = await lockFile(backup.file);
  let data: unknown;
  try {
    data = JSON.parse(backup.text);
    if (backup.file === CERTIFICATES_FILE) parseCertificates(data);
  } catch (error) {
    return { ok: false, error: `This backup can't be restored: ${(error as Error).message}` };
  }
  // writeJson keeps the current version as a backup too, so a restore can itself be undone.
  await writeJson(backup.file, data);
  updateTag(CONTENT_TAG);
  await audit("Restored a backup", name);
  return { ok: true, message: `${DATA_FILES[backup.file as keyof typeof DATA_FILES]} restored.` };
}

/** Move a service or course one place up or down; renumbers the order 1, 2, 3… so it stays clean. */
export async function moveItem(collection: string, id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  if (collection !== "services" && collection !== "courses") return { ok: false, error: "This list has no manual order." };
  const config = collections[collection];
  using _lock = await lockFile(config.file);
  const items = (await readCollection(collection)) as unknown as { id: string; order?: number }[];
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const from = sorted.findIndex((i) => i.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1) return { ok: false, error: "Item not found." };
  if (to < 0 || to >= sorted.length) return { ok: true };
  [sorted[from], sorted[to]] = [sorted[to], sorted[from]];
  sorted.forEach((item, i) => (item.order = i + 1));
  await writeJson(config.file, items);
  updateTag(CONTENT_TAG);
  await audit(`Reordered ${collection}`, id);
  return { ok: true };
}

export async function togglePublished(collection: string, id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isCollection(collection)) return { ok: false, error: "Unknown collection." };
  const config = collections[collection];
  using _lock = await lockFile(config.file);
  const items = (await readCollection(collection)) as unknown as { id: string; published: boolean }[];
  const item = items.find((i) => i.id === id);
  if (!item) return { ok: false, error: "Item not found." };
  item.published = !item.published;
  await writeJson(config.file, items);
  updateTag(CONTENT_TAG);
  await audit(item.published ? `Published ${config.singular}` : `Unpublished ${config.singular}`, id);
  return { ok: true };
}
