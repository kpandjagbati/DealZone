import { auth } from "@/auth";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileAvatarForm } from "@/components/dashboard/ProfileAvatarForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, avatarUrl: true },
  });

  if (!me) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Photo de profil et informations du compte administrateur."
      />

      <div className="max-w-lg">
        <Panel title="Ma photo de profil">
          <p className="mb-4 text-sm opacity-60">
            Cette photo s&apos;affiche en bas de la barre latérale et dans la
            barre du haut.
          </p>
          <ProfileAvatarForm
            name={me.name}
            email={me.email}
            avatarUrl={me.avatarUrl}
          />
        </Panel>
      </div>
    </div>
  );
}
