import type { Locale } from "@/lib/i18n/dictionary";
import type { CuratedTemplate } from "@/lib/volleyball";
import { ORIGINAL_TEMPLATES_BY_LOCALE } from "@/lib/library-content-originals";
import { buildFamilyTemplates } from "@/lib/library-content-families";

const CACHE = new Map<Locale, CuratedTemplate[]>();

export function getLibraryTemplates(locale: Locale): CuratedTemplate[] {
  const cached = CACHE.get(locale);
  if (cached) return cached;
  const templates = [...ORIGINAL_TEMPLATES_BY_LOCALE[locale], ...buildFamilyTemplates(locale)];
  CACHE.set(locale, templates);
  return templates;
}

export function getLibraryTemplate(locale: Locale, slug: string): CuratedTemplate | null {
  return getLibraryTemplates(locale).find((t) => t.slug === slug) ?? null;
}
