"use client";

import { exportToExcel, exportToPdf } from "@/lib/export-files";
import { HiOutlineDocumentDownload, HiOutlineDocumentText } from "react-icons/hi";

type ReportKind = "stock" | "movements" | "alerts";

type Props = {
  stockRows: Record<string, string | number>[];
  movementRows: Record<string, string | number>[];
  alertRows: Record<string, string | number>[];
};

const STOCK_COLS = [
  { header: "SKU", key: "sku" },
  { header: "Produit", key: "name" },
  { header: "Catégorie", key: "category" },
  { header: "Fournisseur", key: "supplier" },
  { header: "Unité", key: "unit" },
  { header: "Quantité", key: "quantity" },
  { header: "Seuil", key: "alertThreshold" },
  { header: "Prix achat", key: "purchasePrice" },
  { header: "Prix vente", key: "salePrice" },
  { header: "Valeur stock", key: "stockValue" },
  { header: "Statut", key: "status" },
];

const MOVE_COLS = [
  { header: "Date", key: "date" },
  { header: "Type", key: "type" },
  { header: "SKU", key: "sku" },
  { header: "Produit", key: "product" },
  { header: "Qté", key: "quantity" },
  { header: "Avant", key: "before" },
  { header: "Après", key: "after" },
  { header: "Motif", key: "reason" },
  { header: "Référence", key: "reference" },
  { header: "Utilisateur", key: "user" },
];

const ALERT_COLS = [
  { header: "SKU", key: "sku" },
  { header: "Produit", key: "name" },
  { header: "Catégorie", key: "category" },
  { header: "Quantité", key: "quantity" },
  { header: "Seuil", key: "alertThreshold" },
  { header: "Statut", key: "status" },
];

function getConfig(kind: ReportKind, props: Props) {
  if (kind === "stock") {
    return {
      title: "État du stock DealZone",
      filename: `dealzone-stock-${Date.now()}`,
      sheet: "Stock",
      columns: STOCK_COLS,
      rows: props.stockRows,
    };
  }
  if (kind === "movements") {
    return {
      title: "Mouvements de stock (30 jours)",
      filename: `dealzone-mouvements-${Date.now()}`,
      sheet: "Mouvements",
      columns: MOVE_COLS,
      rows: props.movementRows,
    };
  }
  return {
    title: "Alertes stock bas / rupture",
    filename: `dealzone-alertes-${Date.now()}`,
    sheet: "Alertes",
    columns: ALERT_COLS,
    rows: props.alertRows,
  };
}

export function ReportsPanel(props: Props) {
  const reports: {
    kind: ReportKind;
    title: string;
    description: string;
    count: number;
  }[] = [
    {
      kind: "stock",
      title: "État du stock",
      description: "Catalogue complet avec quantités, prix et valorisation.",
      count: props.stockRows.length,
    },
    {
      kind: "movements",
      title: "Mouvements (30 jours)",
      description: "Historique des entrées, sorties et ajustements.",
      count: props.movementRows.length,
    },
    {
      kind: "alerts",
      title: "Alertes stock",
      description: "Produits en rupture ou sous le seuil d'alerte.",
      count: props.alertRows.length,
    },
  ];

  function download(kind: ReportKind, format: "excel" | "pdf") {
    const cfg = getConfig(kind, props);
    if (cfg.rows.length === 0) {
      alert("Aucune donnée à exporter pour ce rapport.");
      return;
    }
    if (format === "excel") {
      exportToExcel(cfg.filename, cfg.sheet, cfg.columns, cfg.rows);
    } else {
      exportToPdf(cfg.filename, cfg.title, cfg.columns, cfg.rows);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {reports.map((report) => (
        <article
          key={report.kind}
          className="flex flex-col rounded-2xl border border-base-300 bg-base-100 p-5"
        >
          <h2 className="text-lg font-semibold">{report.title}</h2>
          <p className="mt-1 flex-1 text-sm opacity-60">{report.description}</p>
          <p className="mt-3 text-xs font-medium opacity-50">
            {report.count} ligne{report.count > 1 ? "s" : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl gap-1.5"
              onClick={() => download(report.kind, "excel")}
            >
              <HiOutlineDocumentDownload className="size-4" />
              Excel
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm rounded-xl gap-1.5"
              onClick={() => download(report.kind, "pdf")}
            >
              <HiOutlineDocumentText className="size-4" />
              PDF
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
