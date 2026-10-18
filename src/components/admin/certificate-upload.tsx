"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";

export function CertificateUpload() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(file: File) {
    const question =
      mode === "replace"
        ? `Replace ALL certificates with the contents of “${file.name}”? Certificates not in the file will be removed. A backup of the current file is kept.`
        : `Add the certificates in “${file.name}” and update any with the same number? A backup of the current file is kept.`;
    if (!confirm(question)) {
      if (ref.current) ref.current.value = "";
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("mode", mode);
      const res = await fetch("/api/admin/certificates", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessage({
        ok: true,
        text:
          mode === "merge"
            ? `Added ${json.added}, updated ${json.updated}. ${json.count} certificates in total.`
            : `Imported ${json.count} certificates.`,
      });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary rounded-lg px-4 py-2" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          Upload CSV or JSON
        </button>
        <fieldset className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          <legend className="sr-only">Upload mode</legend>
          {(
            [
              ["merge", "Add or update"],
              ["replace", "Replace all"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="cursor-pointer rounded-md px-3 py-1.5 font-semibold text-slate-600 transition hover:text-brand-900 has-checked:bg-white has-checked:text-brand-900 has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-accent-500"
            >
              <input type="radio" name="upload-mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="sr-only" />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".csv,text/csv,application/json,.json"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {message && (
        <p role="status" className={`mt-3 text-sm font-semibold ${message.ok ? "text-success-700" : "text-danger-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
