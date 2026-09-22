import { useI18n } from '../i18n/I18nProvider';
import { LanguageToggle } from './LanguageToggle';

export function Header({ onHome, canGoHome }: { onHome: () => void; canGoHome: boolean }) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-abyss/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          disabled={!canGoHome}
          className="group flex items-center gap-2.5 rounded-md px-1 py-1 text-left disabled:cursor-default"
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded border border-neon/50 bg-neon/10 font-mono text-[13px] font-bold text-neon"
          >
            &gt;_
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold text-ink group-hover:text-neon-soft">
              {t('app.title')}
            </span>
            <span className="hidden text-[11px] text-dim sm:block">{t('app.tagline')}</span>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-dim md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-blink" aria-hidden="true" />
            {t('app.status')}
          </span>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
