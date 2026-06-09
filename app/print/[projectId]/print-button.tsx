"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
