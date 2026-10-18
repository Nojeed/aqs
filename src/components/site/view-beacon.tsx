"use client";

import { useEffect } from "react";

/** Tells the server this page was viewed, once per browser session. Feeds the admin "most viewed" charts. */
export function ViewBeacon({ type, slug }: { type: "courses" | "posts" | "services"; slug: string }) {
  useEffect(() => {
    const key = `aqs-viewed:${type}/${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: the server still ignores repeats for 30 minutes.
    }
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug }),
      keepalive: true,
    }).catch(() => {});
  }, [type, slug]);
  return null;
}
