"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = null;
    let raf = 0;
    const from = 0;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function MetricCard({
  icon,
  label,
  value,
  delta,
  sublabel,
  tint,
  iconBg,
  index = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  delta: number | null;
  sublabel: string;
  tint: string;
  iconBg: string;
  index?: number;
}) {
  const animated = useCountUp(value);
  const up = delta !== null && delta >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", tint)} />
      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>{icon}</div>
        {delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
              up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="relative mt-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{animated}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{sublabel}</div>
      </div>
    </div>
  );
}
