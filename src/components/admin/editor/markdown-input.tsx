"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { L10n } from "@/lib/i18n";

/** Markdown textarea per language with a live preview toggle. */
export function MarkdownInput({
  id,
  localized,
  value,
  onChange,
}: {
  id: string;
  localized: boolean;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [preview, setPreview] = useState(false);
  const v = localized ? ((value ?? { ar: "", en: "" }) as L10n) : null;
  const text = v ? (v[lang] ?? "") : String(value ?? "");
  const set = (next: string) => onChange(v ? { ...v, [lang]: next } : next);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <div className="flex gap-1">
          {v &&
            (["ar", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-md px-3 py-1 text-xs font-bold ${lang === l ? "bg-white text-brand-800 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}
              >
                {l === "ar" ? "العربية" : "English"}
                {!v[l]?.trim() && <span className="ms-1 text-amber-500" title="Empty">•</span>}
              </button>
            ))}
        </div>
        <div className="flex gap-1">
          {(["Write", "Preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreview(mode === "Preview")}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${preview === (mode === "Preview") ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      {preview ? (
        <div
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="prose prose-slate prose-sm min-h-64 max-w-none bg-white p-4 prose-headings:font-display"
        >
          {text.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown> : <p className="text-slate-400">Nothing to preview.</p>}
        </div>
      ) : (
        <textarea
          id={id}
          dir={lang === "ar" ? "rtl" : "ltr"}
          value={text}
          onChange={(e) => set(e.target.value)}
          rows={14}
          className="block min-h-64 w-full resize-y bg-white p-4 font-mono text-sm leading-6 text-slate-900 focus:outline-none"
          placeholder={"## Heading\n\nParagraph text with **bold** and [links](https://…).\n\n- List item"}
        />
      )}
      <p className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
        Markdown: <code>## Heading</code> · <code>**bold**</code> · <code>- list</code> · <code>1. numbered</code> ·{" "}
        <code>[link](url)</code>
      </p>
    </div>
  );
}
