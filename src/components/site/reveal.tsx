"use client";

import { inView, useAnimate } from "motion/react";
import { duration, ease } from "@/lib/motion";
import { useEffect, useRef, type ReactNode } from "react";

/** Fades content up as it scrolls into view. Content stays visible without JS. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const [, animate] = useAnimate(); // scoped animate: follows MotionConfig's reduced-motion setting

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
    el.style.opacity = "0";
    const stop = inView(
      el,
      () => {
        animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: duration.reveal, delay: delay / 1000, ease });
      },
      { margin: "0px 0px -10% 0px" },
    );
    // Next hides visited pages instead of unmounting them; leave nothing invisible behind.
    return () => {
      stop();
      el.style.opacity = el.style.transform = "";
    };
  }, [animate, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
