// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { certificatesFromCsv, certificatesToCsv, normalizeDate } from "../src/lib/csv.ts";

test("maps Excel-style headers and normalises dates", () => {
  const csv = "Certificate Number,Trainee Name,Issue Date,Expiry Date,Training Hours,Status\nAQS-1,Sara Ali,15/03/2026,2029-03-15,24,Revoked\n";
  assert.deepEqual(certificatesFromCsv(csv), [
    { id: "AQS-1", name: "Sara Ali", issueDate: "2026-03-15", expiryDate: "2029-03-15", hours: 24, status: "revoked" },
  ]);
});

test("Excel serial dates", () => {
  assert.equal(normalizeDate("46096"), "2026-03-15");
});

test("rejects files without id and name columns", () => {
  assert.throws(() => certificatesFromCsv("foo,bar\n1,2"), /"id" and "name"/);
});

test("export then import round trips", () => {
  const list = [{ id: "AQS-2", name: "أحمد", course: "HACCP, Level 3", issueDate: "2026-01-02" }];
  assert.deepEqual(certificatesFromCsv(certificatesToCsv(list)), list);
});
