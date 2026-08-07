"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TrainingDiagram } from "@/lib/ai";

const W = 300;
const H = 200;
const TEAM_COLOR: Record<string, string> = { A: "#3B82F6", B: "#F97316", N: "#CBD5E1" };

function pct(v: number, total: number) {
  return (v / 100) * total;
}

function dribblePath(x1: number, y1: number, x2: number, y2: number, amplitude = 3) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const nx = -dy / dist;
  const ny = dx / dist;
  const waves = Math.max(3, Math.round(dist / 10));
  const step = 1 / (waves * 2);
  let d = `M ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  for (let i = 1; i <= waves * 2; i++) {
    const t = i * step;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const side = i % 2 === 1 ? 1 : -1;
    d += ` L ${(px + nx * amplitude * side).toFixed(2)} ${(py + ny * amplitude * side).toFixed(2)}`;
  }
  return d + ` L ${x2} ${y2}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

function PitchMarkings({ type }: { type: TrainingDiagram["pitchType"] }) {
  const stroke = "#E6F0EA";
  if (type === "reduced") {
    return <rect x={4} y={4} width={W - 8} height={H - 8} fill="none" stroke={stroke} strokeWidth={1} rx={2} />;
  }
  if (type === "square") {
    const size = Math.min(W, H) - 20;
    const x = (W - size) / 2;
    const y = (H - size) / 2;
    return (
      <g fill="none" stroke={stroke} strokeWidth={1}>
        <rect x={x} y={y} width={size} height={size} rx={2} />
        <line x1={x} y1={100} x2={240} y2={100} strokeDasharray="2 3" opacity={0.6} />
        <line x1={150} y1={y} x2={150} y2={190} strokeDasharray="2 3" opacity={0.6} />
      </g>
    );
  }
  if (type === "half") {
    return (
      <g fill="none" stroke={stroke} strokeWidth={1}>
        <rect x={4} y={4} width={W - 8} height={H - 8} />
        <rect x={W / 2 - 44} y={4} width={88} height={30} />
        <rect x={W / 2 - 20} y={4} width={40} height={12} />
        <rect x={W / 2 - 10} y={0} width={20} height={4} />
        <path d={`M ${W / 2 - 14} 34 A 14 14 0 0 0 164 34`} />
      </g>
    );
  }
  return (
    <g fill="none" stroke={stroke} strokeWidth={1}>
      <rect x={4} y={4} width={W - 8} height={H - 8} />
      <line x1={W / 2} y1={4} x2={W / 2} y2={H - 4} />
      <circle cx={W / 2} cy={H / 2} r={18} />
      <rect x={4} y={H / 2 - 32} width={34} height={64} />
      <rect x={4} y={H / 2 - 14} width={12} height={28} />
      <rect x={W - 38} y={H / 2 - 32} width={34} height={64} />
      <rect x={W - 16} y={H / 2 - 14} width={12} height={28} />
      <rect x={0} y={H / 2 - 8} width={4} height={16} />
      <rect x={W - 4} y={H / 2 - 8} width={4} height={16} />
    </g>
  );
}

function PlayerDot({ p }: { p: TrainingDiagram["players"][number] }) {
  const cx = pct(p.x, W);
  const cy = pct(p.y, H);
  const fill = TEAM_COLOR[p.team] ?? "#64748B";
  return (
    <g>
      {p.gk && <circle cx={cx} cy={cy} r={8} fill="none" stroke="#ffffff" strokeWidth={1.5} />}
      <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#0b0b0f" strokeWidth={0.6} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={6} fontWeight={700} fill="#ffffff" style={{ paintOrder: "stroke", pointerEvents: "none" }}>
        {p.number}
      </text>
    </g>
  );
}

export function TacticalPitch({ diagram, animated = true }: { diagram: TrainingDiagram; animated?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const arrows = useMemo(
    () =>
      (diagram.arrows ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((a) => {
          const x1 = pct(a.from.x, W);
          const y1 = pct(a.from.y, H);
          const x2 = pct(a.to.x, W);
          const y2 = pct(a.to.y, H);
          return { d: a.type === "dribble" ? dribblePath(x1, y1, x2, y2) : `M ${x1} ${y1} L ${x2} ${y2}`, type: a.type };
        }),
    [diagram.arrows]
  );

  useEffect(() => {
    pathRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = arrows[i]?.type === "pass" ? "5 3" : `${len}`;
      el.style.strokeDashoffset = reducedMotion || !animated ? "0" : `${len}`;
    });
  }, [arrows, animated, reducedMotion]);

  const players = diagram.players ?? [];
  const cones = diagram.cones ?? [];
  const balls = diagram.balls ?? [];

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-[#1F6F43] shadow-inner print:border-[#0b3a22] print:bg-[#E9F5EC]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        <defs>
          <marker id="tp-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
          </marker>
        </defs>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={0} y={(H / 8) * i} width={W} height={H / 8} fill={i % 2 === 0 ? "#1F6F43" : "#237A4B"} className="print:!fill-[#E9F5EC]" />
        ))}
        <PitchMarkings type={diagram.pitchType} />
        {cones.map((c, i) => {
          const x = pct(c.x, W);
          const y = pct(c.y, H);
          return <polygon key={`c-${i}`} points={`${x},${y - 3} ${x - 2.5},${y + 2} ${x + 2.5},${y + 2}`} fill="#F97316" stroke="#0b0b0f" strokeWidth={0.4} />;
        })}
        {balls.map((b, i) => (
          <circle key={`b-${i}`} cx={pct(b.x, W)} cy={pct(b.y, H)} r={2.4} fill="#ffffff" stroke="#0b0b0f" strokeWidth={0.5} />
        ))}
        {arrows.map((a, i) => (
          <path
            key={`a-${i}`}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={a.d}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.6}
            strokeLinecap="round"
            markerEnd="url(#tp-arrowhead)"
          />
        ))}
        {players.map((p, i) => (
          <PlayerDot key={`p-${i}`} p={p} />
        ))}
      </svg>
    </div>
  );
}
