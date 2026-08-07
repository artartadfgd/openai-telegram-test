import Link from "next/link";
import { Bell, Clock, Plus, Sparkles, Target, Trophy, Users, Zap, Swords, Flag, Gauge, ShieldCheck, Dumbbell, Timer } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { QuickCreateForm } from "@/components/quick-create-form";

const POPULAR = [
  { key: "speed", label: "Velocidade", icon: Zap },
  { key: "possession", label: "Posse de bola", icon: Swords },
  { key: "finishing", label: "Finalização", icon: Flag },
  { key: "transition", label: "Transição", icon: Gauge },
  { key: "defense", label: "Defesa", icon: ShieldCheck },
  { key: "strength", label: "Força", icon: Dumbbell },
  { key: "agility", label: "Agilidade", icon: Timer },
  { key: "smallSided", label: "Jogos reduzidos", icon: Users },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = (user?.fullName ?? "Treinador").trim().split(/\s+/)[0];
  const stats = await getDashboardStats(user!.id);

  const metrics = [
    {
      key: "trainingsCreated",
      label: "Treinos criados",
      icon: <Trophy className="h-5 w-5 text-[hsl(217_91%_45%)]" />,
      value: stats.month.trainingsCreated,
      delta: stats.deltas.trainingsCreated,
      tint: "from-[hsl(217_91%_60%/0.14)] to-transparent",
      iconBg: "bg-[hsl(217_91%_60%/0.16)]",
    },
    {
      key: "objectivesCount",
      label: "Objetivos",
      icon: <Target className="h-5 w-5 text-[hsl(262_83%_50%)]" />,
      value: stats.month.objectivesCount,
      delta: stats.deltas.objectivesCount,
      tint: "from-[hsl(262_83%_66%/0.14)] to-transparent",
      iconBg: "bg-[hsl(262_83%_66%/0.16)]",
    },
    {
      key: "playersFollowed",
      label: "Jogadores acompanhados",
      icon: <Users className="h-5 w-5 text-[hsl(142_71%_35%)]" />,
      value: stats.month.playersFollowed,
      delta: stats.deltas.playersFollowed,
      tint: "from-[hsl(142_71%_45%/0.14)] to-transparent",
      iconBg: "bg-[hsl(142_71%_45%/0.16)]",
    },
    {
      key: "hoursSaved",
      label: "Horas economizadas",
      icon: <Clock className="h-5 w-5 text-[hsl(32_95%_40%)]" />,
      value: stats.month.hoursSaved,
      delta: stats.deltas.hoursSaved,
      tint: "from-[hsl(32_95%_55%/0.14)] to-transparent",
      iconBg: "bg-[hsl(32_95%_55%/0.16)]",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between animate-fade-in" style={{ animationFillMode: "both" }}>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Olá, {firstName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">Vamos planejar o próximo treino do seu time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notificações"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>
          <Button className="gap-2" asChild>
            <Link href="/training-builder">
              <Plus className="h-4 w-4" />
              Novo treino
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m, i) => (
          <MetricCard
            key={m.key}
            index={i}
            icon={m.icon}
            label={m.label}
            value={m.value}
            delta={m.delta}
            sublabel="este mês"
            tint={m.tint}
            iconBg={m.iconBg}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-5 animate-fade-in" style={{ animationDelay: "240ms", animationFillMode: "both" }}>
        <QuickCreateForm />
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">Assistente de IA</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Converse com o CoachAI para tirar dúvidas táticas, pedir ajustes num treino existente ou gerar um plano do zero, com diagramas de campo prontos.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/ai-coach">
              <Sparkles className="h-4 w-4" />
              Abrir assistente
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 animate-fade-in" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Populares</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {POPULAR.map((item) => (
            <Link
              key={item.key}
              href={`/training-builder?objective=${encodeURIComponent(item.label)}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Treinos recentes</h2>
        </div>
        {stats.recent.length > 0 ? (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {stats.recent.map((t) => {
              const inner = (
                <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {t.category && <span>{t.category}</span>}
                      {t.teamName && <span>· {t.teamName}</span>}
                      {t.durationMin && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t.durationMin} min
                        </span>
                      )}
                      <span>{dateFormatter.format(new Date(t.createdAt))}</span>
                    </div>
                  </div>
                </div>
              );
              return (
                <li key={t.id}>
                  {t.conversationId ? (
                    <Link href={`/ai-coach?c=${t.conversationId}`} className="block">
                      {inner}
                    </Link>
                  ) : (
                    <div className="block opacity-70">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">Você ainda não criou nenhum treino.</p>
            <Button asChild className="gap-2">
              <Link href="/training-builder">
                <Plus className="h-4 w-4" />
                Criar meu primeiro treino
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
