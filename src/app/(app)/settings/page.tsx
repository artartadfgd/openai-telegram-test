import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" description="Preferências da sua conta." />

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Conta</h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nome</dt>
              <dd>{user?.fullName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">E-mail</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold">Aparência</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Alterne entre tema claro e escuro.</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
