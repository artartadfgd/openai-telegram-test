"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Heart, Printer } from "lucide-react";
import { VolleyballCourt } from "@/components/volleyball-court";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import type { TrainingDoc as TrainingDocType } from "@/lib/ai";

type DocWithMeta = TrainingDocType & { _sessionId?: string; _favorited?: boolean };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <ul className="mt-1.5 space-y-1 text-sm text-foreground/80">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrainingDocView({ doc }: { doc: DocWithMeta }) {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(!!doc._favorited);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const blocks = useMemo(() => doc.blocks.slice().sort((a, b) => a.order - b.order), [doc.blocks]);
  const ranges = useMemo(() => {
    let acc = 0;
    return blocks.map((b) => {
      const from = acc;
      acc += b.durationMin;
      return { from, to: acc };
    });
  }, [blocks]);

  async function toggleFavorite() {
    if (!doc._sessionId) return;
    const next = !favorited;
    setFavorited(next);
    await fetch(`/api/training/${doc._sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorited: next }),
    });
  }

  async function confirmSchedule() {
    if (!doc._sessionId || !scheduleDate) return;
    setScheduling(true);
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainingSessionId: doc._sessionId, date: scheduleDate }),
    });
    setScheduling(false);
    setScheduleOpen(false);
    setScheduled(true);
  }

  return (
    <article className="animate-fade-in rounded-2xl border border-border bg-card shadow-sm print:border-0 print:shadow-none">
      <header className="border-b border-border p-6">
        <h2 className="text-2xl font-semibold tracking-tight">{doc.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{doc.objective}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label={t.trainingDoc.category} value={doc.category} />
          <Stat label={t.trainingDoc.duration} value={`${doc.totalDurationMin} min`} />
          <Stat label={t.trainingDoc.players} value={String(doc.playersCount)} />
          <Stat label={t.trainingDoc.court} value={doc.courtSetup} />
          <Stat label={t.trainingDoc.intensity} value={"●".repeat(doc.intensity) + "○".repeat(3 - doc.intensity)} />
        </div>

        {doc.materials.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.materials}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {doc.materials.map((m, i) => (
                <Badge key={i} variant="secondary" className="font-normal">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto pb-1 print:hidden">
          {blocks.map((b, i) => (
            <a
              key={b.order}
              href={`#block-${b.order}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`block-${b.order}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group flex w-32 shrink-0 flex-col gap-1 rounded-lg border border-border bg-background p-1.5 transition-colors hover:border-primary/50"
            >
              <div className="overflow-hidden rounded-md">
                <VolleyballCourt diagram={b.diagram} animated={false} />
              </div>
              <div className="px-1 pb-0.5">
                <div className="truncate text-[11px] font-medium">
                  {b.order}. {b.title}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {ranges[i].from}–{ranges[i].to}&apos;
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            {t.trainingDoc.print}
          </Button>
          <Button size="sm" variant={favorited ? "default" : "outline"} className="gap-1.5" onClick={toggleFavorite} aria-pressed={favorited}>
            <Heart className={cn("h-3.5 w-3.5", favorited && "fill-current")} />
            {favorited ? t.trainingDoc.favorited : t.trainingDoc.favorite}
          </Button>
          {doc._sessionId && (
            <Button size="sm" variant={scheduled ? "default" : "outline"} className="gap-1.5" onClick={() => setScheduleOpen(true)}>
              <CalendarPlus className="h-3.5 w-3.5" />
              {scheduled ? t.calendar.scheduled : t.calendar.schedule}
            </Button>
          )}
        </div>
      </header>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogHeader>
          <DialogTitle>{t.calendar.scheduleTitle}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Label htmlFor="schedule-date">{t.calendar.date}</Label>
          <Input id="schedule-date" type="date" className="mt-1.5" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={confirmSchedule} disabled={!scheduleDate || scheduling}>
            {t.calendar.schedule}
          </Button>
        </DialogFooter>
      </Dialog>

      <section className="p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.blocks}</p>
        <ol className="mt-3 space-y-4">
          {blocks.map((b, i) => (
            <li key={b.order} id={`block-${b.order}`} className="rounded-xl border border-border bg-background p-4 print:break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold">
                  <span className="text-primary">{b.order}.</span> {b.title}
                </h3>
                <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {ranges[i].from}–{ranges[i].to}&apos;
                </span>
              </div>
              <div className="mt-3 max-w-xl">
                <VolleyballCourt diagram={b.diagram} />
              </div>
              <p className="mt-2 text-sm text-foreground/80">{b.description}</p>
              {b.coachingPoints.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.coachingPoints}</p>
                  <ul className="mt-1.5 space-y-1 text-sm">
                    {b.coachingPoints.map((cp, ci) => (
                      <li key={ci} className="flex gap-2 text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {cp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(b.technicalActions.offensive.length > 0 || b.technicalActions.defensive.length > 0) && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {b.technicalActions.offensive.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.offensive}</p>
                      <ul className="mt-1.5 space-y-0.5 text-xs text-foreground/80">
                        {b.technicalActions.offensive.map((a, ai) => (
                          <li key={ai}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {b.technicalActions.defensive.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.defensive}</p>
                      <ul className="mt-1.5 space-y-0.5 text-xs text-foreground/80">
                        {b.technicalActions.defensive.map((a, ai) => (
                          <li key={ai}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {b.tacticalPrinciple && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">{t.trainingDoc.tacticalPrinciple}: </span>
                  {b.tacticalPrinciple}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {(doc.progressions.length > 0 || doc.regressions.length > 0 || doc.socioAffective || doc.notes) && (
        <footer className="grid gap-4 border-t border-border bg-muted/30 p-6 md:grid-cols-2">
          {doc.progressions.length > 0 && <ListBlock label={t.trainingDoc.progressions} items={doc.progressions} />}
          {doc.regressions.length > 0 && <ListBlock label={t.trainingDoc.regressions} items={doc.regressions} />}
          {doc.socioAffective && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.socioAffective}</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/80">{doc.socioAffective}</p>
            </div>
          )}
          {doc.notes && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.notes}</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/80">{doc.notes}</p>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
