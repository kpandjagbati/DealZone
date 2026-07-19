import { UserRole } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  GESTIONNAIRE: "Gestionnaire",
  MAGASINIER: "Magasinier",
};

export function dashboardHomeForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "GESTIONNAIRE":
      return "/dashboard/gestionnaire";
    case "MAGASINIER":
      return "/dashboard/magasinier";
  }
}

/** Routes autorisées par rôle (préfixe) */
export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/dashboard/admin")) {
    return role === "ADMIN";
  }
  if (pathname.startsWith("/dashboard/gestionnaire")) {
    return role === "GESTIONNAIRE" || role === "ADMIN";
  }
  if (pathname.startsWith("/dashboard/magasinier")) {
    return role === "MAGASINIER" || role === "ADMIN";
  }
  if (pathname.startsWith("/dashboard/users")) {
    return role === "ADMIN";
  }
  if (pathname.startsWith("/dashboard/settings")) {
    return role === "ADMIN";
  }
  if (
    pathname.startsWith("/dashboard/categories") ||
    pathname.startsWith("/dashboard/suppliers")
  ) {
    return role === "ADMIN" || role === "GESTIONNAIRE";
  }
  if (
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/reports")
  ) {
    return (
      role === "ADMIN" || role === "GESTIONNAIRE" || role === "MAGASINIER"
    );
  }
  // mouvements, inventaire, dashboard racine : tous les rôles auth
  if (pathname.startsWith("/dashboard")) {
    return true;
  }
  return false;
}
