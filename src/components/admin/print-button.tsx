"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary rounded-lg px-4 py-2">
      <Printer className="size-4" aria-hidden /> Print or save as PDF
    </button>
  );
}
