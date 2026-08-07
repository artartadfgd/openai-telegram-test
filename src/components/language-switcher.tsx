"use client";

import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size={compact ? "icon" : "sm"} className="gap-2" onClick={() => setOpen((o) => !o)}>
        <Languages className="h-4 w-4" />
        {!compact && <span className="text-sm">{locale.toUpperCase()}</span>}
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                locale === l && "text-primary"
              )}
            >
              <span>{LOCALE_LABELS[l]}</span>
              {locale === l && <span className="text-xs">•</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
