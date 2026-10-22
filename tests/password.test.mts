// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, passwordProblem, verifyPassword } from "../src/lib/password.ts";

test("right password verifies, wrong one doesn't", () => {
  const stored = hashPassword("correct horse battery");
  assert.ok(verifyPassword("correct horse battery", stored));
  assert.ok(!verifyPassword("correct horse batterY", stored));
  assert.ok(!verifyPassword("", stored));
});

test("same password hashes differently each time (random salt)", () => {
  assert.notEqual(hashPassword("same password 1"), hashPassword("same password 1"));
});

test("malformed stored values never verify", () => {
  for (const bad of ["", "plain", "md5:x:y", "scrypt::", "scrypt:salt:"]) assert.ok(!verifyPassword("x", bad), bad);
});

test("weak passwords are refused", () => {
  assert.ok(passwordProblem("short"));
  assert.ok(passwordProblem("aaaaaaaaaaaa"));
  assert.equal(passwordProblem("a long enough pass"), null);
});
