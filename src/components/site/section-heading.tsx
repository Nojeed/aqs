import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  light?: boolean;
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-6 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className={`eyebrow ${light ? "text-accent-300" : ""}`}>{eyebrow}</p>}
        <h2
          className={`font-display mt-3 text-3xl font-bold text-balance sm:text-4xl ${light ? "text-white" : "text-brand-950"}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-4 text-lg leading-8 text-pretty ${light ? "text-white/70" : "text-slate-600"}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
