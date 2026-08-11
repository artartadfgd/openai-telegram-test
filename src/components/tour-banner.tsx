"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useTour } from "@/lib/tour-context";
import { useTranslation } from "@/lib/i18n/context";

const DISMISS_KEY = "coachai-tour-banner-dismissed";

export function TourBanner() {
  const { t } = useTranslation();
  const { start } = useTour();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 animate-fade-in">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{t.tour.bannerTitle}</p>
        <p className="text-xs text-muted-foreground">{t.tour.bannerDesc}</p>
      </div>
      <button
        type="button"
        onClick={start}
        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
      >
        {t.tour.start}
      </button>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
