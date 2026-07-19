import { auth } from "@/auth";
import { CompanySettingsForm } from "@/components/dashboard/CompanySettingsForm";
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

  const [me, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, avatarUrl: true },
    }),
    prisma.companySettings.findFirst(),
  ]);

  if (!me) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Entreprise et photo de profil administrateur."
      />

      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Panel title="Entreprise">
          <CompanySettingsForm
            companyName={settings?.companyName ?? "DealZone"}
            address={settings?.address ?? null}
            currency={settings?.currency ?? "XOF"}
            defaultAlertThreshold={settings?.defaultAlertThreshold ?? 5}
          />
        </Panel>

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
