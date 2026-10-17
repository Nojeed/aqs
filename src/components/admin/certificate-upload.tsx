"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";

export function CertificateUpload() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(file: File) {
    if (!confirm(`Replace all certificates with the contents of “${file.name}”? A backup of the current file is kept.`)) {
      if (ref.current) ref.current.value = "";
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/certificates", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessage({ ok: true, text: `Imported ${json.count} certificates.` });
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
      <button type="button" className="btn-primary rounded-lg px-4 py-2" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
        Upload new certificates.json
      </button>
      <input
        ref={ref}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {message && (
        <p role="status" className={`mt-3 text-sm font-semibold ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
