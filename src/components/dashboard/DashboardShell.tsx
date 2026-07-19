"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/generated/prisma/enums";
import { logoutAction } from "@/actions/auth";
import { ROLE_LABELS } from "@/lib/roles";
import {
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineCollection,
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineShoppingCart,
  HiOutlineTruck,
  HiOutlineUsers,
} from "react-icons/hi";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
};

const NAV: NavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Vue d'ensemble",
    icon: <HiOutlineHome className="size-5" />,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/gestionnaire",
    label: "Vue d'ensemble",
    icon: <HiOutlineHome className="size-5" />,
    roles: ["GESTIONNAIRE"],
  },
  {
    href: "/dashboard/magasinier",
    label: "Vue d'ensemble",
    icon: <HiOutlineHome className="size-5" />,
    roles: ["MAGASINIER"],
  },
  {
    href: "/dashboard/products",
    label: "Produits",
    icon: <HiOutlineShoppingCart className="size-5" />,
    roles: ["ADMIN", "GESTIONNAIRE", "MAGASINIER"],
  },
  {
    href: "/dashboard/categories",
    label: "Catégories",
    icon: <HiOutlineCollection className="size-5" />,
    roles: ["ADMIN", "GESTIONNAIRE"],
  },
  {
    href: "/dashboard/suppliers",
    label: "Fournisseurs",
    icon: <HiOutlineTruck className="size-5" />,
    roles: ["ADMIN", "GESTIONNAIRE"],
  },
  {
    href: "/dashboard/movements",
    label: "Mouvements",
    icon: <HiOutlineClipboardList className="size-5" />,
    roles: ["ADMIN", "GESTIONNAIRE", "MAGASINIER"],
  },
  {
    href: "/dashboard/reports",
    label: "Rapports",
    icon: <HiOutlineChartBar className="size-5" />,
    roles: ["ADMIN", "GESTIONNAIRE", "MAGASINIER"],
  },
  {
    href: "/dashboard/admin/users",
    label: "Utilisateurs",
    icon: <HiOutlineUsers className="size-5" />,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/settings",
    label: "Paramètres",
    icon: <HiOutlineCog className="size-5" />,
    roles: ["ADMIN"],
  },
];

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
    role: UserRole;
    avatarUrl?: string | null;
  };
  children: React.ReactNode;
};

function UserAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "w-14 h-14" : size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const initial = (name ?? "U").slice(0, 1).toUpperCase();

  return (
    <div
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-full bg-base-200 ring-2 ring-primary/30`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? "Profil"}
          fill
          className="object-cover"
          sizes="56px"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
          {initial}
        </span>
      )}
    </div>
  );
}

function SidebarProfile({
  user,
}: {
  user: Props["user"];
}) {
  return (
    <div className="border-t border-base-300 p-4">
      <div className="flex items-center gap-3">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs opacity-50">{user.email}</p>
          <p className="mt-0.5 text-[11px] font-medium text-primary">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: Props) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="dz-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex min-h-screen flex-col">
        <header className="navbar sticky top-0 z-20 border-b border-base-300/80 bg-base-100/95 px-4 backdrop-blur sm:px-6">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="dz-drawer"
              className="btn btn-square btn-ghost btn-sm"
              aria-label="Ouvrir le menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>

          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-sm font-semibold sm:text-base">
              {ROLE_LABELS[user.role]}
            </p>
            <p className="truncate text-xs opacity-50">DealZone Stock</p>
          </div>

          <div className="flex flex-none items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs opacity-50">{user.email}</p>
            </div>
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <form action={logoutAction}>
              <button
                type="submit"
                className="btn btn-ghost btn-sm gap-1.5 rounded-full"
              >
                <HiOutlineLogout className="size-4" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="dz-drawer"
          className="drawer-overlay"
          aria-label="Fermer le menu"
        />
        <aside className="flex min-h-full w-64 flex-col border-r border-base-300 bg-base-100">
          {/* Logo agrandi, largeur sidebar inchangée (w-64) */}
          <div className="flex justify-center border-b border-base-300 px-3 py-4">
            <Image
              src="/logo-dealzone.png"
              alt="DealZone"
              width={220}
              height={140}
              priority
              className="h-20 w-full max-w-[220px] object-contain object-center sm:h-24"
            />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-content shadow-sm"
                      : "opacity-75 hover:bg-base-200 hover:opacity-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Photo de profil en bas de la barre latérale */}
          <SidebarProfile user={user} />
        </aside>
      </div>
    </div>
  );
}
