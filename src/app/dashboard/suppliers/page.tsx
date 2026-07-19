import { auth } from "@/auth";
import { SupplierManager } from "@/components/dashboard/SupplierManager";
import { PageHeader } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "GESTIONNAIRE")
  ) {
    redirect("/dashboard");
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        subtitle="Référentiel des partenaires d'approvisionnement."
      />
      <SupplierManager suppliers={suppliers} />
    </div>
  );
}
