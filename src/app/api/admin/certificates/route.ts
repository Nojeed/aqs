import { promises as fs } from "node:fs";
import { adminGuard } from "@/lib/api-auth";
import { CERTIFICATES_FILE, normalizeId, parseCertificates } from "@/lib/certificates";
import { dataPath, writeJson } from "@/lib/storage";

/** Download the current certificates.json. */
export async function GET(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const body = await fs.readFile(dataPath(CERTIFICATES_FILE), "utf8").catch(() => "[]");
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="certificates.json"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Replace certificates.json with an uploaded file after validating it. */
export async function POST(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return Response.json({ error: "File is larger than 20 MB." }, { status: 413 });

  let list;
  try {
    list = parseCertificates(JSON.parse((await file.text()).replace(/^﻿/, "")));
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
      { error: `Duplicate certificate numbers: ${dupes.slice(0, 5).map((d) => d.id).join(", ")}` },
      { status: 422 },
    );
  }
  await writeJson(CERTIFICATES_FILE, list);
  return Response.json({ count: list.length });
}
