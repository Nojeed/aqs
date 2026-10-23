"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { easeLuxe } from "@/lib/motion";

/**
 * Grid for filtered lists (courses, blog). Leaving items dissolve (fade, soft blur, slight lift), the items
 * that stay glide to their new places on a long ease-out, and arriving items rise into focus one after another
 * once the leaving ones are gone. Reduced motion keeps only the fades (MotionConfig drops the movement).
 */
export function AnimatedGrid({ items, className, empty }: { items: { id: string; node: ReactNode }[]; className: string; empty: string }) {
  return (
    <>
      <ul className={className}>
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transitionEnd: { filter: "none" },
                transition: { duration: 0.8, ease: easeLuxe, delay: 0.18 + Math.min(index, 8) * 0.07 },
              }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
              transition={{ layout: { duration: 0.75, ease: easeLuxe } }}
            >
              {item.node}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <AnimatePresence>
        {items.length === 0 && (
          <motion.p
            key="none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: easeLuxe, delay: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500"
          >
            {empty}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}

/** The results count, crossfading when the number changes. */
export function AnimatedCount({ value }: { value: number }) {
  return (
    <span className="relative inline-grid font-semibold text-brand-950 tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: easeLuxe }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
