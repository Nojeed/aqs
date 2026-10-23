"use client";

import { inView, useAnimate, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { easeLuxe } from "@/lib/motion";
import { parseStat, wheelTurns } from "@/lib/stat";

// Every wheel holds four rounds of 0–9 (the most any digit turns) plus the final round.
const WHEEL = Array.from({ length: 50 }, (_, i) => i % 10);
const at = (turns: number) => `${(-turns / WHEEL.length) * 100}%`;

/**
 * A stat whose digits roll up like an odometer the first time it scrolls into view, blurred while they spin
 * and settling into focus. The server HTML already shows the final number (wheels parked on it), so it reads
 * right without JavaScript and with reduced motion. Screen readers get the plain value from the caller.
 */
export function CountUp({ value }: { value: string }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const stat = parseStat(value);
  const turns = stat ? wheelTurns(stat.digits) : [];

  useEffect(() => {
    const wheels = [...scope.current.querySelectorAll<HTMLElement>("[data-wheel]")];
    if (reduced || !wheels.length) return;
    const park = () => wheels.forEach((w) => ((w.style.transform = `translateY(${at(Number(w.dataset.wheel))})`), (w.style.filter = "")));
    for (const w of wheels) w.style.transform = "translateY(0%)";
    const runs: ReturnType<typeof animate>[] = [];
    const stop = inView(
      scope.current,
      () => {
        wheels.forEach((w, i) => {
          const travel = Number(w.dataset.wheel);
          // Blur with speed: far-travelling wheels spin faster, so they blur more.
          const blur = Math.min(6, 1 + travel / 6);
          const run = animate(
            w,
            { y: ["0%", at(travel)], filter: ["blur(0px)", `blur(${blur}px)`, "blur(0px)"] },
            {
              y: { duration: 2.2, ease: easeLuxe, delay: (wheels.length - 1 - i) * 0.06 },
              filter: { duration: 2.2, times: [0, 0.12, 0.75], ease: "easeOut", delay: (wheels.length - 1 - i) * 0.06 },
            },
          );
          run.then(() => requestAnimationFrame(() => (w.style.filter = "")));
          runs.push(run);
        });
      },
      { margin: "0px 0px -10% 0px" },
    );
    // Next keeps visited pages mounted but hidden; never leave a wheel half-turned.
    return () => {
      stop();
      runs.forEach((r) => r.stop());
      park();
    };
  }, [animate, scope, reduced, value]);

  if (!stat) return <span aria-hidden>{value}</span>;
  return (
    <span ref={scope} aria-hidden className="inline-flex select-none">
      {stat.prefix}
      {[...stat.digits].map((char, i) =>
        turns[i] === null ? (
          <span key={i}>{char}</span>
        ) : (
          // The mask fades digits passing the top and bottom edges; the parked digit sits in the clear middle.
          <span
            key={i}
            className="inline-block h-[1.15em] overflow-hidden leading-[1.15em] [mask-image:linear-gradient(transparent,#000_18%,#000_82%,transparent)]"
          >
            <span data-wheel={turns[i]} className="flex flex-col will-change-transform" style={{ transform: `translateY(${at(turns[i]!)})` }}>
              {WHEEL.map((d, j) => (
                <span key={j}>{d}</span>
              ))}
            </span>
          </span>
        ),
      )}
      {stat.suffix}
    </span>
  );
}
