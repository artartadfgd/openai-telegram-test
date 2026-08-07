import { cn } from "@/lib/utils";

export function Brandmark({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="8" fill="var(--primary)" />
        <path
          d="M14 6 L20 9.5 V15.5 C20 19 17.5 21.3 14 22.5 C10.5 21.3 8 19 8 15.5 V9.5 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
        />
        <circle cx="14" cy="14" r="2.4" fill="white" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">CoachAI</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Football</span>
      </span>
    </div>
  );
}
