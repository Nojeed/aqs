"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { restoreBackup } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";

export function RestoreButton({ name, label, when }: { name: string; label: string; when: string }) {
  const { pending, run } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Restore ${label} to the version from ${when}? The current version is backed up first, so you can undo this.`)) return;
        run(() => restoreBackup(name));
      }}
      className="admin-btn"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
      Restore
    </button>
  );
}
