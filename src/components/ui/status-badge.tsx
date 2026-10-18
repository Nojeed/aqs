import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const tones = {
  success: "bg-success-50 text-success-700 ring-success-200",
  warning: "bg-warning-50 text-warning-800 ring-warning-200",
  danger: "bg-danger-50 text-danger-700 ring-danger-200",
  info: "bg-info-50 text-info-800 ring-info-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

export type Tone = keyof typeof tones;

/** Pill used for every status in the admin (certificates, registrations, publish state). */
export const badgeClass = (tone: Tone) =>
  cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ring-1 ring-inset", tones[tone]);

export function StatusBadge({ tone, className, children }: { tone: Tone; className?: string; children: ReactNode }) {
  return <span className={cn(badgeClass(tone), className)}>{children}</span>;
}
