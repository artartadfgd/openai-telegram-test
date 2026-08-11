"use client";

import Link from "next/link";
import { Bell, Clock, Mail, Plus, Sparkles, Target, Trophy, Users, Zap, Swords, ShieldCheck, Hand, Radar, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { QuickCreateForm } from "@/components/quick-create-form";
import { TourBanner } from "@/components/tour-banner";
import { useTranslation } from "@/lib/i18n/context";
import type { getDashboardStats } from "@/lib/metrics";

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

const LOCALE_MAP: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" };

export function DashboardView({ firstName, stats }: { firstName: string; stats: Stats }) {
  const { t, locale } = useTranslation();
  const dateFormatter = new Intl.DateTimeFormat(LOCALE_MAP[locale] ?? "pt-BR", { day: "2-digit", month: "short" });

  const POPULAR = [
    { key: "serve", label: t.dashboard.popularServe, icon: Zap },
    { key: "attack", label: t.dashboard.popularAttack, icon: Swords },
    { key: "block", label: t.dashboard.popularBlock, icon: ShieldCheck },
    { key: "set", label: t.dashboard.popularSet, icon: Target },
    { key: "dig", label: t.dashboard.popularDig, icon: Hand },
    { key: "reception", label: t.dashboard.popularReception, icon: Radar },
    { key: "rotation", label: t.dashboard.popularRotation, icon: RotateCw },
    { key: "smallSided", label: t.dashboard.popularSmallSided, icon: Users },
  ];

  const metrics = [
    {
      key: "trainingsCreated",
      label: t.dashboard.metricTrainings,
      icon: <Trophy className="h-5 w-5 text-[hsl(217_91%_45%)]" />,
      value: stats.month.trainingsCreated,
      delta: stats.deltas.trainingsCreated,
      tint: "from-[hsl(217_91%_60%/0.14)] to-transparent",
      iconBg: "bg-[hsl(217_91%_60%/0.16)]",
    },
    {
      key: "objectivesCount",
      label: t.dashboard.metricObjectives,
      icon: <Target className="h-5 w-5 text-[hsl(262_83%_50%)]" />,
      value: stats.month.objectivesCount,
      delta: stats.deltas.objectivesCount,
      tint: "from-[hsl(262_83%_66%/0.14)] to-transparent",
      iconBg: "bg-[hsl(262_83%_66%/0.16)]",
    },
    {
      key: "playersFollowed",
      label: t.dashboard.metricPlayers,
      icon: <Users className="h-5 w-5 text-[hsl(142_71%_35%)]" />,
      value: stats.month.playersFollowed,
      delta: stats.deltas.playersFollowed,
      tint: "from-[hsl(142_71%_45%/0.14)] to-transparent",
      iconBg: "bg-[hsl(142_71%_45%/0.16)]",
    },
    {
      key: "hoursSaved",
      label: t.dashboard.metricHours,
      icon: <Clock className="h-5 w-5 text-[hsl(32_95%_40%)]" />,
      value: stats.month.hoursSaved,
      delta: stats.deltas.hoursSaved,
      tint: "from-[hsl(32_95%_55%/0.14)] to-transparent",
      iconBg: "bg-[hsl(32_95%_55%/0.16)]",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <TourBanner />
      <header className="flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between animate-fade-in" style={{ animationFillMode: "both" }}>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t.dashboard.greeting}, {firstName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{t.dashboard.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t.dashboard.notifications}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>
          <Button className="gap-2" asChild>
            <Link href="/training-builder">
              <Plus className="h-4 w-4" />
              {t.dashboard.newTraining}
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
            sublabel={t.dashboard.thisMonth}
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
            <h2 className="text-base font-semibold tracking-tight">{t.dashboard.aiTitle}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t.dashboard.aiDescription}</p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/ai-coach">
              <Sparkles className="h-4 w-4" />
              {t.dashboard.aiCta}
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 animate-fade-in" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.popularTitle}</h2>
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.dashboard.recentTitle}</h2>
        </div>
        {stats.recent.length > 0 ? (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {stats.recent.map((item) => {
              const inner = (
                <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {item.category && <span>{item.category}</span>}
                      {item.teamName && <span>· {item.teamName}</span>}
                      {item.durationMin && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.durationMin} min
                        </span>
                      )}
                      <span>{dateFormatter.format(new Date(item.createdAt))}</span>
                    </div>
                  </div>
                </div>
              );
              return (
                <li key={item.id}>
                  {item.conversationId ? (
                    <Link href={`/ai-coach?c=${item.conversationId}`} className="block">
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
            <p className="text-sm text-muted-foreground">{t.dashboard.recentEmpty}</p>
            <Button asChild className="gap-2">
              <Link href="/training-builder">
                <Plus className="h-4 w-4" />
                {t.dashboard.recentEmptyCta}
              </Link>
            </Button>
          </div>
        )}
      </section>

      <section className="mt-8 animate-fade-in" style={{ animationDelay: "480ms", animationFillMode: "both" }}>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">{t.dashboard.supportTitle}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{t.dashboard.supportDesc}</p>
          </div>
          <Button variant="outline" asChild className="gap-2">
            <a href="mailto:suportesafeoffer@hotmail.com">
              <Mail className="h-4 w-4" />
              {t.dashboard.supportCta}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
