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

const supplierSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(180),
  email: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().email("Email invalide").optional(),
  ),
  phone: z.string().max(40).optional(),
  address: z.string().max(500).optional(),
});

export async function createSupplierAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await requireCatalogAccess())) {
    return { error: "Accès refusé" };
  }

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await prisma.supplier.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email?.trim().toLowerCase() || null,
      phone: parsed.data.phone?.trim() || null,
      address: parsed.data.address?.trim() || null,
    },
  });

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
  return { success: "Fournisseur créé" };
}

export async function updateSupplierAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await requireCatalogAccess())) {
    return { error: "Accès refusé" };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Fournisseur introuvable" };

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await prisma.supplier.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email?.trim().toLowerCase() || null,
      phone: parsed.data.phone?.trim() || null,
      address: parsed.data.address?.trim() || null,
    },
  });

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
  return { success: "Fournisseur mis à jour" };
}

export async function deleteSupplierAction(formData: FormData) {
  if (!(await requireCatalogAccess())) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const productCount = await prisma.product.count({ where: { supplierId: id } });
  if (productCount > 0) {
    await prisma.product.updateMany({
      where: { supplierId: id },
      data: { supplierId: null },
    });
  }

  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
}
