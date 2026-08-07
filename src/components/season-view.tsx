"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/context";

type Team = { id: string; name: string };
type Phase = { id: string; teamId: string; name: string; color: string; startDate: string; endDate: string };

const PHASE_COLORS = ["#22C55E", "#EF4444", "#3B82F6", "#A855F7", "#F97316", "#F59E0B"];
const LOCALE_MAP: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" };

export function SeasonView() {
  const { t, locale } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState<string>("");
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", color: PHASE_COLORS[0], startDate: "", endDate: "" });
  const [deleting, setDeleting] = useState<Phase | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(LOCALE_MAP[locale] ?? "pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data: Team[]) => {
        setTeams(data.map((team) => ({ id: team.id, name: team.name })));
        if (data.length > 0) setTeamId((prev) => prev || data[0].id);
      });
  }, []);

  async function load(id: string) {
    if (!id) return;
    const res = await fetch(`/api/season?teamId=${id}`);
    setPhases(await res.json());
  }

  useEffect(() => {
    if (teamId) load(teamId);
  }, [teamId]);

  const currentPhase = useMemo(() => {
    if (!phases) return null;
    const now = Date.now();
    return phases.find((p) => new Date(p.startDate).getTime() <= now && now <= new Date(p.endDate).getTime()) ?? null;
  }, [phases]);

  async function save() {
    if (!form.name.trim() || !form.startDate || !form.endDate || !teamId) return;
    await fetch("/api/season", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, ...form }),
    });
    setDialogOpen(false);
    setForm({ name: "", color: PHASE_COLORS[0], startDate: "", endDate: "" });
    await load(teamId);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await fetch(`/api/season/${deleting.id}`, { method: "DELETE" });
    setDeleting(null);
    await load(teamId);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.season.title}
        description={t.season.subtitle}
        actions={
          teams.length > 0 ? (
            <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.season.newPhase}
            </Button>
          ) : undefined
        }
      />

      {teams.length === 0 ? (
        <EmptyState icon={CalendarClock} title={t.players.emptyTitleNoTeam} description={t.players.emptyDescNoTeam} />
      ) : (
        <>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="mb-5 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          {currentPhase && (
            <div
              className="mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: currentPhase.color + "60", background: currentPhase.color + "14" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: currentPhase.color }} />
              <span className="font-medium">{t.season.currentPhase}:</span> {currentPhase.name}
            </div>
          )}

          {!phases ? (
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          ) : phases.length === 0 ? (
            <EmptyState icon={CalendarClock} title={t.season.empty} />
          ) : (
            <ul className="space-y-2">
              {phases.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(p.startDate))} — {dateFormatter.format(new Date(p.endDate))}
                    </div>
                  </div>
                  <button type="button" onClick={() => setDeleting(p)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{t.season.newPhase}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="phase-name">{t.season.phaseName}</Label>
            <Input id="phase-name" className="mt-1.5" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>{t.season.phaseColor}</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PHASE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="h-6 w-6 rounded-full border-2"
                  style={{ background: c, borderColor: form.color === c ? "var(--foreground)" : "transparent" }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phase-start">{t.season.startDate}</Label>
              <Input id="phase-start" type="date" className="mt-1.5" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="phase-end">{t.season.endDate}</Label>
              <Input id="phase-end" type="date" className="mt-1.5" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={save} disabled={!form.name.trim() || !form.startDate || !form.endDate}>
            {t.common.create}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogHeader>
          <DialogTitle>{t.season.deleteConfirm}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            {t.common.delete}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
