import { promises as fs } from "node:fs";
import { adminGuard } from "@/lib/api-auth";
import { audit } from "@/lib/audit";
import { CERTIFICATES_FILE, normalizeId, parseCertificates, readCertificates, type Certificate } from "@/lib/certificates";
import { certificatesFromCsv, certificatesToCsv } from "@/lib/csv";
import { dataPath, writeJson } from "@/lib/storage";

/** Download certificates.json, or `?format=csv` for an Excel-friendly copy. */
export async function GET(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const csv = new URL(request.url).searchParams.get("format") === "csv";
  const body = csv
    ? certificatesToCsv(await readCertificates())
    : await fs.readFile(dataPath(CERTIFICATES_FILE), "utf8").catch(() => "[]");
  return new Response(body, {
    headers: {
      "Content-Type": csv ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="certificates.${csv ? "csv" : "json"}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Upload certificates as JSON or CSV.
 * mode=replace swaps the whole file; mode=merge adds new numbers and updates existing ones.
 */
export async function POST(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const mode = form?.get("mode") === "merge" ? "merge" : "replace";
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return Response.json({ error: "File is larger than 20 MB." }, { status: 413 });

  let list: Certificate[];
  try {
    const text = (await file.text()).replace(/^﻿/, "");
    list = parseCertificates(file.name.toLowerCase().endsWith(".csv") ? certificatesFromCsv(text) : JSON.parse(text));
  } catch (error) {
    const message = error instanceof SyntaxError ? `Invalid JSON: ${error.message}` : (error as Error).message;
    return Response.json({ error: message }, { status: 422 });
  }
  const seen = new Set<string>();
  const dupes = list.filter((c) => {
    const key = normalizeId(c.id);
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
  if (dupes.length) {
    return Response.json(
      { error: `Duplicate certificate numbers in the file: ${dupes.slice(0, 5).map((d) => d.id).join(", ")}` },
      { status: 422 },
    );
  }

  if (mode === "merge") {
    const current = await readCertificates();
    const byId = new Map(current.map((c) => [normalizeId(c.id), c]));
    let added = 0;
    for (const c of list) {
      const key = normalizeId(c.id);
      if (!byId.has(key)) added++;
      byId.set(key, { ...byId.get(key), ...c });
    }
    await writeJson(CERTIFICATES_FILE, [...byId.values()]);
    await audit("Imported certificates (add or update)", `${file.name}: ${added} added, ${list.length - added} updated`);
    return Response.json({ count: byId.size, added, updated: list.length - added });
  }
  await writeJson(CERTIFICATES_FILE, list);
  await audit("Replaced all certificates", `${file.name}: ${list.length} certificates`);
  return Response.json({ count: list.length });
}
