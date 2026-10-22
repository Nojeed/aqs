#!/usr/bin/env node
// Nightly off-server copy of the site data. Usage:
//   DATA_DIR=/home/user/aqs-data node scripts/backup.mjs /mnt/backup-disk/aqs
// Writes aqs-data-YYYY-MM-DD.tar.gz into the target folder and keeps the newest 30.
// Schedule it with cron (see README → Backups). The target should be another disk, a mounted drive or a synced folder.
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { create } from "tar";

const dataDir = path.resolve(process.env.DATA_DIR || "data");
const target = process.argv[2] || process.env.BACKUP_TARGET;
const KEEP = Number(process.env.BACKUP_KEEP || 30);
if (!target) {
  console.error("Usage: node scripts/backup.mjs <target folder>   (or set BACKUP_TARGET)");
  process.exit(1);
}

await mkdir(target, { recursive: true });
const file = path.join(target, `aqs-data-${new Date().toISOString().slice(0, 10)}.tar.gz`);
const entries = (await readdir(dataDir)).filter((n) => n !== "backups" && !n.endsWith(".tmp"));
await create({ gzip: true, cwd: dataDir, file, portable: true }, entries);

const old = (await readdir(target)).filter((n) => /^aqs-data-\d{4}-\d{2}-\d{2}\.tar\.gz$/.test(n)).sort();
for (const name of old.slice(0, Math.max(0, old.length - KEEP))) await rm(path.join(target, name));
console.log(`Backed up ${entries.length} items from ${dataDir} to ${file}`);
