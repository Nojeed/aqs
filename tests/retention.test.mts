// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { retentionText, withinRetention } from "../src/lib/retention.ts";

const now = new Date("2026-10-29T12:00:00Z");
const list = [
  { id: "old", createdAt: "2025-09-01T10:00:00Z" },
  { id: "edge", createdAt: "2025-10-29T12:00:00Z" },
  { id: "new", createdAt: "2026-10-01T10:00:00Z" },
];

test("keeps everything when no period is set", () => {
  assert.equal(withinRetention(list, 0, now).length, 3);
  assert.equal(withinRetention(list, undefined, now).length, 3);
});

test("drops entries older than the period, keeps the one exactly on the cutoff", () => {
  assert.deepEqual(withinRetention(list, 12, now).map((e) => e.id), ["edge", "new"]);
  assert.deepEqual(withinRetention(list, 1, now).map((e) => e.id), ["new"]);
});

test("privacy sentence in both languages, with Arabic number grammar", () => {
  assert.equal(retentionText("en", 0), "");
  assert.equal(retentionText("en", 1), "We delete them after 1 month.");
  assert.equal(retentionText("en", 12), "We delete them after 12 months.");
  assert.equal(retentionText("ar", 2), "ونحذفها بعد شهرين.");
  assert.equal(retentionText("ar", 6), "ونحذفها بعد 6 أشهر.");
  assert.equal(retentionText("ar", 24), "ونحذفها بعد 24 شهرًا.");
});
