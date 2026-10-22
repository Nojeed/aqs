import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import seedCertificates from "../../seed/certificates.json";
import seedCourses from "../../seed/courses.json";
import seedMessages from "../../seed/messages.json";
import seedPosts from "../../seed/posts.json";
import seedRegistrations from "../../seed/registrations.json";
import seedServices from "../../seed/services.json";
import seedSite from "../../seed/site.json";
import seedUsers from "../../seed/users.json";

/**
 * All editable data lives in DATA_DIR (default ./data), outside the build output,
 * so redeploying the code never overwrites what the admin has changed.
 * Missing files are created from the defaults in ./seed on first read.
 */
export const DATA_DIR = path.resolve(
  /* turbopackIgnore: true */ process.env.DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "data"),
);
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
// Bundled into the build, because hosts like Hostinger deploy only part of the repo.
// Every new file in ./seed must be imported and listed here, or reading it crashes in production.
const SEEDS: Record<string, unknown> = {
  "certificates.json": seedCertificates,
  "courses.json": seedCourses,
  "messages.json": seedMessages,
  "posts.json": seedPosts,
  "registrations.json": seedRegistrations,
  "services.json": seedServices,
  "site.json": seedSite,
  "users.json": seedUsers,
};
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const BACKUPS_PER_FILE = 15;

export function dataPath(file: string) {
  return path.join(DATA_DIR, file);
}

/** Write via a temp file + rename so readers never see a half-written file. */
export async function writeFileAtomic(target: string, contents: string | Buffer) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(tmp, contents);
  await fs.rename(tmp, target);
}

export async function readJson<T>(file: string): Promise<T> {
  const target = dataPath(file);
  try {
    return JSON.parse(await fs.readFile(target, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    if (!(file in SEEDS)) throw new Error(`No seed for ${file}: add seed/${file} to SEEDS in storage.ts`);
    const seed = `${JSON.stringify(SEEDS[file], null, 2)}\n`;
    await writeFileAtomic(target, seed);
    // Parse a fresh copy so callers can't mutate the bundled default.
    return JSON.parse(seed) as T;
  }
}

/** Write a data file, keeping the previous version in data/backups. */
export async function writeJson(file: string, data: unknown) {
  const target = dataPath(file);
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const base = path.basename(file, ".json");
    await fs.copyFile(target, path.join(BACKUP_DIR, `${base}.${stamp}.json`));
    const old = (await fs.readdir(BACKUP_DIR)).filter((f) => f.startsWith(`${base}.`)).sort();
    await Promise.all(
      old.slice(0, Math.max(0, old.length - BACKUPS_PER_FILE)).map((f) => fs.rm(path.join(BACKUP_DIR, f))),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await writeFileAtomic(target, `${JSON.stringify(data, null, 2)}\n`);
}

// Backup names look like "courses.2026-10-17T15-55-32-341Z.json" (see writeJson).
const BACKUP_NAME = /^([a-z][a-z-]*)\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.json$/;

export type Backup = { name: string; file: string; savedAt: string; bytes: number };

/** Backups for the given data files, newest first. */
export async function listBackups(files: string[]): Promise<Backup[]> {
  const names = await fs.readdir(BACKUP_DIR).catch(() => [] as string[]);
  const list = await Promise.all(
    names.map(async (name) => {
      const m = BACKUP_NAME.exec(name);
      if (!m || !files.includes(`${m[1]}.json`)) return null;
      const [date, time] = m[2].split("T");
      const savedAt = `${date}T${time.replace(/^(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, "$1:$2:$3.$4Z")}`;
      const { size } = await fs.stat(path.join(BACKUP_DIR, name));
      return { name, file: `${m[1]}.json`, savedAt, bytes: size };
    }),
  );
  return list.filter((b): b is Backup => b !== null).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

/** Read a backup by name. Only names matching the backup pattern are accepted, so no path tricks. */
export async function readBackup(name: string, files: string[]) {
  const m = BACKUP_NAME.exec(name);
  if (!m || !files.includes(`${m[1]}.json`)) return null;
  return { file: `${m[1]}.json`, text: await fs.readFile(path.join(BACKUP_DIR, name), "utf8") };
}
