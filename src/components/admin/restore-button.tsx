"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { restoreBackup } from "@/app/admin/actions";

export function RestoreButton({ name, label, when }: { name: string; label: string; when: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <span className="inline-flex items-center gap-3">
      {message && <span className={`text-xs font-semibold ${message.ok ? "text-success-700" : "text-danger-600"}`}>{message.text}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Restore ${label} to the version from ${when}? The current version is backed up first, so you can undo this.`)) return;
          start(async () => {
            const result = await restoreBackup(name);
            setMessage(result.ok ? { ok: true, text: result.message ?? "Restored." } : { ok: false, text: result.error });
            router.refresh();
          });
        }}
        className="admin-btn"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
        Restore
      </button>
    </span>
  );
}
