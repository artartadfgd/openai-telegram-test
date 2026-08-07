"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CourtDiagram } from "@/lib/volleyball";

const W = 300;
const H = 200;
const NET_Y = H / 2;
const ATTACK_A_Y = H * (1 - 1 / 3); // attack line on side A (bottom half)
const ATTACK_B_Y = H * (1 / 3); // attack line on side B (top half)
const TEAM_COLOR: Record<string, string> = { A: "#3B82F6", B: "#F97316", N: "#CBD5E1" };

function pct(v: number, total: number) {
  return (v / 100) * total;
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

function CourtMarkings() {
  const line = "#ffffff";
  return (
    <g fill="none" stroke={line} strokeWidth={1}>
      <rect x={4} y={4} width={W - 8} height={H - 8} />
      <line x1={4} y1={NET_Y} x2={W - 4} y2={NET_Y} strokeWidth={2.2} />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i} x1={4 + i * ((W - 8) / 13)} y1={NET_Y - 3} x2={4 + i * ((W - 8) / 13)} y2={NET_Y + 3} strokeWidth={0.8} />
      ))}
      <line x1={4} y1={ATTACK_A_Y} x2={W - 4} y2={ATTACK_A_Y} strokeDasharray="3 2" strokeWidth={0.8} opacity={0.85} />
      <line x1={4} y1={ATTACK_B_Y} x2={W - 4} y2={ATTACK_B_Y} strokeDasharray="3 2" strokeWidth={0.8} opacity={0.85} />
      <line x1={4} y1={NET_Y - 6} x2={4} y2={NET_Y + 6} strokeWidth={2.4} />
      <line x1={W - 4} y1={NET_Y - 6} x2={W - 4} y2={NET_Y + 6} strokeWidth={2.4} />
    </g>
  );
}

function PlayerDot({ p, index, reducedMotion }: { p: CourtDiagram["players"][number]; index: number; reducedMotion: boolean }) {
  const cx = pct(p.x, W);
  const cy = pct(p.y, H);
  const fill = TEAM_COLOR[p.team] ?? "#64748B";
  return (
    <g style={reducedMotion ? undefined : { animation: `vc-in 260ms ease-out both`, animationDelay: `${index * 60}ms` }}>
      {p.libero && <circle cx={cx} cy={cy} r={8} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeDasharray="2 1.5" />}
      <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#0b0b0f" strokeWidth={0.6} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={6} fontWeight={700} fill="#ffffff" style={{ paintOrder: "stroke", pointerEvents: "none" }}>
        {p.number}
      </text>
    </g>
  );
}

const ARROW_COLORS: Record<string, string> = {
  serve: "#FBBF24",
  set: "#38BDF8",
  spike: "#F87171",
  block: "#A78BFA",
  dig: "#34D399",
  move: "#ffffff",
};

export function VolleyballCourt({ diagram, animated = true }: { diagram: CourtDiagram; animated?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const lengthsRef = useRef<number[]>([]);

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
          return { d: `M ${x1} ${y1} L ${x2} ${y2}`, type: a.type, color: ARROW_COLORS[a.type] ?? "#ffffff" };
        }),
    [diagram.arrows]
  );

  useEffect(() => {
    lengthsRef.current = pathRefs.current.map((el) => el?.getTotalLength() ?? 0);
    pathRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = lengthsRef.current[i];
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = reducedMotion || !animated ? "0" : `${len}`;
    });
    if (reducedMotion || !animated || arrows.length === 0) return;

    const cycle = arrows.length * 500 + 900;
    let raf = 0;
    const start = performance.now();
    const step = (ts: number) => {
      const t = (ts - start) % cycle;
      arrows.forEach((_, i) => {
        const el = pathRefs.current[i];
        if (!el) return;
        const len = lengthsRef.current[i] || 1;
        const localT = t - i * 500;
        let progress = 0;
        if (localT < 0) progress = 0;
        else if (localT >= 400) progress = 1;
        else progress = localT / 400;
        el.style.strokeDashoffset = `${(1 - progress) * len}`;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [arrows, animated, reducedMotion]);

  const players = diagram.players ?? [];
  const cones = diagram.cones ?? [];
  const balls = diagram.balls ?? [];

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-[#1B4B66] shadow-inner print:border-[#0b3a4a] print:bg-[#E9F2F5]">
      <style>{`
        @keyframes vc-in { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes vc-ball { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); } }
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        <defs>
          {Object.entries(ARROW_COLORS).map(([type, color]) => (
            <marker key={type} id={`vc-arrowhead-${type}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth={4.5} markerHeight={4.5} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
          ))}
          <linearGradient id="vc-half-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E5876" />
            <stop offset="100%" stopColor="#1B4B66" />
          </linearGradient>
          <linearGradient id="vc-half-b" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1E5876" />
            <stop offset="100%" stopColor="#1B4B66" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={NET_Y} fill="url(#vc-half-b)" className="print:!fill-[#E9F2F5]" />
        <rect x={0} y={NET_Y} width={W} height={H - NET_Y} fill="url(#vc-half-a)" className="print:!fill-[#E9F2F5]" />
        <CourtMarkings />
        {cones.map((c, i) => {
          const x = pct(c.x, W);
          const y = pct(c.y, H);
          return <polygon key={`c-${i}`} points={`${x},${y - 3} ${x - 2.5},${y + 2} ${x + 2.5},${y + 2}`} fill="#F97316" stroke="#0b0b0f" strokeWidth={0.4} />;
        })}
        {arrows.map((a, i) => (
          <path
            key={`a-${i}`}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={1.6}
            strokeLinecap="round"
            markerEnd={`url(#vc-arrowhead-${a.type})`}
          />
        ))}
        {players.map((p, i) => (
          <PlayerDot key={`p-${i}`} p={p} index={i} reducedMotion={reducedMotion || !animated} />
        ))}
        {balls.map((b, i) => (
          <circle
            key={`b-${i}`}
            cx={pct(b.x, W)}
            cy={pct(b.y, H)}
            r={2.6}
            fill="#F7E7B4"
            stroke="#0b0b0f"
            strokeWidth={0.5}
            style={reducedMotion || !animated ? undefined : { transformBox: "fill-box", transformOrigin: "center", animation: "vc-ball 1.1s ease-in-out infinite" }}
          />
        ))}
      </svg>
    </div>
  );
}
