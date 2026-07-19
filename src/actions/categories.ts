"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type CatalogActionState = {
  error?: string;
  success?: string;
};

async function requireCatalogAccess() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "GESTIONNAIRE")
  ) {
    return null;
  }
  return session;
}

const categorySchema = z.object({
  name: z.string().min(2, "Nom trop court").max(120),
  description: z.string().max(500).optional(),
});

export async function createCategoryAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await requireCatalogAccess())) {
    return { error: "Accès refusé" };
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const name = parsed.data.name.trim();
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return { error: "Cette catégorie existe déjà" };
  }

  await prisma.category.create({
    data: {
      name,
      description: parsed.data.description?.trim() || null,
    },
  });

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: "Catégorie créée" };
}

export async function updateCategoryAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await requireCatalogAccess())) {
    return { error: "Accès refusé" };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Catégorie introuvable" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const name = parsed.data.name.trim();
  const clash = await prisma.category.findFirst({
    where: { name, NOT: { id } },
  });
  if (clash) {
    return { error: "Ce nom est déjà utilisé" };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name,
      description: parsed.data.description?.trim() || null,
    },
  });

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: "Catégorie mise à jour" };
}

export async function deleteCategoryAction(formData: FormData) {
  if (!(await requireCatalogAccess())) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return;
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}
