"use client";

import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";

const list = [
  ["Ctrl + S", "Save the item you are editing"],
  ["/", "Search the table on this page"],
  ["N", "New item (courses, services, posts, certificates)"],
  ["Esc", "Clear the search, close this panel"],
  ["?", "Show or hide these shortcuts"],
] as const;

/** Admin-wide keyboard shortcuts. Ignored while typing in a field. */
export function AdminShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, select, [contenteditable]");
      if (e.key === "Escape") setOpen(false);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") setOpen((v) => !v);
      if (e.key === "n" || e.key === "N") document.querySelector<HTMLElement>("[data-shortcut='new']")?.click();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  return (
    <div role="dialog" aria-label="Keyboard shortcuts" className="fixed end-4 bottom-4 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-brand-950/15">
      <div className="flex items-center justify-between">
        <h2 className="font-display inline-flex items-center gap-2 font-bold">
          <Keyboard className="size-4 text-brand-600" aria-hidden /> Keyboard shortcuts
        </h2>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        {list.map(([key, text]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <dt className="text-slate-600">{text}</dt>
            <dd>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-sans text-xs font-semibold whitespace-nowrap text-slate-700">{key}</kbd>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
