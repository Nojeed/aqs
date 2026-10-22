"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/admin/actions";

/**
 * Runs an admin server action with a pending state, refreshes the page and reports the outcome as a toast,
 * so no button ever fails silently. `success` is used when the action returns no message of its own.
 */
export function useAdminAction() {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (action: () => Promise<ActionResult>, { success, after }: { success?: string; after?: () => void } = {}) =>
    start(async () => {
      try {
        const result = await action();
        if (result.ok) {
          const message = result.message ?? success;
          if (message) toast.success(message);
          after?.();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        // Let Next handle its own control flow (e.g. the redirect to login when the session expired).
        if (String((error as { digest?: string })?.digest ?? "").startsWith("NEXT_")) throw error;
        toast.error("Couldn't reach the server. Check your connection and try again.");
      }
      router.refresh();
    });

  return { pending, run };
}
