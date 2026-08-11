"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutDashboard, Sparkles, WandSparkles, BookOpen, Users, UserRound, CalendarRange, CalendarClock, X } from "lucide-react";
import { useTour, type TourStepKey } from "@/lib/tour-context";
import { useTranslation } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionary";

const STEP_ICON: Record<TourStepKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  aiCoach: Sparkles,
  trainingBuilder: WandSparkles,
  library: BookOpen,
  teams: Users,
  players: UserRound,
  calendar: CalendarRange,
  season: CalendarClock,
};

const STEP_CONTENT: Record<TourStepKey, { titleKey: keyof Dictionary["tour"]; descKey: keyof Dictionary["tour"] }> = {
  dashboard: { titleKey: "stepDashboardTitle", descKey: "stepDashboardDesc" },
  aiCoach: { titleKey: "stepAiCoachTitle", descKey: "stepAiCoachDesc" },
  trainingBuilder: { titleKey: "stepTrainingBuilderTitle", descKey: "stepTrainingBuilderDesc" },
  library: { titleKey: "stepLibraryTitle", descKey: "stepLibraryDesc" },
  teams: { titleKey: "stepTeamsTitle", descKey: "stepTeamsDesc" },
  players: { titleKey: "stepPlayersTitle", descKey: "stepPlayersDesc" },
  calendar: { titleKey: "stepCalendarTitle", descKey: "stepCalendarDesc" },
  season: { titleKey: "stepSeasonTitle", descKey: "stepSeasonDesc" },
};

const PADDING = 6;

export function TourOverlay() {
  const { active, stepIndex, totalSteps, currentKey, next, back, skip } = useTour();
  const { t } = useTranslation();
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!active) return;
    function update() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${currentKey}"]`);
      const r = el?.getBoundingClientRect() ?? null;
      setRect(r && (r.width > 0 || r.height > 0) ? r : null);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, currentKey]);

  if (!active) return null;

  const Icon = STEP_ICON[currentKey];
  const content = STEP_CONTENT[currentKey];
  const title = t.tour[content.titleKey];
  const desc = t.tour[content.descKey];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  const box = rect
    ? { top: rect.top - PADDING, left: rect.left - PADDING, width: rect.width + PADDING * 2, height: rect.height + PADDING * 2 }
    : null;

  let tooltipStyle: React.CSSProperties;
  if (box) {
    const preferRight = box.left + box.width + 320 < window.innerWidth;
    if (preferRight) {
      tooltipStyle = { top: Math.min(Math.max(box.top, 12), window.innerHeight - 260), left: box.left + box.width + 14 };
    } else {
      tooltipStyle = { top: Math.min(box.top + box.height + 14, window.innerHeight - 260), left: Math.max(12, box.left) };
    }
  } else {
    tooltipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {box ? (
        <div
          className="pointer-events-none fixed rounded-xl border-2 border-primary transition-all duration-300"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            boxShadow: "0 0 0 4px rgba(59,130,246,0.35), 0 0 0 9999px rgba(0,0,0,0.65)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/65" />
      )}

      <div
        className="fixed w-80 max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl transition-all duration-300"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              {t.tour.stepOf.replace("{n}", String(stepIndex + 1)).replace("{total}", String(totalSteps))}
            </span>
          </div>
          <button type="button" onClick={skip} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-3 text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={skip} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t.tour.skip}
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {t.tour.back}
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              {isLast ? t.tour.finish : t.tour.next}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
