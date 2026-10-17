"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleCertificateRevoked } from "@/app/admin/actions";

export function RevokeToggle({ id, revoked }: { id: string; revoked: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!revoked && !confirm(`Revoke certificate ${id}? The verification page will show it as not valid.`)) return;
        start(async () => {
          await toggleCertificateRevoked(id);
          router.refresh();
        });
      }}
      className={`admin-btn ${revoked ? "" : "hover:border-red-300 hover:bg-red-50 hover:text-red-700"}`}
    >
      {revoked ? "Restore" : "Revoke"}
    </button>
  );
}
