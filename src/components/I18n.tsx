"use client";

/**
 * Language context and the control that changes it.
 *
 * The choice lives in React state and localStorage rather than in the URL. A
 * routed `/[locale]/…` layout is the better answer for a content site that wants
 * each translation indexed separately, and it is the wrong trade here: the
 * pages are four tools and one essay, the essay is English regardless, and
 * routing would multiply every path by nineteen to gain search visibility for
 * strings that are navigation labels.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  dirOf,
  negotiate,
  translate,
  type Key,
  type Locale,
} from "@/lib/i18n";

const STORAGE = "kernly.locale";

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: Key) => string;
}

const LangCtx = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => translate(DEFAULT_LOCALE, key),
});

export function useI18n() {
  return useContext(LangCtx);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // English on the first render, for the same reason the theme starts at
  // "system": the server cannot know the browser's preference, and a first
  // client render that disagrees with the server's markup is a hydration error.
  // The negotiated language is applied in an effect immediately afterwards.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let next: Locale | null = null;
    try {
      const stored = localStorage.getItem(STORAGE) as Locale | null;
      if (stored && LOCALES.some((l) => l.code === stored)) next = stored;
    } catch {
      /* storage unavailable */
    }
    // Only fall back to the browser's list when nothing was stored. A visitor
    // who picked English on a Spanish-configured machine meant it.
    if (!next) next = negotiate(navigator.languages ?? [navigator.language]);
    if (next !== DEFAULT_LOCALE) setLocaleState(next);
  }, []);

  // `lang` and `dir` live on <html>, which this component does not render, so
  // they are set imperatively. `dir` matters: Arabic is in the list, and a
  // right-to-left interface that is only right-to-left in its glyphs is worse
  // than an English one.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirOf(locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE, l);
    } catch {
      /* applies to this tab regardless */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale, t: (key: Key) => translate(locale, key) }),
    [locale, setLocale],
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

/**
 * A native <select>.
 *
 * Nineteen options is exactly the length at which a custom dropdown starts
 * costing more than it returns: it needs its own keyboard handling, its own
 * scroll containment and its own focus trap to match what the platform control
 * already does, and on a phone it replaces a well-tuned native picker with a
 * worse one. The styling here is a border and a caret over the real element.
 */
export function LanguagePicker() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t("ui.language")}</span>
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[var(--muted)]"
      >
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <ellipse cx="8" cy="8" rx="2.6" ry="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.1 6h11.8M2.1 10h11.8" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none rounded-md border border-[var(--line)] bg-transparent py-1.5 pl-7 pr-6 text-[13px] text-[var(--muted)] transition-colors hover:border-[var(--husk)] hover:text-[var(--fg)] focus:outline-none focus-visible:border-[var(--kernel)]"
      >
        {LOCALES.map((l) => (
          // The option label is the language's own name, never a flag. A flag is
          // a country and a language is not, and the mapping breaks on the first
          // Arabic, Spanish or Portuguese speaker who looks at it.
          <option key={l.code} value={l.code} className="bg-[var(--panel)] text-[var(--fg)]">
            {l.native}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="pointer-events-none absolute right-1.5 h-3 w-3 text-[var(--muted)]"
      >
        <path
          d="M4 6.5L8 10.5L12 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
}
