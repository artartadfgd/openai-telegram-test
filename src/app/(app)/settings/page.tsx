import { getCurrentUser } from "@/lib/auth";
import { SettingsView } from "@/components/settings-view";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return <SettingsView user={{ fullName: user?.fullName ?? "", email: user?.email ?? "" }} />;
}
