/**
 * The visitor's IP for rate limits and login lockouts. Each proxy appends the address it received the request
 * from to X-Forwarded-For, so only entries counted from the end are trustworthy; a visitor can put anything at
 * the start. TRUSTED_PROXIES is how many proxies sit in front of the app (Hostinger: 1; add one for Cloudflare).
 */
export function clientIp(forwardedFor: string | null | undefined, trustedProxies = Number(process.env.TRUSTED_PROXIES) || 1) {
  const hops = (forwardedFor ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return hops[Math.max(0, hops.length - trustedProxies)] || "local";
}
