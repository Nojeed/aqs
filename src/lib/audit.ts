import "server-only";
import { promises as fs } from "node:fs";
import { getSession } from "./auth";
import { dataPath, writeFileAtomic } from "./storage";

/** Who changed what, newest last. A log, so no backups; the last 2,000 entries are kept. */
export type AuditEntry = { at: string; user: string; action: string; target?: string };

const FILE = "audit.json";
const KEEP = 2000;

export async function readAudit(): Promise<AuditEntry[]> {
  try {
    return JSON.parse(await fs.readFile(dataPath(FILE), "utf8")) as AuditEntry[];
  } catch {
    return [];
  }
}

// shortcut: writes are queued per server process; with several processes entries can be lost, use a database then.
let queue: Promise<unknown> = Promise.resolve();

/** Record an admin action. `user` is only needed before the session cookie exists (sign-in). */
export async function audit(action: string, target?: string, user?: string) {
  const who = user ?? (await getSession())?.username ?? "unknown";
  const entry: AuditEntry = { at: new Date().toISOString(), user: who, action, ...(target && { target }) };
  queue = queue
    .then(async () => {
      const list = await readAudit();
      list.push(entry);
      await writeFileAtomic(dataPath(FILE), JSON.stringify(list.slice(-KEEP)));
    })
    .catch(() => {});
  return queue;
}
