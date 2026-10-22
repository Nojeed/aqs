"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { moveItem } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";

/** Up/down arrows to reorder services and courses without typing order numbers. */
export function OrderButtons({ collection, id, order, first, last }: { collection: string; id: string; order: number; first: boolean; last: boolean }) {
  const { pending, run } = useAdminAction();
  // The row moving is the confirmation; only errors get a toast.
  const move = (direction: "up" | "down") => run(() => moveItem(collection, id, direction));
  const btn =
    "inline-flex size-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-30 pointer-coarse:size-10";
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="w-6 text-center text-slate-500 tabular-nums">{order}</span>
      <button type="button" className={btn} disabled={pending || first} onClick={() => move("up")} aria-label="Move up">
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button type="button" className={btn} disabled={pending || last} onClick={() => move("down")} aria-label="Move down">
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </span>
  );
}
