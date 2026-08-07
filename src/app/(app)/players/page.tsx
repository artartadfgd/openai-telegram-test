"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2, UserRound, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TeamCrest, initialsFromName, type CrestShape } from "@/components/team-crest";

type Team = { id: string; name: string; crestShape: CrestShape; primaryColor: string; secondaryColor: string };
type Player = { id: string; name: string; position: string | null; birthDate: string | null; notes: string | null; teamId: string; team: Team };

const emptyForm = { name: "", teamId: "", position: "", birthDate: "", notes: "" };

function PlayersInner() {
  const searchParams = useSearchParams();
  const filterTeamId = searchParams.get("teamId");

  const [players, setPlayers] = useState<Player[] | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState<Player | null>(null);

  async function load() {
    const [playersRes, teamsRes] = await Promise.all([
      fetch(`/api/players${filterTeamId ? `?teamId=${filterTeamId}` : ""}`),
      fetch("/api/teams"),
    ]);
    setPlayers(await playersRes.json());
    setTeams(await teamsRes.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTeamId]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, teamId: filterTeamId ?? teams[0]?.id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(p: Player) {
    setEditing(p);
    setForm({ name: p.name, teamId: p.teamId, position: p.position ?? "", birthDate: p.birthDate ?? "", notes: p.notes ?? "" });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.teamId) return;
    const url = editing ? `/api/players/${editing.id}` : "/api/players";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setDialogOpen(false);
    await load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await fetch(`/api/players/${deleting.id}`, { method: "DELETE" });
    setDeleting(null);
    await load();
  }

  const activeTeam = teams.find((t) => t.id === filterTeamId);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={activeTeam ? `Jogadores · ${activeTeam.name}` : "Jogadores"}
        description="Acompanhe o elenco de cada time."
        actions={
          teams.length > 0 ? (
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo jogador
            </Button>
          ) : undefined
        }
      />

      {teams.length === 0 ? (
        <EmptyState icon={Users} title="Crie um time primeiro" description="Você precisa de pelo menos um time antes de cadastrar jogadores." />
      ) : !players ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Nenhum jogador cadastrado"
          description="Adicione jogadores para acompanhar o desenvolvimento de cada um."
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Adicionar jogador
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {players.map((p) => (
            <li key={p.id} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {initialsFromName(p.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  {p.position && <span>{p.position}</span>}
                  <span className="flex items-center gap-1">
                    <TeamCrest name={p.team.name} shape={p.team.crestShape} primaryColor={p.team.primaryColor} secondaryColor={p.team.secondaryColor} size={14} />
                    {p.team.name}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
                <button type="button" onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setDeleting(p)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar jogador" : "Novo jogador"}</DialogTitle>
          <DialogDescription>Informações básicas do atleta.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="player-name">Nome</Label>
            <Input id="player-name" className="mt-1.5" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="player-team">Time</Label>
            <select
              id="player-team"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              value={form.teamId}
              onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="player-position">Posição</Label>
              <Input id="player-position" className="mt-1.5" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="player-birth">Nascimento</Label>
              <Input id="player-birth" type="date" className="mt-1.5" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!form.name.trim() || !form.teamId}>
            {editing ? "Salvar alterações" : "Adicionar"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogHeader>
          <DialogTitle>Remover jogador</DialogTitle>
          <DialogDescription>Tem certeza que deseja remover &ldquo;{deleting?.name}&rdquo;?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Remover
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense>
      <PlayersInner />
    </Suspense>
  );
}
