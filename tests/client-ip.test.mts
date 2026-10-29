// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIp } from "../src/lib/client-ip.ts";

test("a value the visitor sent first can't hide their real address", () => {
  assert.equal(clientIp("1.1.1.1, 203.0.113.7", 1), "203.0.113.7");
});

test("with two proxies (e.g. Cloudflare in front) the visitor is two from the end", () => {
  assert.equal(clientIp("1.1.1.1, 203.0.113.7, 172.68.0.1", 2), "203.0.113.7");
});

test("a single entry, or more proxies than entries, uses the first", () => {
  assert.equal(clientIp("203.0.113.7", 1), "203.0.113.7");
  assert.equal(clientIp("203.0.113.7", 3), "203.0.113.7");
});

test("no header (local development)", () => {
  assert.equal(clientIp(null), "local");
  assert.equal(clientIp(" , "), "local");
});
