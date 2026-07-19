import Image from "next/image";
import { auth } from "@/auth";
import { toggleUserActiveAction } from "@/actions/auth";
import { CreateUserForm } from "@/components/dashboard/CreateUserForm";
import { ResetPasswordForm } from "@/components/dashboard/ResetPasswordForm";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle="Créez des comptes et définissez leurs mots de passe d'accès."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <CreateUserForm />

        <Panel title="Comptes existants">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs opacity-50">
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="align-top">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="avatar">
                            <div className="relative w-9 rounded-full bg-base-200">
                              {user.avatarUrl ? (
                                <Image
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                  unoptimized
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-semibold opacity-50">
                                  {user.name.slice(0, 1).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-sm opacity-70">{user.email}</td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td>
                        {user.isActive ? (
                          <span className="badge badge-success badge-sm">
                            Actif
                          </span>
                        ) : (
                          <span className="badge badge-error badge-sm">
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="min-w-44">
                        {user.role !== "ADMIN" ? (
                          <div className="space-y-1">
                            <ResetPasswordForm
                              userId={user.id}
                              userName={user.name}
                              userEmail={user.email}
                            />
                            <form action={toggleUserActiveAction}>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                className="btn btn-ghost btn-xs rounded-lg"
                              >
                                {user.isActive ? "Désactiver" : "Activer"}
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs opacity-40">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
