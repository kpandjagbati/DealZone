import { auth } from "@/auth";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function GestionnaireDashboardPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GESTIONNAIRE" && session.user.role !== "ADMIN")
  ) {
    redirect("/dashboard");
  }

  const [products, categories, suppliers, lowStockRows] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.supplier.count(),
    prisma.product.findMany({
      where: { isActive: true },
      select: { quantity: true, alertThreshold: true },
    }),
  ]);

  const lowStock = lowStockRows.filter((p) => p.quantity <= p.alertThreshold).length;

  return (
    <div>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Catalogue, fournisseurs et niveaux de stock."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Produits" value={products} href="/dashboard/products" />
        <StatCard
          label="Catégories"
          value={categories}
          href="/dashboard/categories"
        />
        <StatCard
          label="Fournisseurs"
          value={suppliers}
          href="/dashboard/suppliers"
        />
        <StatCard
          label="Alertes stock"
          value={lowStock}
          href="/dashboard/products"
        />
      </div>
    </div>
  );
}
