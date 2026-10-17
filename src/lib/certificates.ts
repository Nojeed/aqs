import "server-only";
import { promises as fs } from "node:fs";
import { dataPath, readJson } from "./storage";

export const CERTIFICATES_FILE = "certificates.json";

/**
 * Shape of each entry in data/certificates.json. Only `id` and `name` are required;
 * the Arabic variants are optional and fall back to the English values.
 */
export type Certificate = {
  id: string;
  name: string;
  nameAr?: string;
  course?: string;
  courseAr?: string;
  issueDate?: string;
  expiryDate?: string;
  hours?: number | string;
  grade?: string;
  gradeAr?: string;
  status?: "valid" | "revoked" | string;
};

export type CertificateStatus = "valid" | "expired" | "revoked";

export function normalizeId(id: string) {
  return id.toUpperCase().replace(/\s+/g, "").trim();
}

/** Accepts either a bare array or `{ "certificates": [...] }`. */
export function parseCertificates(raw: unknown): Certificate[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { certificates?: unknown }).certificates)
      ? (raw as { certificates: unknown[] }).certificates
      : null;
  if (!list) throw new Error("Expected an array of certificates or { \"certificates\": [...] }.");
  return list.map((entry, index) => {
    const c = entry as Record<string, unknown>;
    const id = String(c.id ?? c.certificateNo ?? c.number ?? "").trim();
    if (!id) throw new Error(`Entry #${index + 1} is missing "id".`);
    if (!c.name) throw new Error(`Entry #${index + 1} (${id}) is missing "name".`);
    return { ...(c as object), id, name: String(c.name) } as Certificate;
  });
}

export async function readCertificates() {
  return parseCertificates(await readJson<unknown>(CERTIFICATES_FILE));
}

/** Next number in the AQS-<year>-0001 series, using the issue date's year. */
export function nextCertificateId(list: Certificate[], issueDate: string) {
  const year = /^\d{4}-/.test(issueDate) ? issueDate.slice(0, 4) : String(new Date().getFullYear());
  const prefix = `AQS-${year}-`;
  const used = list.map((c) => normalizeId(c.id)).filter((id) => id.startsWith(prefix));
  const max = used.reduce((m, id) => Math.max(m, Number(id.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

// Parsed index cached per file modification time, so manual edits are picked up immediately.
let cache: { mtimeMs: number; index: Map<string, Certificate>; count: number } | null = null;

async function loadIndex() {
  const file = dataPath(CERTIFICATES_FILE);
  let mtimeMs = 0;
  try {
    mtimeMs = (await fs.stat(file)).mtimeMs;
  } catch {
    // readJson below creates the file from the seed.
  }
  if (cache && mtimeMs && cache.mtimeMs === mtimeMs) return cache;
  const list = await readCertificates();
  const index = new Map(list.map((c) => [normalizeId(c.id), c]));
  cache = { mtimeMs, index, count: list.length };
  return cache;
}

export function certificateStatus(cert: Certificate, today = new Date()): CertificateStatus {
  if (String(cert.status ?? "").toLowerCase() === "revoked") return "revoked";
  if (cert.expiryDate && /^\d{4}-\d{2}-\d{2}$/.test(cert.expiryDate)) {
    if (cert.expiryDate < today.toISOString().slice(0, 10)) return "expired";
  }
  return "valid";
}

export async function findCertificate(id: string) {
  const key = normalizeId(id);
  if (!key || key.length > 100) return null;
  return (await loadIndex()).index.get(key) ?? null;
}

export async function certificateStats() {
  const file = dataPath(CERTIFICATES_FILE);
  const { count } = await loadIndex();
  const stat = await fs.stat(file);
  return { count, updatedAt: stat.mtime, path: file };
}
