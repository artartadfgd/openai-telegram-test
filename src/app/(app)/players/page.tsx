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
import { useTranslation } from "@/lib/i18n/context";

type Team = { id: string; name: string; crestShape: CrestShape; primaryColor: string; secondaryColor: string };
type Player = { id: string; name: string; position: string | null; birthDate: string | null; notes: string | null; teamId: string; team: Team };

const emptyForm = { name: "", teamId: "", position: "", birthDate: "", notes: "" };

function PlayersInner() {
  const { t } = useTranslation();
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

  function openEdit(player: Player) {
    setEditing(player);
    setForm({ name: player.name, teamId: player.teamId, position: player.position ?? "", birthDate: player.birthDate ?? "", notes: player.notes ?? "" });
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

  const activeTeam = teams.find((team) => team.id === filterTeamId);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={activeTeam ? `${t.players.title} · ${activeTeam.name}` : t.players.title}
        description={t.players.subtitle}
        actions={
          teams.length > 0 ? (
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t.players.newPlayer}
            </Button>
          ) : undefined
        }
      />

      {teams.length === 0 ? (
        <EmptyState icon={Users} title={t.players.emptyTitleNoTeam} description={t.players.emptyDescNoTeam} />
      ) : !players ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={t.players.emptyTitle}
          description={t.players.emptyDesc}
          action={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t.players.addPlayer}
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <li key={player.id} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {initialsFromName(player.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{player.name}</div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  {player.position && <span>{player.position}</span>}
                  <span className="flex items-center gap-1">
                    <TeamCrest name={player.team.name} shape={player.team.crestShape} primaryColor={player.team.primaryColor} secondaryColor={player.team.secondaryColor} size={14} />
                    {player.team.name}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
                <button type="button" onClick={() => openEdit(player)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setDeleting(player)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? t.players.dialogEditTitle : t.players.dialogCreateTitle}</DialogTitle>
          <DialogDescription>{t.players.dialogSubtitle}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="player-name">{t.players.name}</Label>
            <Input id="player-name" className="mt-1.5" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="player-team">{t.players.team}</Label>
            <select
              id="player-team"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              value={form.teamId}
              onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="player-position">{t.players.position}</Label>
              <Input id="player-position" className="mt-1.5" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="player-birth">{t.players.birthDate}</Label>
              <Input id="player-birth" type="date" className="mt-1.5" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={save} disabled={!form.name.trim() || !form.teamId}>
            {editing ? t.players.saveButton : t.players.createButton}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogHeader>
          <DialogTitle>{t.players.removeTitle}</DialogTitle>
          <DialogDescription>{t.players.removeConfirm}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            {t.common.remove}
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
