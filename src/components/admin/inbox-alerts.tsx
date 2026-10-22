"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

type Arrival = { kind: "registrations" | "messages"; id: string; name: string; detail: string; createdAt: string };
type Counts = { registrations: number; messages: number };

// Tiny shared store so the watcher (mounted once) can feed the sidebar badges.
let counts: Counts = { registrations: 0, messages: 0 };
const listeners = new Set<() => void>();
const store = {
  subscribe: (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn)),
  get: () => counts,
  set: (next: Counts) => {
    counts = next;
    listeners.forEach((fn) => fn());
  },
};

const POLL = 30_000;
const DESKTOP_KEY = "aqs-desktop-alerts";

/** Number of new registrations or messages, for a sidebar badge. */
export function InboxBadge({ kind }: { kind: keyof Counts }) {
  const n = useSyncExternalStore(store.subscribe, () => store.get()[kind], () => 0);
  if (!n) return null;
  return (
    <span className="ms-auto rounded-full bg-accent-400 px-2 py-0.5 text-xs font-bold text-brand-950 tabular-nums" aria-label={`${n} new`}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

/**
 * Polls the inbox while the admin is open: updates the badges and the tab title, and announces
 * new registrations and messages with a toast (plus a desktop notification when enabled and the tab is hidden).
 */
export function InboxWatcher() {
  const router = useRouter();
  const lastSeen = useRef<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let total = 0;
    // Next rewrites <title> on every navigation and refresh, so re-apply the "(3) " prefix whenever it changes.
    const applyTitle = () => {
      const base = document.title.replace(/^\(\d+\+?\)\s*/, "");
      const want = total ? `(${total}) ${base}` : base;
      if (document.title !== want) document.title = want;
    };
    const titleWatcher = new MutationObserver(applyTitle);
    titleWatcher.observe(document.head, { subtree: true, childList: true, characterData: true });

    async function poll() {
      try {
        const res = await fetch("/api/admin/inbox", { cache: "no-store" });
        if (!res.ok || stopped) return;
        const data = (await res.json()) as Counts & { latest: Arrival[] };
        store.set({ registrations: data.registrations, messages: data.messages });
        total = data.registrations + data.messages;
        applyTitle();

        const newest = data.latest[0]?.createdAt ?? "";
        if (lastSeen.current === null) {
          lastSeen.current = newest; // first load: don't announce what was already there
          return;
        }
        const arrivals = data.latest.filter((a) => a.createdAt > (lastSeen.current ?? ""));
        if (!arrivals.length) return;
        lastSeen.current = newest;
        router.refresh(); // tables and dashboard pick up the new rows

        for (const a of arrivals.slice(0, 3).reverse()) {
          const title = a.kind === "registrations" ? `New registration: ${a.name}` : `New message from ${a.name}`;
          const href = `/admin/${a.kind}/${a.id}`;
          toast.info(title, { description: a.detail, action: { label: "Open", onClick: () => router.push(href) }, duration: 10_000 });
          if (document.hidden && localStorage.getItem(DESKTOP_KEY) === "on" && Notification.permission === "granted") {
            const n = new Notification(title, { body: a.detail, tag: a.id, icon: "/icon.png" });
            n.onclick = () => {
              window.focus();
              router.push(href);
              n.close();
            };
          }
        }
        if (arrivals.length > 3) toast.info(`${arrivals.length - 3} more new items`);
      } catch {
        // Offline or signed out: try again on the next tick.
      }
    }

    poll();
    const timer = setInterval(poll, POLL);
    const onVisible = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      titleWatcher.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}


/** Sidebar switch for desktop notifications (asks the browser for permission the first time). */
export function DesktopAlertsToggle() {
  // "unsupported" on the server and in browsers without notifications.
  const state = useSyncExternalStore(
    store.subscribe,
    () => (typeof Notification === "undefined" ? "unsupported" : localStorage.getItem(DESKTOP_KEY) === "on" && Notification.permission === "granted" ? "on" : "off"),
    () => "unsupported",
  );
  if (state === "unsupported") return null;
  const on = state === "on";
  return (
    <button
      type="button"
      onClick={async () => {
        if (on) localStorage.setItem(DESKTOP_KEY, "off");
        else {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.error("Desktop alerts are blocked in this browser. Allow notifications for this site in the browser settings.");
            return;
          }
          localStorage.setItem(DESKTOP_KEY, "on");
          toast.success("Desktop alerts on. You'll be notified of new registrations and messages while this tab is in the background.");
        }
        store.set({ ...store.get() }); // re-render subscribers
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"
      aria-pressed={on}
    >
      {on ? <Bell className="size-4" aria-hidden /> : <BellOff className="size-4" aria-hidden />}
      Desktop alerts: {on ? "on" : "off"}
    </button>
  );
}

