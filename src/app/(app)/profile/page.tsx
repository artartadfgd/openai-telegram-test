import { getCurrentUser } from "@/lib/auth";
import { ProfileView } from "@/components/profile-view";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return <ProfileView user={{ fullName: user?.fullName ?? "", email: user?.email ?? "" }} />;
}
