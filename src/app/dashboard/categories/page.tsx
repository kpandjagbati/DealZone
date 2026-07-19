import { auth } from "@/auth";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { PageHeader } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "GESTIONNAIRE")
  ) {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Catégories"
        subtitle="Organisation du catalogue par familles."
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
