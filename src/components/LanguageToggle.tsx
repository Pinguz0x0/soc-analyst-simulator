import { useI18n } from '../i18n/I18nProvider';
import type { Lang } from '../types/scenario';

const LANGS: Lang[] = ['fr', 'en'];

/** Persistent FR/EN switch. The choice is stored in localStorage. */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('lang.current')}
      className="flex items-center gap-0.5 rounded-md border border-line bg-panel2/70 p-0.5"
    >
      {LANGS.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            title={active ? t('lang.current') : t('lang.switch')}
            className={`rounded px-2 py-1 font-mono text-[11px] font-bold tracking-wider transition-colors ${
              active ? 'bg-neon/20 text-neon-soft' : 'text-dim hover:text-ink'
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
