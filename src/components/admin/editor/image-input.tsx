"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Images, LoaderCircle, Upload, X } from "lucide-react";

type MediaItem = { url: string; name: string; source: "stock" | "upload" };

export function ImageInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [picker, setPicker] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:w-44">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-slate-300" aria-hidden />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <LoaderCircle className="size-6 animate-spin text-brand-700" aria-label="Uploading" />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input
          id={id}
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/… or https://…"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="admin-btn" disabled={uploading}>
            <Upload className="size-4" aria-hidden /> Upload
          </button>
          <button type="button" onClick={() => setPicker(true)} className="admin-btn">
            <Images className="size-4" aria-hidden /> Library
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="admin-btn text-red-600">
              <X className="size-4" aria-hidden /> Remove
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">JPG, PNG, WebP or AVIF, up to 8 MB. Wide images (1600px+) look best.</p>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onPick={(url) => {
            onChange(url);
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}

function MediaPicker({ onClose, onPick }: { onClose: () => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load the library"))))
      .then((json) => setItems(json.items))
      .catch((e) => setError(e.message));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Image library"
      onClick={onClose}
    >
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Image library</h2>
          <button type="button" onClick={onClose} className="admin-btn" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!items && !error && <LoaderCircle className="mx-auto size-6 animate-spin text-slate-400" />}
          {items && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <li key={item.url}>
                  <button
                    type="button"
                    onClick={() => onPick(item.url)}
                    className="group block w-full overflow-hidden rounded-xl border border-slate-200 text-start hover:border-brand-500 focus-visible:border-brand-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <span className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs">
                      <span className="truncate text-slate-600">{item.name}</span>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 font-semibold ${item.source === "upload" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"}`}>
                        {item.source === "upload" ? "Uploaded" : "Stock"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
