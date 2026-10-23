"use client";

import { useAnimate } from "motion/react";
import { clearRise, clearRiseWhenDone, containsGlass, duration, easeLuxe, hideForRise, riseKeyframes } from "@/lib/motion";
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
    // Rise into focus, one section after another. Set the start before this frame paints
    // (motion applies its first keyframe a frame later); sections holding glass only rise.
    const runs = targets.map((el, i) => {
      const glass = containsGlass(el);
      hideForRise(el, glass, 32);
      const controls = animate(el, riseKeyframes(glass, 32), { duration: duration.page, delay: i * 0.08, ease: easeLuxe });
      clearRiseWhenDone(controls, el);
      return controls;
    });
    // Hidden mid-animation (or Strict Mode's dev re-run): never leave content stuck invisible.
    return () => {
      animatedThisFrame = false;
      runs.forEach((c) => c.stop());
      targets.forEach(clearRise);
    };
  }, [animate, scope]);
  useEffect(() => {
    hydrated = true;
  }, []);

  return <div ref={scope}>{children}</div>;
}
