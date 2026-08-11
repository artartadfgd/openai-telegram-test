import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { CuratedCoverArt } from "@/components/curated-cover-art";
import type { CuratedTemplate } from "@/lib/volleyball";

function seedFromSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return h;
}

export function CuratedCard({ template, badge }: { template: CuratedTemplate; badge: string }) {
  return (
    <Link
      href={`/library/${template.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
    >
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <CuratedCoverArt from={template.coverFrom} to={template.coverTo} seed={seedFromSlug(template.slug)} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {template.category}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
          {badge}
        </span>
        <h3 className="absolute inset-x-2.5 bottom-2 line-clamp-2 text-sm font-bold leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          {template.title}
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs italic text-muted-foreground">&ldquo;{template.hook}&rdquo;</p>
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
