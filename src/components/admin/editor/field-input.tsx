"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { L10n } from "@/lib/i18n";
import { emptyValue, type Field } from "@/lib/schema";
import { ImageInput } from "./image-input";
import { MarkdownInput } from "./markdown-input";

type Props = { field: Field; value: unknown; onChange: (value: unknown) => void; id: string };

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-800";
const helpClass = "mt-1.5 text-xs text-slate-500";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none";

export function FieldInput({ field, value, onChange, id }: Props) {
  switch (field.kind) {
    case "object":
      return <ObjectInput field={field} value={value} onChange={onChange} id={id} />;
    case "list":
      return <ListInput field={field} value={value} onChange={onChange} id={id} />;
    case "boolean":
      return (
        <div>
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 after:absolute after:start-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
            <span className="text-sm font-semibold text-slate-800">{field.label}</span>
          </label>
          {field.help && <p className={helpClass}>{field.help}</p>}
        </div>
      );
    default:
      return (
        <div>
          <label htmlFor={id} className={labelClass}>
            {field.label}
          </label>
          <Scalar field={field} value={value} onChange={onChange} id={id} />
          {field.help && <p className={helpClass}>{field.help}</p>}
        </div>
      );
  }
}

function Scalar({ field, value, onChange, id }: Props) {
  switch (field.kind) {
    case "text":
    case "textarea":
      if (field.localized) {
        const v = (value ?? { ar: "", en: "" }) as L10n;
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {(["ar", "en"] as const).map((lang) => (
              <div key={lang} className="relative">
                {/* Badge sits on the side where the text ends, so it never covers the first characters. */}
                <span
                  className={`pointer-events-none absolute top-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase ${lang === "ar" ? "left-2" : "right-2"}`}
                >
                  {lang}
                </span>
                {field.kind === "textarea" ? (
                  <textarea
                    id={lang === "ar" ? id : `${id}-en`}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    rows={field.rows ?? 3}
                    className={`${inputClass} ${lang === "ar" ? "pl-10" : "pr-10"}`}
                    value={v[lang] ?? ""}
                    onChange={(e) => onChange({ ...v, [lang]: e.target.value })}
                  />
                ) : (
                  <input
                    id={lang === "ar" ? id : `${id}-en`}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className={`${inputClass} ${lang === "ar" ? "pl-10" : "pr-10"}`}
                    value={v[lang] ?? ""}
                    onChange={(e) => onChange({ ...v, [lang]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        );
      }
      return field.kind === "textarea" ? (
        <textarea
          id={id}
          rows={field.rows ?? 3}
          className={inputClass}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={inputClass}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "markdown":
      return <MarkdownInput id={id} localized={!!field.localized} value={value} onChange={onChange} />;
    case "url":
      return (
        <input
          id={id}
          dir="ltr"
          className={inputClass}
          placeholder={field.placeholder ?? "https://"}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "image":
      return <ImageInput id={id} value={String(value ?? "")} onChange={onChange} />;
    case "number":
      return (
        <input
          id={id}
          type="number"
          className={`${inputClass} max-w-40`}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        />
      );
    case "date":
      return (
        <input
          id={id}
          type="date"
          className={`${inputClass} max-w-52`}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <select id={id} className={`${inputClass} max-w-72`} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    default:
      return null;
  }
}

function ObjectInput({ field, value, onChange, id }: Props & { field: Extract<Field, { kind: "object" }> }) {
  const v = (value ?? {}) as Record<string, unknown>;
  return (
    <fieldset className="space-y-5">
      {Object.entries(field.fields).map(([key, f]) => (
        <FieldInput key={key} id={`${id}-${key}`} field={f} value={v[key]} onChange={(next) => onChange({ ...v, [key]: next })} />
      ))}
    </fieldset>
  );
}

function ListInput({ field, value, onChange, id }: Props & { field: Extract<Field, { kind: "list" }> }) {
  const items = Array.isArray(value) ? value : [];
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const isObject = field.of.kind === "object";
  const max = field.max ?? 200;

  const update = (index: number, next: unknown) => onChange(items.map((item, i) => (i === index ? next : item)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={labelClass}>
          {field.label} <span className="font-normal text-slate-400">({items.length})</span>
        </span>
      </div>
      {field.help && <p className={`${helpClass} -mt-1 mb-2`}>{field.help}</p>}
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-1 px-3 py-2">
              <button
                type="button"
                className="flex-1 text-start text-xs font-bold tracking-wide text-slate-500 uppercase"
                onClick={() => isObject && setCollapsed((c) => ({ ...c, [index]: !c[index] }))}
              >
                {field.itemLabel ?? "Item"} {index + 1}
                {isObject && collapsed[index] && <span className="ms-2 font-normal normal-case">{summary(item)}</span>}
              </button>
              <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                <ChevronUp className="size-4" />
              </IconButton>
              <IconButton label="Move down" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                <ChevronDown className="size-4" />
              </IconButton>
              <IconButton label="Remove" onClick={() => onChange(items.filter((_, i) => i !== index))} danger>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
            {!collapsed[index] && (
              <div className="border-t border-slate-200 bg-white p-4">
                {isObject ? (
                  <FieldInput id={`${id}-${index}`} field={field.of} value={item} onChange={(next) => update(index, next)} />
                ) : (
                  <Scalar id={`${id}-${index}`} field={field.of} value={item} onChange={(next) => update(index, next)} />
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, emptyValue(field.of)])}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50"
        >
          <Plus className="size-4" aria-hidden /> Add {(field.itemLabel ?? "item").toLowerCase()}
        </button>
      )}
    </div>
  );
}

function summary(item: unknown): string {
  if (!item || typeof item !== "object") return "";
  for (const v of Object.values(item)) {
    if (typeof v === "string" && v) return v.slice(0, 60);
    if (v && typeof v === "object" && "en" in v) {
      const l = v as L10n;
      if (l.en || l.ar) return (l.en || l.ar).slice(0, 60);
    }
  }
  return "";
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition disabled:opacity-30 ${
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-slate-200 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
