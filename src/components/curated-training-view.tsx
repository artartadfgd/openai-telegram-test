"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Printer, Sparkles } from "lucide-react";
import { VolleyballCourt } from "@/components/volleyball-court";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLibraryTemplate } from "@/lib/library-content";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

export function CuratedTrainingView({ slug }: { slug: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = useMemo(() => getLibraryTemplate(locale, slug), [locale, slug]);

  const blocks = useMemo(() => (template ? template.blocks.slice().sort((a, b) => a.order - b.order) : []), [template]);
  const ranges = useMemo(() => {
    let acc = 0;
    return blocks.map((b) => {
      const from = acc;
      acc += b.durationMin;
      return { from, to: acc };
    });
  }, [blocks]);

  async function useTemplate() {
    if (!template) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/library/${template.slug}/use`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(t.errors.aiError);
      return;
    }
    router.push(`/ai-coach?c=${data.conversationId}`);
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-muted-foreground">{t.library.notFound}</p>
        <Link href="/library" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          {t.library.backToLibrary}
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl animate-fade-in rounded-2xl border border-border bg-card shadow-sm print:border-0 print:shadow-none">
      <header
        className="relative overflow-hidden rounded-t-2xl border-b border-border p-6"
        style={{ background: `linear-gradient(135deg, ${template.coverFrom}22, transparent)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/library-covers/${template.slug}-1.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 print:hidden"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="relative">
        <Badge variant="secondary" className="mb-3 font-normal">
          {template.category} · {t.library.readyMadeBadge}
        </Badge>
        <p className="text-sm italic text-muted-foreground">&ldquo;{template.hook}&rdquo;</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{template.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{template.subtitle}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label={t.trainingDoc.category} value={template.category} />
          <Stat label={t.trainingDoc.duration} value={`${template.totalDurationMin} min`} />
          <Stat label={t.trainingDoc.players} value={String(template.playersCount)} />
          <Stat label={t.trainingDoc.court} value={template.courtSetup} />
          <Stat label={t.trainingDoc.intensity} value={"●".repeat(template.intensity) + "○".repeat(3 - template.intensity)} />
        </div>

        {template.materials.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.materials}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {template.materials.map((m, i) => (
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
              href={`#curated-block-${b.order}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`curated-block-${b.order}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group flex w-32 shrink-0 flex-col gap-1 rounded-lg border border-border bg-background p-1.5 transition-colors hover:border-primary/50"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-md">
                <VolleyballCourt diagram={b.diagram} animated={false} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/library-covers/${template.slug}-${b.order}.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
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

        <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
          <Button size="sm" className="gap-1.5" onClick={useTemplate} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {t.library.useTraining}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            {t.trainingDoc.print}
          </Button>
        </div>
        {error && <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        </div>
      </header>

      <section className="p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.blocks}</p>
        <ol className="mt-3 space-y-4">
          {blocks.map((b, i) => (
            <li key={b.order} id={`curated-block-${b.order}`} className="rounded-xl border border-border bg-background p-4 print:break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold">
                  <span className="text-primary">{b.order}.</span> {b.title}
                </h3>
                <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {ranges[i].from}–{ranges[i].to}&apos;
                </span>
              </div>
              <div className="relative mt-3 aspect-[3/2] max-w-xl overflow-hidden rounded-lg">
                <VolleyballCourt diagram={b.diagram} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/library-covers/${template.slug}-${b.order}.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.setup}</p>
                <p className="mt-1 text-sm text-foreground/80">{b.description}</p>
              </div>
              {b.coachingPoints.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.trainingDoc.howTo}</p>
                  <ol className="mt-2 space-y-2">
                    {b.coachingPoints.map((cp, ci) => (
                      <li key={ci} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                          {ci + 1}
                        </span>
                        <span className="pt-0.5">{cp}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {b.tacticalPrinciple && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">{t.trainingDoc.tacticalPrinciple}: </span>
                  {b.tacticalPrinciple}
                </p>
              )}
              {b.variants && (b.variants.harder || b.variants.easier) && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t.library.variants}</p>
                  <ul className="mt-1.5 space-y-1 text-sm text-foreground/80">
                    {b.variants.harder && (
                      <li>
                        <span className="font-medium">{t.library.harder}:</span> {b.variants.harder}
                      </li>
                    )}
                    {b.variants.easier && (
                      <li>
                        <span className="font-medium">{t.library.easier}:</span> {b.variants.easier}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
