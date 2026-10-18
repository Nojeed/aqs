// Run with: npm test (Node runs the TypeScript directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv, toCsv } from "../src/lib/csv.ts";

test("round trip keeps commas, quotes, newlines and Arabic", () => {
  const rows = [
    ["id", "name", "note"],
    ["AQS-1", 'Sara "Sue" Ali', "line 1\nline 2, still"],
    ["AQS-2", "أحمد محمد", ""],
  ];
  assert.deepEqual(parseCsv(toCsv(rows)), rows);
});

test("formula-looking cells are neutralised on export", () => {
  assert.equal(toCsv([["=HYPERLINK(\"x\")"]]).trim().replace(/^﻿/, ""), "\"'=HYPERLINK(\"\"x\"\")\"");
});

test("parses CRLF, BOM and skips blank lines", () => {
  assert.deepEqual(parseCsv("﻿a,b\r\n1,2\r\n\r\n3,4"), [["a", "b"], ["1", "2"], ["3", "4"]]);
});
