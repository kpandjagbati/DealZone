"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type SettingsActionState = {
  error?: string;
  success?: string;
};

const settingsSchema = z.object({
  companyName: z.string().min(2, "Nom trop court").max(180),
  address: z.string().max(500).optional(),
  currency: z.string().min(2).max(10),
  defaultAlertThreshold: z.coerce.number().int().min(0),
});

export async function updateCompanySettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Accès réservé à l'administrateur" };
  }

  const parsed = settingsSchema.safeParse({
    companyName: formData.get("companyName"),
    address: formData.get("address") || undefined,
    currency: formData.get("currency"),
    defaultAlertThreshold: formData.get("defaultAlertThreshold"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.companySettings.findFirst();
  const data = {
    companyName: parsed.data.companyName.trim(),
    address: parsed.data.address?.trim() || null,
    currency: parsed.data.currency.trim().toUpperCase(),
    defaultAlertThreshold: parsed.data.defaultAlertThreshold,
  };

  if (existing) {
    await prisma.companySettings.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.companySettings.create({ data });
  }

  revalidatePath("/dashboard/settings");
  return { success: "Paramètres entreprise enregistrés" };
}
