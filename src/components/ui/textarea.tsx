import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClass, WithIcon } from "./input";

export function Textarea({ className, icon, ...props }: ComponentProps<"textarea"> & { icon?: LucideIcon }) {
  return (
    <WithIcon icon={icon} top>
      <textarea data-slot="textarea" className={cn(controlClass, "peer min-h-24 py-2.5 leading-6", className)} {...props} />
    </WithIcon>
  );
}
