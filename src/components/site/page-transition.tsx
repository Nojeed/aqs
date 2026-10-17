"use client";

import { stagger, useAnimate } from "motion/react";
import { useEffect, useLayoutEffect, type ReactNode } from "react";

let hydrated = false;
let isPop = false;
let animatedThisFrame = false;
if (typeof window !== "undefined") {
  addEventListener("popstate", () => (isPop = true));
  addEventListener("click", () => (isPop = false), true);
}

/**
 * Animates each page in on navigation. Used as template.tsx. Next keeps visited pages mounted
 * but hidden (React Activity), so the animation runs from a layout effect, which re-runs every
 * time a page is shown again, instead of on mount.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useLayoutEffect(() => {
    // First load shows the server HTML as is; nested templates shown in the same commit animate once.
    if (!hydrated || animatedThisFrame) return;
    animatedThisFrame = true;
    requestAnimationFrame(() => (animatedThisFrame = false));
    // Next scrolls to the top only after the page has streamed in, so the page would animate in
    // mid-scroll and then jump. Back/forward keeps its position.
    if (!isPop && !location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    // Animate the section contents, not the sections: fading whole sections flashes the white
    // page background between the navy heroes.
    const onScreen = [...scope.current.querySelectorAll<HTMLElement>(".container-page")].filter(
      (el) => el.getBoundingClientRect().top < window.innerHeight,
    );
    const targets = onScreen.length ? onScreen : [scope.current];
    // Hide before this frame paints; motion applies its first keyframe a frame later.
    for (const el of targets) el.style.opacity = "0";
    const controls = animate(
      targets,
      { opacity: [0, 1], y: [32, 0] },
      { duration: 0.6, delay: stagger(0.08), ease: [0.22, 1, 0.36, 1] },
    );
    // Hidden mid-animation (or Strict Mode's dev re-run): never leave content stuck invisible.
    return () => {
      animatedThisFrame = false;
      controls.stop();
      for (const el of targets) el.style.opacity = el.style.transform = "";
    };
  }, [animate, scope]);
  useEffect(() => {
    hydrated = true;
  }, []);

  return <div ref={scope}>{children}</div>;
}
