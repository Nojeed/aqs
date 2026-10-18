"use client";

import { useSyncExternalStore } from "react";

const SOON_DAYS = 30;
const DAY = 86_400_000;
const noop = () => () => {};

/**
 * "Starts soon" badge for courses starting within 30 days. Worked out in the browser,
 * because course pages are pre-rendered and a server-computed date would go stale.
 */
export function StartsSoon({ date, label }: { date: string; label: string }) {
  // Today's day number; null on the server and during hydration, so nothing renders there.
  const today = useSyncExternalStore(noop, () => Math.floor(Date.now() / DAY), () => null);
  if (today === null) return null;
  const days = new Date(`${date}T00:00:00Z`).getTime() / DAY - today;
  if (days < -1 || days > SOON_DAYS) return null;
  return (
    <span className="absolute end-4 top-4 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-brand-950 shadow">
      {label}
    </span>
  );
}
