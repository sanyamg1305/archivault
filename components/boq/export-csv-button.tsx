"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportCSVButton({
  projectName,
  materials,
}: {
  projectName: string;
  materials: any[];
}) {
  function handleExport() {
    const rows = [
      ["Material", "Category", "Brand", "Vendor", "Room", "Status", "Estimated Cost (INR)"],
      ...materials.map((m) => [
        m.name ?? "",
        m.category ?? "",
        m.brand ?? "",
        m.vendor ?? "",
        Array.isArray(m.rooms) ? (m.rooms[0]?.name ?? "") : (m.rooms?.name ?? ""),
        m.status ?? "",
        String(Number(m.estimated_cost ?? 0).toFixed(2)),
      ]),
    ];

    // Subtotals per category
    const byCategory = new Map<string, number>();
    for (const m of materials) {
      if (m.status === "Rejected") continue;
      const cat = m.category || "Uncategorised";
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(m.estimated_cost ?? 0));
    }
    rows.push([]);
    rows.push(["--- Category Subtotals ---"]);
    for (const [cat, total] of byCategory.entries()) {
      rows.push([cat, "", "", "", "", "", String(total.toFixed(2))]);
    }

    const grandTotal = materials
      .filter((m) => m.status !== "Rejected")
      .reduce((s, m) => s + Number(m.estimated_cost ?? 0), 0);
    rows.push([]);
    rows.push(["GRAND TOTAL", "", "", "", "", "", String(grandTotal.toFixed(2))]);

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/[^a-z0-9]/gi, "_")}_BOQ.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
