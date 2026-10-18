import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import seedCertificates from "../../seed/certificates.json";
import seedCourses from "../../seed/courses.json";
import seedPosts from "../../seed/posts.json";
import seedServices from "../../seed/services.json";
import seedSite from "../../seed/site.json";

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
const SEEDS: Record<string, unknown> = {
  "certificates.json": seedCertificates,
  "courses.json": seedCourses,
  "posts.json": seedPosts,
  "services.json": seedServices,
  "site.json": seedSite,
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
    if (!(file in SEEDS)) throw error;
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
