"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "u6", label: "Sub-6" },
  { value: "u11", label: "Sub-11" },
  { value: "u14", label: "Sub-14" },
  { value: "u16", label: "Sub-16" },
  { value: "pro", label: "Profissional" },
];

const OBJECTIVES = ["Posse de bola", "Finalização", "Transição rápida", "Marcação em bloco baixo", "Construção de jogo"];

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
      </div>
    </label>
  );
}

export function QuickCreateForm() {
  const router = useRouter();
  const [category, setCategory] = useState("u14");
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [duration, setDuration] = useState("75");
  const [players, setPlayers] = useState("16");

  function submit() {
    const params = new URLSearchParams({ category, objective, duration, players });
    router.push(`/training-builder?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <WandSparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Criação rápida</h2>
          <p className="text-xs text-muted-foreground">Monte um treino em segundos</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <Select label="Categoria" value={category} onChange={setCategory} options={CATEGORIES} />
        <Select label="Objetivo" value={objective} onChange={setObjective} options={OBJECTIVES.map((o) => ({ value: o, label: o }))} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Duração" value={duration} onChange={setDuration} options={[45, 60, 75, 90, 105, 120].map((n) => ({ value: String(n), label: `${n} min` }))} />
          <Select label="Jogadores" value={players} onChange={setPlayers} options={[8, 10, 12, 14, 16, 18, 20, 22, 24].map((n) => ({ value: String(n), label: String(n) }))} />
        </div>
      </div>

      <Button className="mt-5 w-full gap-2" onClick={submit}>
        Criar treino
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
