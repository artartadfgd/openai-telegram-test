"use client";

import Link from "next/link";
import { Clock, History as HistoryIcon, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { VolleyballCourt } from "@/components/volleyball-court";
import { useTranslation } from "@/lib/i18n/context";
import type { TrainingDoc } from "@/lib/ai";

type HistorySession = {
  id: string;
  title: string;
  objective: string;
  category: string;
  totalDurationMin: number;
  conversationId: string | null;
  createdAt: string;
  team: { name: string } | null;
  doc: TrainingDoc;
};

const LOCALE_MAP: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" };

export function HistoryView({ sessions }: { sessions: HistorySession[] }) {
  const { t, locale } = useTranslation();
  const dateFormatter = new Intl.DateTimeFormat(LOCALE_MAP[locale] ?? "pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.history.title} description={t.history.subtitle} />

      {sessions.length === 0 ? (
        <EmptyState icon={HistoryIcon} title={t.history.empty} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => {
            const firstBlock = s.doc.blocks?.[0];
            const inner = (
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
                <div className="border-b border-border">
                  <VolleyballCourt diagram={firstBlock ? firstBlock.diagram : { players: [], arrows: [], cones: [], balls: [] }} animated={false} />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold">{s.title}</h3>
                  {s.objective && <p className="line-clamp-2 text-xs text-muted-foreground">{s.objective}</p>}
                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {s.category && <span>{s.category}</span>}
                    {s.totalDurationMin && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {s.totalDurationMin} min
                      </span>
                    )}
                    {s.team && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {s.team.name}
                      </span>
                    )}
                    <span>{dateFormatter.format(new Date(s.createdAt))}</span>
                  </div>
                </div>
              </article>
            );
            return (
              <li key={s.id}>
                {s.conversationId ? (
                  <Link href={`/ai-coach?c=${s.conversationId}`} className="block h-full">
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full opacity-80">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
