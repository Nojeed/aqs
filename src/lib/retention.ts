// How long registrations and messages are kept (Admin → Site content → Privacy). 0 or unset: until staff delete them.

/** Entries newer than `months` months; everything when months is 0 or not a positive number. */
export function withinRetention<T extends { createdAt: string }>(list: T[], months: number | undefined, now = new Date()) {
  if (!months || months <= 0) return list;
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - Math.floor(months));
  return list.filter((entry) => !(new Date(entry.createdAt) < cutoff));
}

/** The sentence added to the forms' privacy line, e.g. "We delete them after 12 months." */
export function retentionText(locale: "ar" | "en", months: number | undefined) {
  if (!months || months <= 0) return "";
  const n = Math.floor(months);
  if (locale === "en") return `We delete them after ${n} month${n === 1 ? "" : "s"}.`;
  // Arabic counted nouns: 1 شهر واحد, 2 شهرين, 3–10 أشهر, 11+ شهرًا.
  const span = n === 1 ? "شهر واحد" : n === 2 ? "شهرين" : n <= 10 ? `${n} أشهر` : `${n} شهرًا`;
  return `ونحذفها بعد ${span}.`;
}
