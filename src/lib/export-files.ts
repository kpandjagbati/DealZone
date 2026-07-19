"use client";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type ExportColumn = { header: string; key: string };

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(
  filename: string,
  sheetName: string,
  columns: ExportColumn[],
  rows: Record<string, string | number>[],
) {
  const data = rows.map((row) => {
    const obj: Record<string, string | number> = {};
    for (const col of columns) {
      obj[col.header] = row[col.key] ?? "";
    }
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    `${filename}.xlsx`,
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
}

export function exportToPdf(
  filename: string,
  title: string,
  columns: ExportColumn[],
  rows: Record<string, string | number>[],
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")} — DealZone`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 102, 0] },
  });

  doc.save(`${filename}.pdf`);
}
