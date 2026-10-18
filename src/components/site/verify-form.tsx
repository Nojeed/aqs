import Form from "next/form";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";

/** GET form so results have a shareable URL (/ar/verify?id=…) that QR codes can point to. */
export function VerifyForm({
  locale,
  label,
  placeholder,
  submit,
  defaultValue = "",
  size = "lg",
}: {
  locale: Locale;
  label: string;
  placeholder: string;
  submit: string;
  defaultValue?: string;
  size?: "lg" | "md";
}) {
  return (
    <Form action={`/${locale}/verify`} className="w-full">
      <label htmlFor={`cert-${size}`} className="sr-only">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-full bg-white p-1.5 shadow-xl shadow-brand-950/10 ring-1 ring-slate-200 focus-within:ring-4 focus-within:ring-brand-200 ${size === "lg" ? "sm:p-2" : ""}`}
      >
        <Search className="ms-3 size-5 shrink-0 text-slate-400" aria-hidden />
        <Input
          id={`cert-${size}`}
          name="id"
          required
          maxLength={100}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          className={`h-auto flex-1 border-0 bg-transparent px-1 font-mono tracking-wide uppercase shadow-none placeholder:font-sans placeholder:tracking-normal placeholder:normal-case hover:border-0 focus-visible:ring-0 rtl:text-right ${size === "lg" ? "py-3 text-base md:text-base" : "py-2 text-sm"}`}
        />
        <button type="submit" className={`btn-primary shrink-0 ${size === "lg" ? "px-7" : "px-5 py-2.5"}`}>
          {submit}
        </button>
      </div>
    </Form>
  );
}
