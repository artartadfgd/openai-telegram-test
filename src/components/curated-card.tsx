import Link from "next/link";
import { Clock, Sparkles, Users } from "lucide-react";
import type { CuratedTemplate } from "@/lib/volleyball";

export function CuratedCard({ template, badge }: { template: CuratedTemplate; badge: string }) {
  return (
    <Link
      href={`/library/${template.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
    >
      <div
        className="relative flex h-32 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${template.coverFrom}, ${template.coverTo})` }}
      >
        <Sparkles className="h-10 w-10 text-white/25 transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {template.category}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
          {badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs italic text-muted-foreground">&ldquo;{template.hook}&rdquo;</p>
        <h3 className="text-base font-semibold">{template.title}</h3>
        <p className="text-xs text-muted-foreground">{template.subtitle}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.totalDurationMin} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {template.playersCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
