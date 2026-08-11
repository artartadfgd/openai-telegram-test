"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import type { SkillType } from "@/lib/volleyball";

const PRIMARY: { type: SkillType; color: string; labelKey: keyof ReturnType<typeof useTranslation>["t"]["library"] }[] = [
  { type: "serve", color: "#3B82F6", labelKey: "skillServe" },
  { type: "pass", color: "#22C55E", labelKey: "skillPass" },
  { type: "set", color: "#EAB308", labelKey: "skillSet" },
  { type: "attack", color: "#8B5CF6", labelKey: "skillAttack" },
  { type: "block", color: "#EF4444", labelKey: "skillBlock" },
  { type: "defense", color: "#14B8A6", labelKey: "skillDefense" },
  { type: "smallSided", color: "#F97316", labelKey: "skillSmallSided" },
];

const MORE: { type: SkillType; color: string; labelKey: keyof ReturnType<typeof useTranslation>["t"]["library"] }[] = [
  { type: "libero", color: "#D946EF", labelKey: "skillLibero" },
  { type: "rotation", color: "#7C3AED", labelKey: "skillRotation" },
  { type: "coverage", color: "#64748B", labelKey: "skillCoverage" },
  { type: "transition", color: "#EC4899", labelKey: "skillTransition" },
  { type: "communication", color: "#2563EB", labelKey: "skillCommunication" },
  { type: "conditioning", color: "#EA580C", labelKey: "skillConditioning" },
  { type: "pressure", color: "#BE123C", labelKey: "skillPressure" },
];

export function LibraryFilterBar({ value, onChange }: { value: SkillType | "all"; onChange: (v: SkillType | "all") => void }) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [moreOpen]);

  const activeInMore = MORE.find((m) => m.type === value);

  return (
    <div className="mb-6 -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          value === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/40"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        {t.library.filterAll}
      </button>
      {PRIMARY.map((item) => (
        <button
          key={item.type}
          type="button"
          onClick={() => onChange(item.type)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            value === item.type ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:border-primary/40"
          )}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          {t.library[item.labelKey]}
        </button>
      ))}
      <div className="relative shrink-0" ref={ref}>
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            activeInMore ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:border-primary/40"
          )}
        >
          {activeInMore ? (
            <>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeInMore.color }} />
              {t.library[activeInMore.labelKey]}
            </>
          ) : (
            t.library.filterMore
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {moreOpen && (
          <div className="absolute left-0 z-50 mt-1 w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
            {MORE.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  onChange(item.type);
                  setMoreOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  value === item.type && "text-primary"
                )}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                {t.library[item.labelKey]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
