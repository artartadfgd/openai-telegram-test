import { cn } from "@/lib/utils";

export function Brandmark({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="8" fill="var(--primary)" />
        <circle cx="14" cy="14" r="8" fill="none" stroke="white" strokeWidth="1.6" />
        <path d="M14 6 C10 9 10 19 14 22" fill="none" stroke="white" strokeWidth="1.3" />
        <path d="M14 6 C18 9 18 19 14 22" fill="none" stroke="white" strokeWidth="1.3" />
        <path d="M6.5 14 H21.5" fill="none" stroke="white" strokeWidth="1.3" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">CoachAI</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Voleibol</span>
      </span>
    </div>
  );
}
