import Link from "next/link";
import { auth } from "@/auth";
import { AdminCharts } from "@/components/dashboard/AdminCharts";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { getAdminDashboardStats } from "@/lib/reports-data";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const stats = await getAdminDashboardStats();
  const { kpis } = stats;
  const hasCatalog = kpis.products > 0;
  const hasMovements = kpis.movementsTotal > 0;

  return (
    <div>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Les statistiques se mettent à jour automatiquement selon les données que vous saisissez."
      />

      {!hasCatalog ? (
        <div className="mb-6 rounded-2xl border border-dashed border-base-300 bg-base-100 p-5">
          <p className="font-semibold">Plateforme prête — encore vide</p>
          <p className="mt-1 text-sm opacity-65">
            Ajoutez des catégories, fournisseurs et produits : les indicateurs
            et graphiques se rempliront tout seuls.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/categories" className="btn btn-primary btn-sm rounded-xl">
              Catégories
            </Link>
            <Link href="/dashboard/suppliers" className="btn btn-outline btn-sm rounded-xl">
              Fournisseurs
            </Link>
            <Link href="/dashboard/products" className="btn btn-outline btn-sm rounded-xl">
              Produits
            </Link>
            <Link href="/dashboard/admin/users" className="btn btn-outline btn-sm rounded-xl">
              Utilisateurs
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Valeur du stock"
          value={formatMoney(kpis.stockValue)}
          hint="Qty × prix d'achat"
        />
        <StatCard
          label="Produits actifs"
          value={kpis.products}
          href="/dashboard/products"
          hint={`${kpis.categories} catégorie${kpis.categories > 1 ? "s" : ""}`}
        />
        <StatCard
          label="Alertes / Ruptures"
          value={`${kpis.lowStock} / ${kpis.outOfStock}`}
          href="/dashboard/products"
          hint="Sous seuil / à zéro"
        />
        <StatCard
          label="Utilisateurs"
          value={kpis.users}
          href="/dashboard/admin/users"
          hint={`${kpis.suppliers} fournisseur${kpis.suppliers > 1 ? "s" : ""}`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mouvements total"
          value={kpis.movementsTotal}
          href="/dashboard/movements"
        />
        <StatCard
          label="Entrées (30 j)"
          value={kpis.in30}
          hint="Quantités entrées"
        />
        <StatCard
          label="Sorties (30 j)"
          value={kpis.out30}
          hint="Quantités sorties"
        />
        <StatCard
          label="Valeur vente stock"
          value={formatMoney(kpis.saleValue)}
          hint="Qty × prix de vente"
        />
      </div>

      <AdminCharts
        chart7days={stats.chart7days}
        byCategory={stats.byCategory}
        byRole={stats.byRole}
        hasMovements={hasMovements}
        hasCatalog={hasCatalog}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Stock à surveiller">
          {!hasCatalog ? (
            <p className="text-sm opacity-60">
              Aucun produit saisi pour le moment.
            </p>
          ) : stats.lowStockTop.length === 0 ? (
            <p className="text-sm opacity-60">Aucune alerte pour le moment.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {stats.lowStockTop.map((p) => (
                <li
                  key={p.sku}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs opacity-50">{p.sku}</p>
                  </div>
                  <span className="badge badge-warning badge-sm">
                    {p.quantity}/{p.alertThreshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Exports rapides">
          <p className="mb-4 text-sm opacity-70">
            Les rapports PDF / Excel reflètent uniquement les données saisies.
          </p>
          <Link href="/dashboard/reports" className="btn btn-primary rounded-xl">
            Ouvrir les rapports
          </Link>
        </Panel>
      </div>
    </div>
  );
}
