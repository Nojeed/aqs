import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Base text control shared by inputs, textareas and select triggers. */
export const controlClass = cn(
  "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 shadow-xs transition-[color,box-shadow,border-color] outline-none md:text-sm",
  "placeholder:text-slate-400 hover:border-brand-300",
  "focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none",
  "aria-invalid:border-danger-500 aria-invalid:focus-visible:ring-danger-100",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
);

/** Puts an icon at the start of a text control; it turns brand blue on focus and red on error. */
export function WithIcon({ icon: Icon, top, children }: { icon?: LucideIcon; top?: boolean; children: ReactNode }) {
  if (!Icon) return children;
  return (
    // Padding follows the page direction, not the control's: email and phone fields are dir="ltr" even on Arabic pages.
    <div className="relative ltr:[&>*:first-child]:pl-10 rtl:[&>*:first-child]:pr-10">
      {children}
      <Icon
        className={cn(
          "pointer-events-none absolute start-3.5 size-4 text-slate-400 transition-colors peer-focus-visible:text-brand-600 peer-aria-invalid:text-danger-500",
          top ? "top-3.5" : "top-1/2 -translate-y-1/2",
        )}
        aria-hidden
      />
    </div>
  );
}

export function Input({ className, icon, ...props }: ComponentProps<"input"> & { icon?: LucideIcon }) {
  return (
    <WithIcon icon={icon}>
      <input data-slot="input" className={cn(controlClass, "peer h-11 py-2", className)} {...props} />
    </WithIcon>
  );
}
