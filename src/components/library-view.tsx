"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Search, Users, WandSparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { VolleyballCourt } from "@/components/volleyball-court";
import { CuratedCard } from "@/components/curated-card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/context";
import { LIBRARY_TEMPLATES } from "@/lib/library-templates";
import type { TrainingDoc } from "@/lib/ai";

type LibrarySession = {
  id: string;
  title: string;
  objective: string;
  category: string;
  totalDurationMin: number;
  createdAt: string;
  team: { name: string } | null;
  doc: TrainingDoc;
};

export function LibraryView({ sessions }: { sessions: LibrarySession[] }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => Array.from(new Set(sessions.map((s) => s.category).filter(Boolean))), [sessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      const matchesQuery = !q || s.title.toLowerCase().includes(q) || s.objective.toLowerCase().includes(q);
      const matchesCategory = !category || s.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [sessions, query, category]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.library.title} description={t.library.subtitle} />

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.library.readyMade}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIBRARY_TEMPLATES.map((template) => (
            <li key={template.slug}>
              <CuratedCard template={template} badge={t.library.readyMadeBadge} />
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.library.myTrainings}</h2>

      {sessions.length === 0 ? (
        <EmptyState icon={BookOpen} title={t.library.empty} />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.library.searchPlaceholder} className="pl-9" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-56"
            >
              <option value="">{t.library.allCategories}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const firstBlock = s.doc.blocks?.[0];
              return (
                <li key={s.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
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
                    <Link
                      href={`/training-builder?category=${encodeURIComponent(s.category)}&objective=${encodeURIComponent(s.objective)}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <WandSparkles className="h-3.5 w-3.5" />
                      {t.library.useAsBase}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
