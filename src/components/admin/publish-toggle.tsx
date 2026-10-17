"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { togglePublished } from "@/app/admin/actions";

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
      className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
        published ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
