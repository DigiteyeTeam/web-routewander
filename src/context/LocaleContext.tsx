"use client";

import {
  createContext,
  useCallback,
  useContext,
} from "react";
import { translations, type Locale, type TranslationKey } from "@/i18n/translations";

const FORCED_LOCALE: Locale = "en";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Temporarily force English across all pages.
  const locale: Locale = FORCED_LOCALE;
  const setLocale = useCallback((_next: Locale) => {
    // Language switch is intentionally disabled for now.
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[FORCED_LOCALE][key] ?? key;
    },
    []
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useTranslation() {
  const { t, locale, setLocale } = useLocale();
  return { t, locale, setLocale };
}
