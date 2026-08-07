import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/metrics";
import { DashboardView } from "@/components/dashboard-view";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = (user?.fullName ?? "Coach").trim().split(/\s+/)[0];
  const stats = await getDashboardStats(user!.id);

  return <DashboardView firstName={firstName} stats={stats} />;
}
