"use client";

import { createContext, use, useState, type ComponentProps } from "react";
import { motion } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { easeLuxe } from "@/lib/motion";
import { cn } from "@/lib/utils";

// True once the visitor has switched tabs: the panel in the server HTML must not start hidden.
const Switched = createContext(false);

export function Tabs({ onValueChange, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  const [switched, setSwitched] = useState(false);
  return (
    <Switched value={switched}>
      <TabsPrimitive.Root
        onValueChange={(value) => {
          setSwitched(true);
          onValueChange?.(value);
        }}
        {...props}
      />
    </Switched>
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("flex w-full gap-1 rounded-xl bg-slate-100 p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition",
        "hover:text-brand-900 data-[state=active]:bg-white data-[state=active]:text-brand-900 data-[state=active]:shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-accent-500",
        className,
      )}
      {...props}
    />
  );
}

/** Radix mounts a panel when its tab is chosen, so the new panel rises into focus on every switch. */
export function TabsContent({ className, children, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={cn("mt-8 outline-none", className)} {...props}>
      <motion.div
        initial={use(Switched) && { opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ duration: 0.6, ease: easeLuxe }}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}
