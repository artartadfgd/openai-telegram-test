"use client";

import { useEffect, useState } from "react";
import { Check, Globe } from "lucide-react";
import { Brandmark } from "@/components/brandmark";
import { useLanguage } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

const FLAG: Record<Locale, string> = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  it: "🇮🇹",
  de: "🇩🇪",
};

const STORAGE_KEY = "coachai-locale-chosen";

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useLanguage();
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    let alreadyChosen = false;
    try {
      alreadyChosen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    setChosen(alreadyChosen);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!chosen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Brandmark />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Language / Idioma</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLocale(l);
                    try {
                      localStorage.setItem(STORAGE_KEY, "1");
                    } catch {}
                    setChosen(true);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border border-input px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:bg-accent",
                    locale === l && "border-primary text-primary"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{FLAG[l]}</span>
                    {LOCALE_LABELS[l]}
                  </span>
                  {locale === l && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
