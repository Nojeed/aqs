import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/** aria props for the control inside a Field, so the error or help text is announced with it. */
export function fieldAria(id: string, { error, help }: { error?: ReactNode; help?: ReactNode }) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : help ? `${id}-help` : undefined,
  } as const;
}

/** Label + control + help or error text. Spread fieldAria(id, …) onto the control. */
export function Field({
  id,
  label,
  help,
  error,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-slot="field" className={cn("block", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger-600">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-slate-500">
          {help}
        </p>
      ) : null}
    </div>
  );
}
