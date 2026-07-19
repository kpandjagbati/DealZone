import { auth } from "@/auth";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MagasinierDashboardPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "MAGASINIER" && session.user.role !== "ADMIN")
  ) {
    redirect("/dashboard");
  }

  const [products, movementsToday, lowStockRows] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { quantity: true, alertThreshold: true, name: true, sku: true },
      orderBy: { quantity: "asc" },
      take: 6,
    }),
  ]);

  const alerts = lowStockRows.filter((p) => p.quantity <= p.alertThreshold);

  return (
    <div>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Stock disponible et mouvements du jour."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Produits" value={products} />
        <StatCard
          label="Mouvements du jour"
          value={movementsToday}
          href="/dashboard/movements"
        />
        <StatCard label="Alertes" value={alerts.length} />
      </div>

      <Panel className="mt-6" title="Stock à surveiller">
        {alerts.length === 0 ? (
          <p className="text-sm opacity-60">Aucune alerte pour le moment.</p>
        ) : (
          <ul className="divide-y divide-base-300">
            {alerts.map((p) => (
              <li
                key={p.sku}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs opacity-50">{p.sku}</p>
                </div>
                <span className="badge badge-warning badge-sm">
                  {p.quantity} restant{p.quantity > 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
