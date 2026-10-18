"use client";

import type { ComponentProps } from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 select-none", className)}
      {...props}
    />
  );
}
