"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import en, { type TranslationKey } from "./en";
import ko from "./ko";

export type Locale = "en" | "ko";

const translations: Record<Locale, Record<TranslationKey, string>> = { en, ko };

const LOCALE_KEY = "aihandler_locale";

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "en" || stored === "ko") return stored;
  } catch {}
  const browserLang = navigator.language?.toLowerCase() || "";
  if (browserLang.startsWith("ko")) return "ko";
  return "en";
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let text = translations[locale]?.[key] || translations.en[key] || key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return text;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  if (!mounted) return null;

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

// Helper: get tone keys in the current locale
export function getToneOptions(locale: Locale) {
  const t = translations[locale] || translations.en;
  return [
    { value: "상관없음", label: t["tone.any"] },
    { value: "전문적인", label: t["tone.professional"] },
    { value: "친근한", label: t["tone.friendly"] },
    { value: "분석적인", label: t["tone.analytical"] },
    { value: "창의적인", label: t["tone.creative"] },
    { value: "직설적인", label: t["tone.direct"] },
  ];
}

export function getLengthOptions(locale: Locale) {
  const t = translations[locale] || translations.en;
  return [
    { value: "상관없음", label: t["length.any"] },
    { value: "짧게 (1문단)", label: t["length.short"] },
    { value: "중간 (2~3문단)", label: t["length.medium"] },
    { value: "길게 (상세하게)", label: t["length.long"] },
  ];
}

export function getCategoryLabel(locale: Locale, cat: string): string {
  const t = translations[locale] || translations.en;
  const map: Record<string, TranslationKey> = {
    "전체": "cat.all",
    "텍스트/LLM": "cat.textLLM",
    "이미지": "cat.image",
    "비디오": "cat.video",
    "오디오/음악": "cat.audio",
    "생산성/코딩": "cat.productivity",
  };
  const key = map[cat];
  return key ? t[key] : cat;
}

export { type TranslationKey };
