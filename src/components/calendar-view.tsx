"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/lib/i18n/context";

type ScheduledItem = {
  id: string;
  date: string;
  title: string;
  category: string;
  durationMin: number;
  conversationId: string | null;
  teamName: string | null;
};

const LOCALE_MAP: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function CalendarView() {
  const { t, locale } = useTranslation();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [items, setItems] = useState<ScheduledItem[] | null>(null);

  const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;

  async function load() {
    const res = await fetch(`/api/calendar?month=${monthKey}`);
    setItems(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  async function remove(id: string) {
    setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
  }

  const monthFormatter = new Intl.DateTimeFormat(LOCALE_MAP[locale] ?? "pt-BR", { month: "long", year: "numeric" });
  const weekdayFormatter = new Intl.DateTimeFormat(LOCALE_MAP[locale] ?? "pt-BR", { weekday: "short" });

  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    (items ?? []).forEach((it) => {
      const key = new Date(it.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return map;
  }, [items]);

  const today = new Date().toDateString();
  const weekdayLabels = Array.from({ length: 7 }).map((_, i) => weekdayFormatter.format(new Date(2024, 0, i + 7)));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t.calendar.title}
        description={t.calendar.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-32 text-center text-sm font-medium capitalize">{monthFormatter.format(cursor)}</span>
            <button
              type="button"
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {weekdayLabels.map((w, i) => (
          <div key={i} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          if (!day) return <div key={i} className="min-h-24 rounded-lg" />;
          const dayItems = itemsByDay.get(day.toDateString()) ?? [];
          const isToday = day.toDateString() === today;
          return (
            <div key={i} className={`min-h-24 rounded-lg border p-1.5 ${isToday ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}>
              <div className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.getDate()}</div>
              <div className="mt-1 space-y-1">
                {dayItems.slice(0, 3).map((it) => {
                  const content = (
                    <div className="group flex items-center gap-1 truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      <span className="flex-1 truncate">{it.title}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          remove(it.id);
                        }}
                        aria-label={t.calendar.remove}
                        className="shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                  return it.conversationId ? (
                    <Link key={it.id} href={`/ai-coach?c=${it.conversationId}`} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={it.id}>{content}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
