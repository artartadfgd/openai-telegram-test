"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALES, dictionaries, type Locale, type Dictionary } from "./dictionary";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dict: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  try {
    const stored = localStorage.getItem("coachai-locale");
    if (stored && (LOCALES as readonly string[]).includes(stored)) return stored as Locale;
  } catch {}
  const nav = window.navigator.language?.slice(0, 2).toLowerCase();
  if (nav && (LOCALES as readonly string[]).includes(nav)) return nav as Locale;
  return "pt";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("coachai-locale", l);
    } catch {}
  }, []);

  return <LanguageContext.Provider value={{ locale, setLocale, dict: dictionaries[locale] }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation() {
  const { dict, locale, setLocale } = useLanguage();
  return { t: dict, locale, setLocale };
}
