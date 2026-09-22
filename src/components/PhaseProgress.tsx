import type { Phase } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';
import type { UiKey } from '../i18n/strings';

export function PhaseProgress({ phases, index }: { phases: Phase[]; index: number }) {
  const { t } = useI18n();

  return (
    <nav aria-label={t('phase.progress', { n: index + 1, total: phases.length })}>
      <ol className="flex flex-wrap items-center gap-1">
        {phases.map((phase, i) => {
          const state = i === index ? 'current' : i < index ? 'done' : 'todo';
          return (
            <li key={phase.id} className="flex items-center gap-1">
              <span
                aria-current={state === 'current' ? 'step' : undefined}
                className={`rounded border px-2 py-1 text-[11px] font-medium transition-colors ${
                  state === 'current'
                    ? 'border-neon/60 bg-neon/15 text-neon-soft'
                    : state === 'done'
                      ? 'border-ok/40 bg-ok/10 text-ok'
                      : 'border-line bg-panel2/40 text-dim'
                }`}
              >
                <span aria-hidden="true" className="mr-1 font-mono">
                  {state === 'done' ? '✓' : i + 1}
                </span>
                {t(`phase.kind.${phase.kind}` as UiKey)}
              </span>
              {i < phases.length - 1 ? (
                <span aria-hidden="true" className="text-[10px] text-line2">
                  —
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
