"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProductActionState = {
  error?: string;
  success?: string;
};

const productSchema = z.object({
  sku: z.string().min(2, "SKU trop court").max(80),
  name: z.string().min(2, "Nom trop court").max(180),
  description: z.string().optional(),
  unit: z.string().min(1).max(40),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  alertThreshold: z.coerce.number().int().min(0),
  categoryId: z.string().uuid("Catégorie invalide"),
  supplierId: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().uuid().optional(),
  ),
});

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

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await requireCatalogAccess();
  if (!session) {
    return { error: "Accès refusé" };
  }

  const parsed = productSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    unit: formData.get("unit") || "pièce",
    purchasePrice: formData.get("purchasePrice"),
    salePrice: formData.get("salePrice"),
    quantity: formData.get("quantity"),
    alertThreshold: formData.get("alertThreshold"),
    categoryId: formData.get("categoryId"),
    supplierId: formData.get("supplierId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.product.findUnique({
    where: { sku: parsed.data.sku },
  });
  if (existing) {
    return { error: "Ce SKU existe déjà" };
  }

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveUploadedImage(
      formData.get("image") as File | null,
      "products",
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur upload image" };
  }

  await prisma.product.create({
    data: {
      sku: parsed.data.sku.trim(),
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      unit: parsed.data.unit.trim(),
      purchasePrice: parsed.data.purchasePrice,
      salePrice: parsed.data.salePrice,
      quantity: parsed.data.quantity,
      alertThreshold: parsed.data.alertThreshold,
      categoryId: parsed.data.categoryId,
      supplierId: parsed.data.supplierId ?? null,
      imageUrl,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/gestionnaire");
  revalidatePath("/dashboard/reports");
  return { success: "Produit créé avec succès" };
}
