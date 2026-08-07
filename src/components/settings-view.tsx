"use client";

import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export function SettingsView({ user }: { user: { fullName: string; email: string } }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.settings.title} description={t.settings.subtitle} />

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">{t.settings.account}</h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t.settings.name}</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t.settings.email}</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold">{t.settings.appearance}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.settings.appearanceDesc}</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold">{t.settings.language}</h2>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
