"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type MovementActionState = {
  error?: string;
  success?: string;
};

async function requireStockAccess() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "GESTIONNAIRE" &&
      session.user.role !== "MAGASINIER")
  ) {
    return null;
  }
  return session;
}

const baseFields = {
  productId: z.string().uuid("Produit invalide"),
  reason: z.string().min(2, "Motif requis").max(120),
  reference: z.string().max(120).optional(),
  note: z.string().max(500).optional(),
};

const inOutSchema = z.object({
  ...baseFields,
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive("Quantité invalide"),
});

const adjustSchema = z.object({
  ...baseFields,
  type: z.literal("ADJUST"),
  targetQuantity: z.coerce.number().int().min(0, "Quantité invalide"),
});

function revalidateStockPaths() {
  revalidatePath("/dashboard/movements");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/gestionnaire");
  revalidatePath("/dashboard/magasinier");
  revalidatePath("/dashboard/reports");
}

export async function createMovementAction(
  _prev: MovementActionState,
  formData: FormData,
): Promise<MovementActionState> {
  const session = await requireStockAccess();
  if (!session?.user) {
    return { error: "Accès refusé" };
  }

  const type = String(formData.get("type") ?? "");
  const common = {
    productId: formData.get("productId"),
    reason: formData.get("reason"),
    reference: formData.get("reference") || undefined,
    note: formData.get("note") || undefined,
  };

  const parsed =
    type === "ADJUST"
      ? adjustSchema.safeParse({
          ...common,
          type: "ADJUST",
          targetQuantity: formData.get("targetQuantity"),
        })
      : inOutSchema.safeParse({
          ...common,
          type,
          quantity: formData.get("quantity"),
        });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });
      if (!product || !product.isActive) {
        throw new Error("Produit introuvable ou inactif");
      }

      const before = product.quantity;
      let after = before;
      let qty = 0;

      if (data.type === "IN") {
        qty = data.quantity;
        after = before + qty;
      } else if (data.type === "OUT") {
        qty = data.quantity;
        if (qty > before) {
          throw new Error(
            `Stock insuffisant (${before} disponible, ${qty} demandé)`,
          );
        }
        after = before - qty;
      } else if (data.type === "ADJUST") {
        after = data.targetQuantity;
        qty = Math.abs(after - before);
        if (qty === 0) {
          throw new Error("Aucun changement de stock");
        }
      }

      await tx.product.update({
        where: { id: data.productId },
        data: { quantity: after },
      });

      await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: qty,
          quantityBefore: before,
          quantityAfter: after,
          reason: data.reason.trim(),
          reference: data.reference?.trim() || null,
          note: data.note?.trim() || null,
          userId: session.user.id,
        },
      });
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erreur lors du mouvement",
    };
  }

  revalidateStockPaths();
  const labels = { IN: "Entrée", OUT: "Sortie", ADJUST: "Ajustement" } as const;
  return { success: `${labels[data.type]} enregistré(e)` };
}
