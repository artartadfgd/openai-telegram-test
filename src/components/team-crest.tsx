import { cn } from "@/lib/utils";

export type CrestShape = "shield" | "circle" | "diamond" | "hex";

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CA";
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function shapePath(shape: CrestShape, size: number) {
  switch (shape) {
    case "circle":
      return `M ${size / 2} 3 A ${size / 2 - 3} ${size / 2 - 3} 0 1 0 ${size / 2 + 0.01} 3 Z`;
    case "diamond":
      return `M ${size / 2} 3 L ${size - 3} ${size / 2} L ${size / 2} ${size - 3} L 3 ${size / 2} Z`;
    case "hex":
      return `M ${size / 2} 3 L ${size - 3} ${size * 0.28} L ${size - 3} ${size * 0.72} L ${size / 2} ${size - 3} L 3 ${size * 0.72} L 3 ${size * 0.28} Z`;
    default:
      return `M ${size / 2} 3 L ${size - 3} ${size * 0.2} L ${size - 3} ${size * 0.55} Q ${size - 3} ${size - 3} ${size / 2} ${size - 3} Q 3 ${size - 3} 3 ${size * 0.55} L 3 ${size * 0.2} Z`;
  }
}

export function TeamCrest({
  name,
  shape = "shield",
  primaryColor = "#3B82F6",
  secondaryColor = "#0b0b0e",
  size = 56,
  className,
}: {
  name: string;
  shape?: CrestShape;
  primaryColor?: string;
  secondaryColor?: string;
  size?: number;
  className?: string;
}) {
  const initials = initialsFromName(name).slice(0, 3);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("shrink-0", className)} aria-hidden>
      <path d={shapePath(shape, size)} fill={primaryColor} stroke={secondaryColor} strokeWidth={size * 0.05} />
      <text
        x={size / 2}
        y={size / 2 + size * 0.03}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={secondaryColor}
        fontSize={size * (initials.length > 2 ? 0.34 : 0.42)}
        fontWeight={800}
        style={{ letterSpacing: "-0.02em", fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {initials}
      </text>
    </svg>
  );
}
