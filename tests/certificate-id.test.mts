// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeId } from "../src/lib/certificate-id.ts";

test("separators, case and Arabic digits don't matter", () => {
  const key = normalizeId("AQS-2026-0001");
  for (const typed of ["aqs-2026-0001", "AQS 2026 0001", " aqs20260001 ", "AQS.2026.0001", "AQS-٢٠٢٦-٠٠٠١", "AQS-۲۰۲۶-۰۰۰۱"]) {
    assert.equal(normalizeId(typed), key, typed);
  }
});

test("different numbers stay different", () => {
  assert.notEqual(normalizeId("AQS-2026-0001"), normalizeId("AQS-2026-0010"));
});
