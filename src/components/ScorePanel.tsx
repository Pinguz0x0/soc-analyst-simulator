import { badge } from '../data/badges';
import { useI18n } from '../i18n/I18nProvider';

type Props = {
  points: number;
  max: number;
  confidence: number;
  badges: string[];
};

export function ScorePanel({ points, max, confidence, badges }: Props) {
  const { t, tr } = useI18n();
  const pct = max > 0 ? Math.round((points / max) * 100) : 0;

  const confTone =
    confidence >= 70 ? 'bg-ok' : confidence >= 40 ? 'bg-sev-medium' : 'bg-sev-critical';

  return (
    <aside className="panel p-4" aria-label={t('score.points')}>
      <div>
        <div className="flex items-baseline justify-between">
          <span className="label-xs">{t('score.points')}</span>
          <span className="font-mono text-[13px] text-ink">
            <span className="text-neon">{points}</span>
            <span className="text-dim"> / {max}</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel2">
          <div
            className="h-full rounded-full bg-neon transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="label-xs">{t('score.confidence')}</span>
          <span className="font-mono text-[13px] text-ink">{confidence}%</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel2"
          role="progressbar"
          aria-valuenow={confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('score.confidence')}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${confTone}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-dim">{t('score.confidence.help')}</p>
      </div>

      {badges.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="label-xs mb-2">{t('score.badges')}</p>
          <ul className="flex flex-wrap gap-1.5">
            {badges.map((id) => {
              const def = badge(id);
              if (!def) return null;
              return (
                <li
                  key={id}
                  title={`${tr(def.name)} — ${tr(def.description)}`}
                  className="grid h-7 w-7 place-items-center rounded border border-neon/40 bg-neon/10 text-[13px] text-neon"
                >
                  <span aria-hidden="true">{def.icon}</span>
                  <span className="sr-only">{tr(def.name)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
