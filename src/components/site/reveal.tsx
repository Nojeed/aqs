"use client";

import { inView, useAnimate } from "motion/react";
import { clearRise, clearRiseWhenDone, containsGlass, duration, easeLuxe, hideForRise, riseKeyframes } from "@/lib/motion";
import { useEffect, useRef, type ReactNode } from "react";

/** Content rises into focus as it scrolls into view (glass content only rises). Visible without JS. */
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
    const glass = containsGlass(el);
    hideForRise(el, glass, 28);
    const stop = inView(
      el,
      () => {
        clearRiseWhenDone(animate(el, riseKeyframes(glass, 28), { duration: duration.reveal, delay: delay / 1000, ease: easeLuxe }), el);
      },
      { margin: "0px 0px -10% 0px" },
    );
    // Next hides visited pages instead of unmounting them; leave nothing invisible behind.
    return () => {
      stop();
      clearRise(el);
    };
  }, [animate, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
