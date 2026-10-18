import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { controlClass } from "./input";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(controlClass, "min-h-24 py-2.5 leading-6", className)} {...props} />;
}
