"use client";

import { toggleCertificateRevoked } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";

export function RevokeToggle({ id, revoked }: { id: string; revoked: boolean }) {
  const { pending, run } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!revoked && !confirm(`Revoke certificate ${id}? The verification page will show it as not valid.`)) return;
        run(() => toggleCertificateRevoked(id), { success: revoked ? `Certificate ${id} restored.` : `Certificate ${id} revoked.` });
      }}
      className={`admin-btn ${revoked ? "" : "hover:border-danger-300 hover:bg-danger-50 hover:text-danger-700"}`}
    >
      {revoked ? "Restore" : "Revoke"}
    </button>
  );
}
