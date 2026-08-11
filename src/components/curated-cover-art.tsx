export function CuratedCoverArt({ from, to, seed = 0 }: { from: string; to: string; seed?: number }) {
  const uid = `cc-${Math.abs(seed)}`;
  const tilt = (seed % 5) - 2; // small deterministic rotation per card for variety

  return (
    <svg viewBox="0 0 320 128" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="80%" cy="10%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-ball`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
        <pattern id={`${uid}-mesh`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform={`rotate(${tilt})`}>
          <path d="M0 16 L16 0" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="320" height="128" fill={`url(#${uid}-bg)`} />
      <rect width="320" height="128" fill={`url(#${uid}-mesh)`} />
      <rect width="320" height="128" fill={`url(#${uid}-glow)`} />

      {/* net line motif across the lower third */}
      <line x1="-10" y1="98" x2="330" y2="88" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" />
      <line x1="-10" y1="103" x2="330" y2="93" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="6" />

      {/* motion swoosh behind the ball */}
      <path d="M 150 70 Q 200 30 250 46" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 9" />

      {/* volleyball */}
      <g transform="translate(252 44)">
        <circle r="19" fill={`url(#${uid}-ball)`} />
        <circle r="19" fill="none" stroke="#00000022" strokeWidth="1" />
        <path d="M -13 -8 Q 0 -16 13 -8" fill="none" stroke={to} strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M -13 8 Q 0 16 13 8" fill="none" stroke={to} strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M -15 0 Q 0 -6 15 0 Q 0 6 -15 0" fill="none" stroke={to} strokeOpacity="0.55" strokeWidth="1.6" />
      </g>
    </svg>
  );
}
