/** Minimal RFC 4180 CSV for Excel round trips (export registrations and messages, certificate import/export). */

// Cells starting with these run as formulas in Excel; prefix them so exported data stays data.
const FORMULA = /^[=+\-@\t\r]/;

function cell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (FORMULA.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Rows to CSV text. Starts with a BOM so Excel opens Arabic text as UTF-8. */
export function toCsv(rows: unknown[][]) {
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

/** CSV text to rows of strings. Handles quotes, escaped quotes, commas/newlines in quotes, CRLF, BOM. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/* ----------------------------------------------------- certificates */

/** Columns in certificate CSV files, in export order. */
export const CERTIFICATE_COLUMNS = [
  "id",
  "name",
  "nameAr",
  "course",
  "courseAr",
  "issueDate",
  "expiryDate",
  "hours",
  "grade",
  "gradeAr",
  "status",
] as const;

// Header spellings staff are likely to use in Excel, mapped to our field names.
const ALIASES: Record<string, (typeof CERTIFICATE_COLUMNS)[number]> = {
  id: "id",
  number: "id",
  certificatenumber: "id",
  certificateno: "id",
  certificate: "id",
  name: "name",
  traineename: "name",
  namear: "nameAr",
  arabicname: "nameAr",
  course: "course",
  coursename: "course",
  coursear: "courseAr",
  arabiccourse: "courseAr",
  issuedate: "issueDate",
  issued: "issueDate",
  dateissued: "issueDate",
  expirydate: "expiryDate",
  expires: "expiryDate",
  expiry: "expiryDate",
  hours: "hours",
  traininghours: "hours",
  grade: "grade",
  gradear: "gradeAr",
  status: "status",
};

/** Normalise dates to YYYY-MM-DD: accepts YYYY-MM-DD, day-first D/M/YYYY, and Excel serial numbers. */
export function normalizeDate(value: string) {
  const v = value.trim();
  if (!v || /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(v);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  if (/^\d{5}$/.test(v)) return new Date(Date.UTC(1899, 11, 30) + Number(v) * 86_400_000).toISOString().slice(0, 10);
  return v;
}

/** CSV text to plain certificate objects (validated afterwards by parseCertificates). */
export function certificatesFromCsv(text: string): Record<string, string | number>[] {
  const [header, ...rows] = parseCsv(text);
  if (!header) throw new Error("The CSV file is empty.");
  const fields = header.map((h) => ALIASES[h.toLowerCase().replace(/[^a-z]/g, "")]);
  if (!fields.includes("id") || !fields.includes("name")) {
    throw new Error(`The first row must name the columns, including "id" and "name". Expected: ${CERTIFICATE_COLUMNS.join(", ")}.`);
  }
  return rows.map((row) => {
    const entry: Record<string, string | number> = {};
    fields.forEach((field, i) => {
      const value = (row[i] ?? "").trim();
      if (!field || !value) return;
      if (field === "issueDate" || field === "expiryDate") entry[field] = normalizeDate(value);
      else if (field === "hours") entry[field] = Number(value) || value;
      else if (field === "status") entry[field] = value.toLowerCase();
      else entry[field] = value;
    });
    return entry;
  });
}

export function certificatesToCsv(list: Record<string, unknown>[]) {
  return toCsv([[...CERTIFICATE_COLUMNS], ...list.map((c) => CERTIFICATE_COLUMNS.map((k) => c[k]))]);
}
