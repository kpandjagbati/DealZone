import { auth } from "@/auth";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";
import { PageHeader } from "@/components/dashboard/ui";
import {
  getLowStockReportRows,
  getMovementsReportRows,
  getStockReportRows,
} from "@/lib/reports-data";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "GESTIONNAIRE" &&
      session.user.role !== "MAGASINIER")
  ) {
    redirect("/dashboard");
  }

  const [stockRows, movementRows, alertRows] = await Promise.all([
    getStockReportRows(),
    getMovementsReportRows(30),
    getLowStockReportRows(),
  ]);

  return (
    <div>
      <PageHeader
        title="Rapports"
        subtitle="Téléchargez un récapitulatif en Excel (.xlsx) ou PDF."
      />
      <ReportsPanel
        stockRows={stockRows}
        movementRows={movementRows}
        alertRows={alertRows}
      />
    </div>
  );
}
