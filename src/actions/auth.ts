"use server";

import { saveUploadedImage } from "@/lib/upload";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dashboardHomeForRole } from "@/lib/roles";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type AuthActionState = {
  error?: string;
  success?: string;
  createdEmail?: string;
  createdPassword?: string;
  createdRole?: string;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Email ou mot de passe incorrect" };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: dashboardHomeForRole(user.role),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect" };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const createUserSchema = z
  .object({
    name: z.string().min(2, "Nom trop court"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe : 6 caractères minimum"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
    role: z.enum(["GESTIONNAIRE", "MAGASINIER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function createStaffUserAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Seul l'administrateur peut créer des utilisateurs" };
  }

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cet email est déjà utilisé" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const roleLabel =
    parsed.data.role === "GESTIONNAIRE" ? "Gestionnaire" : "Magasinier";

  let avatarUrl: string | null = null;
  try {
    avatarUrl = await saveUploadedImage(
      formData.get("avatar") as File | null,
      "avatars",
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur upload photo" };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      avatarUrl,
      role: parsed.data.role,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin");
  return {
    success: `Compte ${roleLabel} créé. Communiquez ces accès à l'utilisateur.`,
    createdEmail: email,
    createdPassword: parsed.data.password,
    createdRole: roleLabel,
  };
}

const resetPasswordSchema = z
  .object({
    userId: z.string().uuid("Utilisateur invalide"),
    password: z.string().min(6, "Mot de passe : 6 caractères minimum"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function resetUserPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Seul l'administrateur peut modifier les mots de passe" };
  }

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });

  if (!target) {
    return { error: "Utilisateur introuvable" };
  }

  if (target.role === "ADMIN" && target.id !== session.user.id) {
    return { error: "Impossible de modifier le mot de passe d'un autre admin" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: target.id },
    data: { passwordHash },
  });

  revalidatePath("/dashboard/admin/users");
  return {
    success: `Mot de passe mis à jour pour ${target.email}`,
    createdEmail: target.email,
    createdPassword: parsed.data.password,
    createdRole:
      target.role === "GESTIONNAIRE"
        ? "Gestionnaire"
        : target.role === "MAGASINIER"
          ? "Magasinier"
          : "Administrateur",
  };
}

export async function toggleUserActiveAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "ADMIN") return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !target.isActive },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function updateMyAvatarAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Non connecté" };
  }

  let avatarUrl: string | null = null;
  try {
    avatarUrl = await saveUploadedImage(
      formData.get("avatar") as File | null,
      "avatars",
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur upload photo" };
  }

  if (!avatarUrl) {
    return { error: "Veuillez sélectionner une image" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/admin");
  return { success: "Photo de profil mise à jour" };
}
