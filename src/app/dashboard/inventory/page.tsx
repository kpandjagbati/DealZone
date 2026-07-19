import { auth } from "@/auth";
import { MovementForm } from "@/components/dashboard/MovementForm";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "GESTIONNAIRE" &&
      session.user.role !== "MAGASINIER")
  ) {
    redirect("/dashboard");
  }

  const [products, recentAdjustments] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        unit: true,
        alertThreshold: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { type: "ADJUST" },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Inventaire"
        subtitle="Ajustez les quantités selon le stock physique constaté."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <MovementForm products={products} mode="adjust" />

        <div className="space-y-6">
          <Panel title="État du stock">
            {products.length === 0 ? (
              <p className="text-sm opacity-60">Aucun produit actif.</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {products.map((p) => {
                  const low = p.quantity <= p.alertThreshold;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs opacity-50">{p.sku}</p>
                      </div>
                      <span
                        className={`badge badge-sm ${low ? "badge-warning" : "badge-ghost"}`}
                      >
                        {p.quantity} {p.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Derniers ajustements">
            {recentAdjustments.length === 0 ? (
              <p className="text-sm opacity-60">Aucun ajustement encore.</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {recentAdjustments.map((m) => (
                  <li key={m.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-medium">{m.product.name}</p>
                    <p className="text-xs opacity-50">
                      {m.quantityBefore} → {m.quantityAfter} · {m.user.name} ·{" "}
                      {m.createdAt.toLocaleString("fr-FR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
