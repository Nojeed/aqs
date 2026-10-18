"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { togglePublished } from "@/app/admin/actions";
import { badgeClass } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export function PublishToggle({ collection, id, published }: { collection: string; id: string; published: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await togglePublished(collection, id);
          router.refresh();
        })
      }
      title={published ? "Click to hide from the website" : "Click to publish"}
      className={cn(badgeClass(published ? "success" : "neutral"), "cursor-pointer transition hover:brightness-95 disabled:opacity-50")}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
