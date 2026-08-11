"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CourtDiagram } from "@/lib/volleyball";

const W = 300;
const H = 200;
const NET_Y = H / 2;
const ATTACK_A_Y = H * (1 - 1 / 3); // attack line on side A (bottom half)
const ATTACK_B_Y = H * (1 / 3); // attack line on side B (top half)

const TEAM_GRADIENT: Record<string, { light: string; dark: string; ring: string }> = {
  A: { light: "#7DB2FF", dark: "#1D4ED8", ring: "#0F2D6E" },
  B: { light: "#FFC08A", dark: "#C2410C", ring: "#6B2708" },
  N: { light: "#E9EDF3", dark: "#8B97A8", ring: "#4B5566" },
};

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

function curvedPath(x1: number, y1: number, x2: number, y2: number, curvature = 0.2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  const cx = mx + nx * dist * curvature;
  const cy = my + ny * dist * curvature;
  return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, cx, cy };
}

function CourtMarkings() {
  const line = "#FDFBF5";
  return (
    <g fill="none" stroke={line}>
      <rect x={5} y={5} width={W - 10} height={H - 10} strokeWidth={1.4} opacity={0.95} />
      <line x1={5} y1={ATTACK_A_Y} x2={W - 5} y2={ATTACK_A_Y} strokeDasharray="3 2.2" strokeWidth={1} opacity={0.55} />
      <line x1={5} y1={ATTACK_B_Y} x2={W - 5} y2={ATTACK_B_Y} strokeDasharray="3 2.2" strokeWidth={1} opacity={0.55} />
      {/* net shadow */}
      <line x1={5} y1={NET_Y + 1.6} x2={W - 5} y2={NET_Y + 1.6} stroke="#00000030" strokeWidth={3} />
      {/* net band */}
      <line x1={4} y1={NET_Y} x2={W - 4} y2={NET_Y} stroke="#1E293B" strokeWidth={3.4} />
      <line x1={4} y1={NET_Y} x2={W - 4} y2={NET_Y} stroke="#F8FAFC" strokeWidth={0.8} opacity={0.5} />
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={i} x1={4 + i * ((W - 8) / 21)} y1={NET_Y - 2.6} x2={4 + i * ((W - 8) / 21)} y2={NET_Y + 2.6} stroke="#F8FAFC" strokeWidth={0.5} opacity={0.55} />
      ))}
      {/* net posts */}
      <line x1={4} y1={NET_Y - 7} x2={4} y2={NET_Y + 7} stroke="#1E293B" strokeWidth={2.6} strokeLinecap="round" />
      <line x1={W - 4} y1={NET_Y - 7} x2={W - 4} y2={NET_Y + 7} stroke="#1E293B" strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
}

function PlayerToken({ p, index, reducedMotion }: { p: CourtDiagram["players"][number]; index: number; reducedMotion: boolean }) {
  const cx = pct(p.x, W);
  const cy = pct(p.y, H);
  const g = TEAM_GRADIENT[p.team] ?? TEAM_GRADIENT.N;
  return (
    <g style={reducedMotion ? undefined : { animation: `vc-in 280ms ease-out both`, animationDelay: `${index * 55}ms` }} filter="url(#vc-token-shadow)">
      {p.libero && <circle cx={cx} cy={cy} r={8.2} fill="none" stroke="#FDFBF5" strokeWidth={1.3} strokeDasharray="2 1.6" opacity={0.85} />}
      <circle cx={cx} cy={cy} r={6.4} fill={`url(#vc-grad-${p.team})`} stroke={g.ring} strokeWidth={0.9} />
      <circle cx={cx - 1.6} cy={cy - 2} r={2.1} fill="#ffffff" opacity={0.35} />
      <text x={cx} y={cy + 0.3} textAnchor="middle" dominantBaseline="central" fontSize={6.4} fontWeight={800} fill="#ffffff" style={{ paintOrder: "stroke", pointerEvents: "none" }}>
        {p.number}
      </text>
    </g>
  );
}

const ARROW_COLORS: Record<string, string> = {
  serve: "#F59E0B",
  set: "#0EA5E9",
  spike: "#EF4444",
  block: "#8B5CF6",
  dig: "#10B981",
  move: "#F8FAFC",
};

const TRAVEL_MS = 900;
const GAP_MS = 350;

export function VolleyballCourt({ diagram, animated = true }: { diagram: CourtDiagram; animated?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
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
          const { d } = curvedPath(x1, y1, x2, y2);
          return { d, type: a.type, color: ARROW_COLORS[a.type] ?? "#F8FAFC" };
        }),
    [diagram.arrows]
  );

  useEffect(() => {
    lengthsRef.current = pathRefs.current.map((el) => el?.getTotalLength() ?? 0);
    if (reducedMotion || !animated || arrows.length === 0) return;

    const perArrow = TRAVEL_MS + GAP_MS;
    const cycle = arrows.length * perArrow;
    let raf = 0;
    const start = performance.now();
    const step = (ts: number) => {
      const t = (ts - start) % cycle;
      arrows.forEach((_, i) => {
        const path = pathRefs.current[i];
        const marker = markerRefs.current[i];
        if (!path || !marker) return;
        const len = lengthsRef.current[i] || 1;
        const localT = t - i * perArrow;
        if (localT < 0 || localT >= TRAVEL_MS) {
          marker.style.opacity = "0";
          return;
        }
        const progress = localT / TRAVEL_MS;
        const point = path.getPointAtLength(progress * len);
        const ahead = path.getPointAtLength(Math.min(len, (progress + 0.02) * len));
        const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
        const fade = Math.min(1, Math.min(progress, 1 - progress) * 6);
        marker.style.opacity = `${fade}`;
        marker.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg)`;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [arrows, animated, reducedMotion]);

  const players = diagram.players ?? [];
  const cones = diagram.cones ?? [];
  const balls = diagram.balls ?? [];
  const teams = useMemo(() => Array.from(new Set(players.map((p) => p.team))), [players]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#B98955] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
      <style>{`
        @keyframes vc-in { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes vc-ball { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.2) rotate(12deg); } }
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        <defs>
          {Object.entries(ARROW_COLORS).map(([type, color]) => (
            <marker key={type} id={`vc-arrowhead-${type}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth={4.2} markerHeight={4.2} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
          ))}
          <filter id="vc-token-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.7" floodColor="#000000" floodOpacity="0.35" />
          </filter>
          {(teams.length ? teams : ["A", "B", "N"]).map((team) => {
            const g = TEAM_GRADIENT[team] ?? TEAM_GRADIENT.N;
            return (
              <radialGradient key={team} id={`vc-grad-${team}`} cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor={g.light} />
                <stop offset="100%" stopColor={g.dark} />
              </radialGradient>
            );
          })}
          <linearGradient id="vc-wood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E3B77D" />
            <stop offset="55%" stopColor="#D6A667" />
            <stop offset="100%" stopColor="#C6935A" />
          </linearGradient>
          <pattern id="vc-planks" width="14" height={H} patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2={H} stroke="#00000012" strokeWidth="0.6" />
          </pattern>
          <radialGradient id="vc-vignette" cx="50%" cy="50%" r="72%">
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={W} height={H} fill="url(#vc-wood)" />
        <rect x={0} y={0} width={W} height={H} fill="url(#vc-planks)" />
        <rect x={0} y={0} width={W} height={H} fill="url(#vc-vignette)" />
        <CourtMarkings />

        {cones.map((c, i) => {
          const x = pct(c.x, W);
          const y = pct(c.y, H);
          return (
            <g key={`c-${i}`} filter="url(#vc-token-shadow)">
              <polygon points={`${x},${y - 3.4} ${x - 2.6},${y + 2.2} ${x + 2.6},${y + 2.2}`} fill="#F97316" stroke="#7C2D12" strokeWidth={0.5} />
              <rect x={x - 2.6} y={y + 1.4} width={5.2} height={0.9} fill="#EA580C" stroke="#7C2D12" strokeWidth={0.3} />
            </g>
          );
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
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeDasharray="3.4 3"
            markerEnd={`url(#vc-arrowhead-${a.type})`}
            opacity={0.95}
          />
        ))}

        {!reducedMotion &&
          animated &&
          arrows.map((a, i) => (
            <g
              key={`m-${i}`}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              style={{ opacity: 0 }}
            >
              <circle r={3.4} fill={a.color} opacity={0.3} />
              <path d="M -3.2 -2.4 L 4 0 L -3.2 2.4 Z" fill={a.color} stroke="#0B1220" strokeWidth={0.4} strokeLinejoin="round" />
            </g>
          ))}

        {players.map((p, i) => (
          <PlayerToken key={`p-${i}`} p={p} index={i} reducedMotion={reducedMotion || !animated} />
        ))}

        {balls.map((b, i) => {
          const x = pct(b.x, W);
          const y = pct(b.y, H);
          return (
            <g
              key={`b-${i}`}
              filter="url(#vc-token-shadow)"
              style={reducedMotion || !animated ? undefined : { transformBox: "fill-box", transformOrigin: "center", animation: "vc-ball 1.1s ease-in-out infinite" }}
            >
              <circle cx={x} cy={y} r={3.1} fill="#FDFCF7" stroke="#1E293B" strokeWidth={0.5} />
              <path d={`M ${x - 2.2} ${y - 0.6} Q ${x} ${y - 2.4} ${x + 2.2} ${y - 0.6}`} fill="none" stroke="#1E293B" strokeWidth={0.4} />
              <path d={`M ${x - 2.2} ${y + 0.6} Q ${x} ${y + 2.4} ${x + 2.2} ${y + 0.6}`} fill="none" stroke="#1E293B" strokeWidth={0.4} />
              <line x1={x - 2.9} y1={y} x2={x + 2.9} y2={y} stroke="#1E293B" strokeWidth={0.35} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
