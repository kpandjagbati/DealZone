import { auth } from "@/auth";
import { MovementForm } from "@/components/dashboard/MovementForm";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TYPE_LABELS = {
  IN: "Entrée",
  OUT: "Sortie",
  ADJUST: "Ajustement",
} as const;

export default async function MovementsPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "GESTIONNAIRE" &&
      session.user.role !== "MAGASINIER")
  ) {
    redirect("/dashboard");
  }

  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        unit: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.stockMovement.findMany({
      take: 40,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, sku: true, unit: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Mouvements"
        subtitle="Entrées, sorties et historique des opérations."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <MovementForm products={products} mode="inout" />

        <Panel title="Historique récent">
          {movements.length === 0 ? (
            <p className="text-sm opacity-60">Aucun mouvement pour le moment.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {movements.map((m) => (
                <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {m.product.name}{" "}
                        <span className="text-xs font-normal opacity-50">
                          ({m.product.sku})
                        </span>
                      </p>
                      <p className="text-xs opacity-50">
                        {TYPE_LABELS[m.type]} · {m.reason}
                        {m.reference ? ` · Réf. ${m.reference}` : ""}
                      </p>
                      <p className="text-xs opacity-40">
                        {m.user.name} ·{" "}
                        {m.createdAt.toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p
                        className={
                          m.type === "IN"
                            ? "font-semibold text-success"
                            : m.type === "OUT"
                              ? "font-semibold text-error"
                              : "font-semibold text-warning"
                        }
                      >
                        {m.type === "OUT" ? "−" : m.type === "IN" ? "+" : "±"}
                        {m.quantity}
                      </p>
                      <p className="text-xs opacity-50">
                        {m.quantityBefore} → {m.quantityAfter}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
