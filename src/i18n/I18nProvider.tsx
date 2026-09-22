import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { I18n, Lang } from '../types/scenario';
import { detectLang, loadLang, saveLang } from '../engine/storage';
import { ui } from './strings';
import type { UiKey } from './strings';

type I18nContextValue = {
  lang: Lang;
  other: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  /** UI chrome strings, with `{name}` interpolation. */
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Scenario content: picks the right side of an I18n object. */
  tr: (value: I18n) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang(detectLang()));

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    saveLang(next);
  }, []);

  const toggle = useCallback(() => {
    setLangState((current) => {
      const next: Lang = current === 'fr' ? 'en' : 'fr';
      saveLang(next);
      return next;
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      other: lang === 'fr' ? 'en' : 'fr',
      setLang,
      toggle,
      t: (key, vars) => interpolate(ui[key][lang], vars),
      tr: (content) => content[lang],
    }),
    [lang, setLang, toggle],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
