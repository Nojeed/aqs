"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowLeft, CircleCheck, ExternalLink, LoaderCircle, Save, Trash2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import type { Field, Fields } from "@/lib/schema";
import { FieldInput } from "./field-input";

type Group = { key: string; title?: string; help?: string; entries: [string, Field][] };

/** Top-level objects and lists get their own card; consecutive simple fields share one. */
function groupFields(fields: Fields): Group[] {
  const groups: Group[] = [];
  for (const [key, field] of Object.entries(fields)) {
    if (field.kind === "object" || field.kind === "list") {
      groups.push({ key, title: field.label, help: field.help, entries: [[key, field]] });
    } else {
      const last = groups.at(-1);
      if (last && !last.title) last.entries.push([key, field]);
      else groups.push({ key, entries: [[key, field]] });
    }
  }
  return groups;
}

export function ContentEditor({
  title,
  fields,
  initial,
  save,
  remove,
  backHref,
  backLabel,
  viewUrl,
  createdBasePath,
}: {
  title: string;
  fields: Fields;
  initial: Record<string, unknown>;
  save: (data: unknown) => Promise<ActionResult>;
  remove?: () => Promise<ActionResult>;
  backHref?: string;
  backLabel?: string;
  viewUrl?: string;
  /** For new items: where to go after the first save, e.g. "/admin/courses/". */
  createdBasePath?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = value !== saved;

  const onSave = useCallback(() => {
    startTransition(async () => {
      const result = await save(value);
      if (!result.ok) {
        setStatus({ kind: "error", text: result.error });
        return;
      }
      setSaved(value);
      setStatus({ kind: "ok", text: result.message ?? "Saved." });
      if (createdBasePath && result.id) router.replace(`${createdBasePath}${result.id}`);
      else router.refresh();
    });
  }, [save, value, createdBasePath, router]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSave]);

  useEffect(() => {
    if (status?.kind !== "ok") return;
    const timer = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  function onDelete() {
    if (!remove || !confirm("Delete this item permanently? A backup copy is kept in data/backups.")) return;
    startTransition(async () => {
      const result = await remove();
      if (!result.ok) setStatus({ kind: "error", text: result.error });
      else if (backHref) router.push(backHref);
    });
  }

  const groups = groupFields(fields);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-8">
          {backHref && (
            <Link href={backHref} className="admin-btn" aria-label={backLabel ?? "Back"}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          )}
          <h1 className="font-display min-w-0 flex-1 truncate text-lg font-bold">{title}</h1>
          {status && (
            <span
              role="status"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${status.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
            >
              {status.kind === "ok" && <CircleCheck className="size-4" aria-hidden />}
              {status.text}
            </span>
          )}
          {dirty && !status && <span className="text-sm text-amber-600">Unsaved changes</span>}
          {viewUrl && (
            <a href={viewUrl} target="_blank" className="admin-btn">
              <ExternalLink className="size-4" aria-hidden />
              <span className="hidden sm:inline">View</span>
            </a>
          )}
          {remove && (
            <button type="button" onClick={onDelete} className="admin-btn text-red-600 hover:bg-red-50" disabled={pending}>
              <Trash2 className="size-4" aria-hidden />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
          <button type="submit" className="btn-primary rounded-lg px-5 py-2" disabled={pending || (!dirty && !createdBasePath)}>
            {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
            Save
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
        {groups.map((group) => (
          <section key={group.key} id={`section-${group.key}`} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            {group.title && (
              <header className="mb-5">
                <h2 className="font-display text-base font-bold">{group.title}</h2>
                {group.help && <p className="mt-1 text-sm text-slate-500">{group.help}</p>}
              </header>
            )}
            <div className="space-y-5">
              {group.entries.map(([key, field]) => (
                <FieldInput
                  key={key}
                  id={`f-${key}`}
                  field={group.title && field.kind === "list" ? { ...field, label: "Items" } : field.kind === "object" ? { ...field, label: "" } : field}
                  value={value[key]}
                  onChange={(next) => setValue((current) => ({ ...current, [key]: next }))}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </form>
  );
}
