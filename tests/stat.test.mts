// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseStat, wheelTurns } from "../src/lib/stat.ts";

test("splits a stat into the text around it and the digits", () => {
  assert.deepEqual(parseStat("2,500+"), { prefix: "", digits: "2,500", suffix: "+" });
  assert.deepEqual(parseStat("98%"), { prefix: "", digits: "98", suffix: "%" });
  assert.deepEqual(parseStat("$4.5M"), { prefix: "$", digits: "4.5", suffix: "M" });
  assert.deepEqual(parseStat("7 days"), { prefix: "", digits: "7", suffix: " days" });
});

test("text without a number is left alone", () => {
  assert.equal(parseStat("ISO"), null);
});

test("each digit to the right turns one more round, separators stay still", () => {
  assert.deepEqual(wheelTurns("2,500"), [2, null, 15, 20, 30]);
  assert.deepEqual(wheelTurns("98"), [9, 18]);
  assert.deepEqual(wheelTurns("12345"), [1, 12, 23, 34, 35]);
});
