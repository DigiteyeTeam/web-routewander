"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations, type Locale, type TranslationKey } from "@/i18n/translations";

const STORAGE_KEY = "route-wander-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "th";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "th" || stored === "en") return stored;
  } catch {
    // ignore
  }
  return "th";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "th" || stored === "en") return stored;
      } catch {
        /* ignore */
      }
    }
    return "th";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next === "th" ? "th" : "en";
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === "th" ? "th" : "en";
  }, [locale, mounted]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? translations.th[key] ?? key;
    },
    [locale]
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
