import type { InvestigationPhase, Ioc, Pivot } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';
import { LogViewer } from './LogViewer';
import { BadgeChip } from './BadgeChip';

type Props = {
  phase: InvestigationPhase;
  opened: string[];
  onOpen: (pivot: Pivot) => void;
  /** Badges already unlocked in this run, to avoid announcing them twice. */
  badges: string[];
};

const IOC_TONE: Record<Ioc['type'], string> = {
  ip: 'text-sev-high',
  domain: 'text-sev-high',
  url: 'text-sev-high',
  hash: 'text-slate-400',
  file: 'text-iris',
  account: 'text-sev-medium',
  email: 'text-sev-medium',
  task: 'text-iris',
};

export function InvestigationBoard({ phase, opened, onOpen, badges }: Props) {
  const { t, tr } = useI18n();

  const usefulOpened = phase.pivots.filter(
    (pivot) => pivot.relevant && opened.includes(pivot.id),
  ).length;
  const done = Math.min(usefulOpened, phase.minPivots);
  const ratio = Math.round((done / phase.minPivots) * 100);

  return (
    <section className="space-y-4">
      <div className="panel p-4">
        <p className="text-[13px] leading-relaxed text-slate-300">{tr(phase.intro)}</p>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="label-xs">{t('inv.pivots')}</span>
            <span className="font-mono text-muted">
              {t('inv.progress', { done: usefulOpened, need: phase.minPivots })}
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-panel2"
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={phase.minPivots}
          >
            <div
              className="h-full rounded-full bg-neon transition-all duration-500"
              style={{ width: `${ratio}%` }}
            />
          </div>
          {usefulOpened >= phase.minPivots ? (
            <p className="mt-2 text-[12px] text-ok">{t('inv.hintDone')}</p>
          ) : null}
        </div>
      </div>

      <ul className="space-y-3">
        {phase.pivots.map((pivot) => {
          const isOpen = opened.includes(pivot.id);

          return (
            <li key={pivot.id} className="panel overflow-hidden">
              <div className="flex flex-wrap items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    <span aria-hidden="true" className="font-mono text-neon">
                      {isOpen ? '▾' : '▸'}
                    </span>
                    {tr(pivot.label)}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {tr(pivot.rationale)}
                  </p>
                </div>

                {isOpen ? (
                  <span className="chip shrink-0 !text-ok">✓ {t('inv.opened')}</span>
                ) : (
                  <button type="button" className="btn-ghost shrink-0" onClick={() => onOpen(pivot)}>
                    {t('inv.open')}
                  </button>
                )}
              </div>

              {isOpen ? (
                <div className="animate-fadeIn space-y-3 border-t border-line bg-abyss/40 p-4">
                  <div>
                    <p className="label-xs mb-1">{t('inv.query')}</p>
                    <pre className="overflow-x-auto rounded-md border border-line bg-black/50 px-3 py-2 font-mono text-[11px] text-neon-soft">
                      <code>{pivot.query}</code>
                    </pre>
                  </div>

                  <div>
                    <p className="label-xs mb-1.5">{t('inv.results')}</p>
                    <LogViewer logs={pivot.logs} />
                  </div>

                  <div
                    className={`rounded-md border p-3 ${
                      pivot.relevant
                        ? 'border-neon/35 bg-neon/[0.06]'
                        : 'border-line bg-panel2/50'
                    }`}
                  >
                    <p className="label-xs mb-1">
                      {pivot.relevant ? t('inv.finding') : t('inv.noise')}
                    </p>
                    <p className="text-[13px] leading-relaxed text-slate-300">
                      {tr(pivot.finding)}
                    </p>

                    {pivot.iocs && pivot.iocs.length > 0 ? (
                      <div className="mt-3">
                        <p className="label-xs mb-1.5">{t('inv.iocs')}</p>
                        <ul className="flex flex-wrap gap-1.5">
                          {pivot.iocs.map((ioc) => (
                            <li key={`${ioc.type}-${ioc.value}`} className="chip">
                              <span className="text-dim">{ioc.type}</span>
                              <span className={IOC_TONE[ioc.type]}>{ioc.value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  {pivot.awardsBadge && pivot.relevant && badges.includes(pivot.awardsBadge) ? (
                    <div>
                      <p className="label-xs mb-1.5">{t('fb.badge')}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <BadgeChip id={pivot.awardsBadge} />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
