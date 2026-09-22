import type { MitreTechnique, Tactic } from '../types/scenario';
import { TACTIC_LABELS, TACTIC_ORDER } from '../data/scenarios';
import { useI18n } from '../i18n/I18nProvider';

type Props = {
  techniques: MitreTechnique[];
  /** Currently selected technique ids (live while answering). */
  selected: string[];
  /** Once answered, the matrix reveals which techniques were evidenced. */
  revealed: boolean;
};

/**
 * A miniature ATT&CK matrix: only the tactics present in the scenario get a
 * column, and every candidate technique gets a cell.
 */
export function MitreMatrix({ techniques, selected, revealed }: Props) {
  const { t, tr } = useI18n();

  const columns = TACTIC_ORDER.filter((tactic) =>
    techniques.some((technique) => technique.tactic === tactic),
  ).map((tactic: Tactic) => ({
    tactic,
    items: techniques.filter((technique) => technique.tactic === tactic),
  }));

  return (
    <section className="panel">
      <div className="panel-head">{t('mitre.matrix')}</div>

      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-neon bg-neon/25" />
          {t('mitre.legend.picked')}
        </span>
        {revealed ? (
          <>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-ok bg-ok/25" />
              {t('mitre.legend.observed')}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-bad bg-bad/20" />
              {t('mitre.legend.decoy')}
            </span>
          </>
        ) : null}
      </div>

      <div className="overflow-x-auto p-3">
        <div className="flex min-w-max gap-2">
          {columns.map(({ tactic, items }) => (
            <div key={tactic} className="w-[186px] shrink-0">
              <h3 className="mb-1.5 truncate border-b border-line pb-1 text-[10px] font-semibold uppercase tracking-wider text-dim">
                {tr(TACTIC_LABELS[tactic])}
              </h3>
              <ul className="space-y-1.5">
                {items.map((technique) => {
                  const picked = selected.includes(technique.id);
                  let tone = 'border-line bg-panel2/50 text-muted';
                  if (picked) tone = 'border-neon/70 bg-neon/15 text-neon-soft';
                  if (revealed && technique.observed) tone = 'border-ok/60 bg-ok/10 text-ok';
                  if (revealed && !technique.observed && picked) {
                    tone = 'border-bad/60 bg-bad/15 text-bad';
                  }
                  if (revealed && !technique.observed && !picked) {
                    tone = 'border-line bg-panel2/30 text-dim opacity-60';
                  }

                  return (
                    <li key={technique.id}>
                      <div className={`rounded border px-2 py-1.5 transition-colors ${tone}`}>
                        <p className="font-mono text-[11px] font-bold">{technique.id}</p>
                        <p className="text-[11px] leading-snug text-slate-300">
                          {tr(technique.name)}
                        </p>
                        {revealed && technique.observed && technique.evidence ? (
                          <p className="mt-1 border-t border-line/70 pt-1 text-[10px] leading-snug text-muted">
                            <span className="text-dim">{t('mitre.evidence')}: </span>
                            {tr(technique.evidence)}
                          </p>
                        ) : null}
                        {revealed ? (
                          <a
                            href={technique.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1 inline-block text-[10px] text-neon underline decoration-dotted underline-offset-2 hover:text-neon-soft"
                          >
                            {t('mitre.doc')} ↗
                          </a>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
