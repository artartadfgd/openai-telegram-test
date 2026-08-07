"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Heart, Star, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { VolleyballCourt } from "@/components/volleyball-court";
import { useTranslation } from "@/lib/i18n/context";
import type { TrainingDoc } from "@/lib/ai";

type FavoriteSession = {
  id: string;
  title: string;
  objective: string;
  category: string;
  totalDurationMin: number;
  conversationId: string | null;
  team: { name: string } | null;
  doc: TrainingDoc;
};

export function FavoritesView({ sessions: initial }: { sessions: FavoriteSession[] }) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState(initial);

  async function unfavorite(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/training/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorited: false }),
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.favorites.title} description={t.favorites.subtitle} />

      {sessions.length === 0 ? (
        <EmptyState icon={Star} title={t.favorites.empty} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => {
            const firstBlock = s.doc.blocks?.[0];
            return (
              <li key={s.id} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
                <button
                  type="button"
                  onClick={() => unfavorite(s.id)}
                  aria-label={t.trainingDoc.favorited}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 text-primary backdrop-blur"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </button>
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
                  </div>
                </div>
                {s.conversationId && <Link href={`/ai-coach?c=${s.conversationId}`} className="absolute inset-0" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
