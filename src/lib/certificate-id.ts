/**
 * Lookup key for a certificate number: case, spaces, dashes and other separators don't matter,
 * and Arabic-Indic digits count as Latin ones. "aqs 2026 ٠٠٠١" finds "AQS-2026-0001".
 */
export function normalizeId(id: string) {
  return id
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
