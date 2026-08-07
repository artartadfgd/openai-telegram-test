"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TeamCrest, type CrestShape } from "@/components/team-crest";
import { CATEGORIES, PLAY_STYLES, PRIORITIES, CREST_SHAPES, CREST_COLORS } from "@/lib/team-options";

type Team = {
  id: string;
  name: string;
  category: string;
  seasonLabel: string | null;
  playStyle: string | null;
  priorities: string[];
  crestShape: CrestShape;
  primaryColor: string;
  secondaryColor: string;
  playersCount: number;
};

const emptyForm = {
  name: "",
  category: "U14",
  seasonLabel: "",
  playStyle: "" as string,
  priorities: [] as string[],
  crestShape: "shield" as CrestShape,
  primaryColor: CREST_COLORS[0],
  secondaryColor: "#0b0b0e",
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Team | null>(null);

  async function load() {
    const res = await fetch("/api/teams");
    setTeams(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(team: Team) {
    setEditing(team);
    setForm({
      name: team.name,
      category: team.category,
      seasonLabel: team.seasonLabel ?? "",
      playStyle: team.playStyle ?? "",
      priorities: team.priorities,
      crestShape: team.crestShape,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
    });
    setDialogOpen(true);
  }

  function togglePriority(value: string) {
    setForm((f) => ({
      ...f,
      priorities: f.priorities.includes(value) ? f.priorities.filter((p) => p !== value) : [...f.priorities, value],
    }));
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const url = editing ? `/api/teams/${editing.id}` : "/api/teams";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setDialogOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await fetch(`/api/teams/${deleting.id}`, { method: "DELETE" });
    setDeleting(null);
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Times"
        description="Organize seus times, estilos de jogo e prioridades da temporada."
        actions={
          teams && teams.length > 0 ? (
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo time
            </Button>
          ) : undefined
        }
      />

      {!teams ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum time cadastrado"
          description="Crie seu primeiro time para começar a planejar treinos personalizados."
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Criar time
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((t) => {
            const readiness =
              (t.crestShape ? 25 : 0) + (t.playStyle ? 25 : 0) + (t.priorities.length > 0 ? 25 : 0) + (t.seasonLabel ? 25 : 0);
            return (
              <div key={t.id} className="group relative">
                <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => openEdit(t)}
                    className="rounded-md border border-border bg-background/90 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir"
                    onClick={() => setDeleting(t)}
                    className="rounded-md border border-border bg-background/90 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Link
                  href={`/players?teamId=${t.id}`}
                  className="block rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <TeamCrest name={t.name} shape={t.crestShape} primaryColor={t.primaryColor} secondaryColor={t.secondaryColor} size={64} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold">{t.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {t.category}
                            {t.seasonLabel ? ` · ${t.seasonLabel}` : ""}
                          </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 text-xs font-semibold text-primary">
                          {readiness}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        {t.playStyle && (
                          <span className="rounded-full bg-muted px-2 py-0.5">
                            {PLAY_STYLES.find((p) => p.value === t.playStyle)?.label ?? t.playStyle}
                          </span>
                        )}
                        <span className="rounded-full bg-muted px-2 py-0.5">{t.playersCount} jogadores</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar time" : "Novo time"}</DialogTitle>
          <DialogDescription>Defina a identidade e o estilo de jogo do time.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="flex items-center gap-4">
            <TeamCrest name={form.name || "Time"} shape={form.crestShape} primaryColor={form.primaryColor} secondaryColor={form.secondaryColor} size={64} />
            <div className="flex flex-wrap gap-1.5">
              {CREST_SHAPES.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, crestShape: shape }))}
                  className={`rounded-md border p-1 ${form.crestShape === shape ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <TeamCrest name={form.name || "Time"} shape={shape} primaryColor={form.primaryColor} secondaryColor={form.secondaryColor} size={28} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CREST_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => setForm((f) => ({ ...f, primaryColor: c }))}
                className="h-6 w-6 rounded-full border-2"
                style={{ background: c, borderColor: form.primaryColor === c ? "var(--foreground)" : "transparent" }}
              />
            ))}
          </div>

          <div>
            <Label htmlFor="team-name">Nome do time</Label>
            <Input id="team-name" className="mt-1.5" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="team-category">Categoria</Label>
              <select
                id="team-category"
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="team-season">Temporada</Label>
              <Input
                id="team-season"
                placeholder="2025/2026"
                className="mt-1.5"
                value={form.seasonLabel}
                onChange={(e) => setForm((f) => ({ ...f, seasonLabel: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Estilo de jogo</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PLAY_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, playStyle: s.value }))}
                  className={`rounded-lg border p-2 text-left text-xs transition-colors ${
                    form.playStyle === s.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Prioridades da temporada</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePriority(p.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    form.priorities.includes(p.value) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {editing ? "Salvar alterações" : "Criar time"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogHeader>
          <DialogTitle>Excluir time</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir &ldquo;{deleting?.name}&rdquo;? Os jogadores vinculados também serão removidos. Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
