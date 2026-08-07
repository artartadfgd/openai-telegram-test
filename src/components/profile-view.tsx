"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/context";
import { Loader2 } from "lucide-react";

export function ProfileView({ user }: { user: { fullName: string; email: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    setProfileErr(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email }),
    });
    setSavingProfile(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileErr(data.error === "email_taken" ? t.profile.emailTaken : t.errors.aiError);
      return;
    }
    setProfileMsg(t.profile.saved);
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg(null);
    setPasswordErr(null);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSavingPassword(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordErr(data.error === "wrong_password" ? t.profile.wrongPassword : t.errors.aiError);
      return;
    }
    setPasswordMsg(t.profile.passwordSaved);
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.profile.title} description={t.profile.subtitle} />

      <div className="space-y-4">
        <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <Label htmlFor="profile-name">{t.profile.fullName}</Label>
            <Input id="profile-name" className="mt-1.5" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="profile-email">{t.profile.email}</Label>
            <Input id="profile-email" type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {profileErr && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{profileErr}</div>}
          {profileMsg && <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">{profileMsg}</div>}
          <Button type="submit" className="gap-2" disabled={savingProfile}>
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.profile.save}
          </Button>
        </form>

        <form onSubmit={savePassword} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">{t.profile.changePassword}</h2>
          <div>
            <Label htmlFor="current-password">{t.profile.currentPassword}</Label>
            <Input id="current-password" type="password" className="mt-1.5" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-password">{t.profile.newPassword}</Label>
            <Input id="new-password" type="password" minLength={6} className="mt-1.5" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          {passwordErr && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{passwordErr}</div>}
          {passwordMsg && <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">{passwordMsg}</div>}
          <Button type="submit" className="gap-2" disabled={savingPassword || !currentPassword || newPassword.length < 6}>
            {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.profile.changePassword}
          </Button>
        </form>
      </div>
    </div>
  );
}
