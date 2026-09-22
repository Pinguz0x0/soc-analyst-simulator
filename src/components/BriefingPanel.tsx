import type { BriefingPhase, Scenario } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';

export function BriefingPanel({ scenario, phase }: { scenario: Scenario; phase: BriefingPhase }) {
  const { t, tr } = useI18n();
  const paragraphs = tr(phase.content).split('\n\n');

  return (
    <div className="space-y-4">
      <section className="panel p-4 sm:p-5">
        <div className="prose-soc">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <h3 className="label-xs mb-2">{t('briefing.objectives')}</h3>
          <ul className="space-y-1.5">
            {phase.objectives.map((objective, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-300">
                <span aria-hidden="true" className="mt-[2px] font-mono text-neon">
                  ▸
                </span>
                {tr(objective)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">{t('briefing.environment')}</div>
        <div className="space-y-4 p-4">
          <p className="text-[13px] leading-relaxed text-slate-300">
            {tr(scenario.environment.summary)}
          </p>

          <div>
            <h3 className="label-xs mb-2">{t('briefing.assets')}</h3>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {scenario.environment.assets.map((asset) => (
                <li
                  key={asset.name}
                  className="flex flex-col rounded border border-line bg-panel2/50 px-2.5 py-1.5"
                >
                  <span className="font-mono text-[12px] text-neon-soft">{asset.name}</span>
                  <span className="text-[11px] leading-snug text-muted">{tr(asset.role)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label-xs mb-2">{t('briefing.telemetry')}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {scenario.environment.telemetry.map((item, i) => (
                <li key={i} className="chip">
                  {tr(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">{t('briefing.realcase')}</div>
        <div className="space-y-3 p-4">
          <h3 className="text-[14px] font-semibold text-ink">{tr(scenario.realCase.name)}</h3>
          <p className="text-[13px] leading-relaxed text-slate-300">
            {tr(scenario.realCase.summary)}
          </p>

          <div>
            <h4 className="label-xs mb-2">{t('briefing.references')}</h4>
            <ul className="space-y-1.5">
              {scenario.realCase.references.map((reference) => (
                <li key={reference.url}>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start gap-2 rounded px-1 py-0.5 text-[13px] text-slate-300 hover:text-neon-soft"
                  >
                    <span className="chip shrink-0 !text-[10px] group-hover:border-neon/50">
                      {reference.source}
                    </span>
                    <span className="underline decoration-dotted underline-offset-2">
                      {tr(reference.label)}
                    </span>
                    <span aria-hidden="true" className="text-dim group-hover:text-neon">
                      ↗
                    </span>
                    <span className="sr-only">({t('briefing.newtab')})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
