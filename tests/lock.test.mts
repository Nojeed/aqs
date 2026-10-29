// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { lockFile } from "../src/lib/lock.ts";

const tick = () => new Promise((r) => setTimeout(r, 5));

test("read-change-writes on the same file never interleave", async () => {
  let stored = 0;
  const increment = async () => {
    using _lock = await lockFile("counter.json");
    const read = stored;
    await tick(); // another request would read the same value here without the lock
    stored = read + 1;
  };
  await Promise.all(Array.from({ length: 20 }, increment));
  assert.equal(stored, 20);
});

test("an error frees the lock for the next writer", async () => {
  const failing = async () => {
    using _lock = await lockFile("broken.json");
    throw new Error("disk full");
  };
  await assert.rejects(failing());
  using _lock = await lockFile("broken.json");
  assert.ok(_lock);
});

test("different files don't wait for each other", async () => {
  using _a = await lockFile("a.json");
  const b = await Promise.race([lockFile("b.json"), tick().then(() => "timeout")]);
  assert.notEqual(b, "timeout");
});
