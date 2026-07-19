import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/?login=1");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true, name: true, email: true },
  });

  return (
    <DashboardShell
      user={{
        ...session.user,
        name: dbUser?.name ?? session.user.name,
        email: dbUser?.email ?? session.user.email,
        avatarUrl: dbUser?.avatarUrl ?? null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
