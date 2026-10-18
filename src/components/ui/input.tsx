import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Base text control shared by inputs, textareas and select triggers. */
export const controlClass = cn(
  "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 shadow-xs transition-[color,box-shadow,border-color] outline-none md:text-sm",
  "placeholder:text-slate-400 hover:border-brand-300",
  "focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none",
  "aria-invalid:border-danger-500 aria-invalid:focus-visible:ring-danger-100",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={cn(controlClass, "h-11 py-2", className)} {...props} />;
}
