"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// The animation engine for <m.*> elements arrives in its own file, so it doesn't delay the first paint.
const features = () => import("./motion-features").then((mod) => mod.default);

/** Motion follows the visitor's "reduce motion" setting: movement is dropped, fades stay. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
