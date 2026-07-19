import { auth } from "@/auth";
import { CreateProductForm } from "@/components/dashboard/CreateProductForm";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard");
  }

  const canManage =
    session.user.role === "ADMIN" || session.user.role === "GESTIONNAIRE";
  const canView =
    canManage || session.user.role === "MAGASINIER";

  if (!canView) {
    redirect("/dashboard");
  }

  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    canManage
      ? prisma.category.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    canManage
      ? prisma.supplier.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader
        title="Produits"
        subtitle={
          canManage
            ? "Ajoutez des produits avec leur image et suivez le stock."
            : "Consultez le catalogue et les quantités en stock."
        }
      />

      <div className={canManage ? "grid gap-6 xl:grid-cols-2" : undefined}>
        {canManage ? (
          <CreateProductForm categories={categories} suppliers={suppliers} />
        ) : null}

        <Panel title={`Catalogue (${products.length})`}>
          {products.length === 0 ? (
            <p className="text-sm opacity-60">Aucun produit pour le moment.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {products.map((product) => {
                const low = product.quantity <= product.alertThreshold;
                return (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-base-200">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs opacity-40">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-xs opacity-50">
                        {product.sku} · {product.category.name}
                        {product.supplier ? ` · ${product.supplier.name}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${low ? "text-warning" : ""}`}
                      >
                        {product.quantity}
                      </p>
                      <p className="text-xs opacity-50">{product.unit}</p>
                      {low ? (
                        <span className="badge badge-warning badge-xs mt-1">
                          Alerte
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
