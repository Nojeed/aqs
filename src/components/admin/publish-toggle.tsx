"use client";

import { togglePublished } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { badgeClass } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export function PublishToggle({ collection, id, published }: { collection: string; id: string; published: boolean }) {
  const { pending, run } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(() => togglePublished(collection, id), { success: published ? "Hidden from the website." : "Published on the website." })}
      title={published ? "Click to hide from the website" : "Click to publish"}
      className={cn(badgeClass(published ? "success" : "neutral"), "cursor-pointer transition hover:brightness-95 disabled:opacity-50")}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
