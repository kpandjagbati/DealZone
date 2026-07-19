import { auth } from "@/auth";
import { dashboardHomeForRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await auth();
  if (!session?.user?.role) {
    redirect("/?login=1");
  }
  redirect(dashboardHomeForRole(session.user.role));
}
