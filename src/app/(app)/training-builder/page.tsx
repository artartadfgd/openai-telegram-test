"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionary";

function categories(t: Dictionary) {
  return [
    { value: "u6", label: t.trainingBuilder.categoryU6 },
    { value: "u11", label: t.trainingBuilder.categoryU11 },
    { value: "u14", label: t.trainingBuilder.categoryU14 },
    { value: "u16", label: t.trainingBuilder.categoryU16 },
    { value: "pro", label: t.trainingBuilder.categoryPro },
  ];
}
function courtSetups(t: Dictionary) {
  return [
    { value: "reduced", label: t.trainingBuilder.courtReduced },
    { value: "attack", label: t.trainingBuilder.courtAttack },
    { value: "half", label: t.trainingBuilder.courtHalf },
    { value: "full", label: t.trainingBuilder.courtFull },
  ];
}
function moments(t: Dictionary) {
  return [
    { value: "preSeason", label: t.trainingBuilder.momentPreSeason },
    { value: "midWeek", label: t.trainingBuilder.momentMidWeek },
    { value: "matchWeek", label: t.trainingBuilder.momentMatchWeek },
    { value: "post", label: t.trainingBuilder.momentPost },
  ];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="min-w-32 text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function TrainingBuilderInner() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const STEPS = [t.trainingBuilder.stepCategory, t.trainingBuilder.stepObjective, t.trainingBuilder.stepContext, t.trainingBuilder.stepMaterials, t.trainingBuilder.stepReview];
  const CATEGORIES = categories(t);
  const COURT_SETUPS = courtSetups(t);
  const MOMENTS = moments(t);
  const OBJECTIVE_SUGGESTIONS = t.trainingBuilder.objectiveSuggestions;
  const [step, setStep] = useState(0);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    category: searchParams.get("category") ?? "u11",
    objective: searchParams.get("objective") ?? "",
    players: Number(searchParams.get("players")) || 12,
    duration: Number(searchParams.get("duration")) || 70,
    courtSetup: "reduced" as "reduced" | "attack" | "half" | "full",
    weekMoment: "midWeek",
    materials: "",
    notes: "",
    teamId: "" as string,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => setTeams(data.map((team: { id: string; name: string }) => ({ id: team.id, name: team.name }))));
  }, []);

  const canAdvance = step === 1 ? form.objective.trim().length > 2 : true;
  const isLast = step === STEPS.length - 1;

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/training/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, teamId: form.teamId || null, locale }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      const messages: Record<string, string> = {
        rate_limited: t.errors.rateLimited,
        no_credits: t.errors.noCredits,
        ai_error: t.errors.aiError,
      };
      setError(messages[data.error] ?? messages.ai_error);
      return;
    }
    router.push(`/ai-coach?c=${data.conversationId}`);
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <PageHeader title={t.trainingBuilder.title} description={t.trainingBuilder.subtitle} />

      <ol className="mb-6 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "rounded-lg border p-2.5 text-center transition-colors",
              i === step ? "border-primary/60 bg-primary/5" : i < step ? "border-border bg-card" : "border-dashed border-border bg-card/40"
            )}
          >
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-0.5 text-xs font-medium">{s}</div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.trainingBuilder.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(STEPS.length))}
        </p>

        {step === 0 && (
          <div>
            <Label className="text-sm">{t.trainingBuilder.categoryLabel}</Label>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition-colors",
                    form.category === c.value ? "border-primary bg-primary/5 text-foreground" : "border-border hover:border-primary/40 hover:bg-accent"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {teams.length > 0 && (
              <div className="mt-5">
                <Label className="text-sm">
                  {t.trainingBuilder.team} ({t.common.optional})
                </Label>
                <select
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  value={form.teamId}
                  onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
                >
                  <option value="">{t.trainingBuilder.noTeam}</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">{t.trainingBuilder.objectiveLabel}</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {OBJECTIVE_SUGGESTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, objective: o }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      form.objective === o ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 hover:bg-accent"
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
              placeholder={t.trainingBuilder.objectivePlaceholder}
              rows={3}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.trainingBuilder.playersLabel}>
                <Input type="number" min={4} max={40} value={form.players} onChange={(e) => setForm((f) => ({ ...f, players: Number(e.target.value) || 0 }))} />
              </Field>
              <Field label={t.trainingBuilder.durationLabel}>
                <Input type="number" min={20} max={180} step={5} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) || 0 }))} />
              </Field>
            </div>
            <div>
              <Label className="text-sm">{t.trainingBuilder.courtLabel}</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                {COURT_SETUPS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setForm((s) => ({ ...s, courtSetup: f.value as typeof s.courtSetup }))}
                    className={cn(
                      "rounded-lg border p-2.5 text-center text-sm transition-colors",
                      form.courtSetup === f.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-accent"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">{t.trainingBuilder.weekMomentLabel}</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                {MOMENTS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, weekMoment: m.value }))}
                    className={cn(
                      "rounded-lg border p-2.5 text-center text-xs transition-colors",
                      form.weekMoment === m.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-accent"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label={t.trainingBuilder.materialsLabel}>
              <Input
                value={form.materials}
                onChange={(e) => setForm((f) => ({ ...f, materials: e.target.value }))}
                placeholder={t.trainingBuilder.materialsPlaceholder}
              />
            </Field>
            <Field label={t.trainingBuilder.notesLabel}>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder={t.trainingBuilder.notesPlaceholder} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.trainingBuilder.reviewTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.trainingBuilder.reviewDesc}</p>
            <dl className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm md:grid-cols-2">
              <ReviewRow label={t.trainingBuilder.categoryLabel} value={CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category} />
              <ReviewRow label={t.dashboard.objective} value={form.objective || "—"} />
              <ReviewRow label={t.trainingBuilder.playersLabel} value={String(form.players)} />
              <ReviewRow label={t.trainingBuilder.durationLabel} value={`${form.duration} min`} />
              <ReviewRow label={t.trainingBuilder.courtLabel} value={COURT_SETUPS.find((f) => f.value === form.courtSetup)?.label ?? form.courtSetup} />
              <ReviewRow label={t.trainingBuilder.weekMomentLabel} value={MOMENTS.find((m) => m.value === form.weekMoment)?.label ?? form.weekMoment} />
              {form.materials && <ReviewRow label={t.trainingBuilder.materialsLabel} value={form.materials} />}
              {form.notes && <ReviewRow label={t.trainingBuilder.notesLabel} value={form.notes} />}
            </dl>
            {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            {t.trainingBuilder.back}
          </Button>
          {isLast ? (
            <Button type="button" onClick={generate} disabled={loading || !form.objective.trim()} className="gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.trainingBuilder.generating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.trainingBuilder.generate}
                </>
              )}
            </Button>
          ) : (
            <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canAdvance} className="gap-1.5">
              {t.trainingBuilder.next}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrainingBuilderPage() {
  return (
    <Suspense>
      <TrainingBuilderInner />
    </Suspense>
  );
}
