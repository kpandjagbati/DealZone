import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { canAccessPath, dashboardHomeForRole } from "@/lib/roles";
import type { UserRole } from "@/generated/prisma/enums";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !isLoggedIn) {
    const url = new URL("/", req.nextUrl.origin);
    url.searchParams.set("login", "1");
    return NextResponse.redirect(url);
  }

  if (isDashboard && req.auth?.user?.role) {
    const role = req.auth.user.role as UserRole;
    if (!canAccessPath(role, pathname)) {
      return NextResponse.redirect(
        new URL(dashboardHomeForRole(role), req.nextUrl.origin),
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
