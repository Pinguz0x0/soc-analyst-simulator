import { useState } from 'react';
import type { DebriefPhase } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';

export function Debrief({ phase }: { phase: DebriefPhase }) {
  const { t, tr } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(tr(phase.report));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the report stays selectable on screen */
    }
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4 sm:p-5">
        <p className="text-[14px] leading-relaxed text-slate-200">{tr(phase.summary)}</p>
      </section>

      <section className="panel">
        <div className="panel-head">{t('debrief.facts')}</div>
        <dl className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-2">
          {phase.facts.map((fact, i) => (
            <div key={i} className="border-b border-line/60 pb-2 last:border-0">
              <dt className="label-xs">{tr(fact.label)}</dt>
              <dd className="text-[13px] leading-snug text-slate-200">{tr(fact.value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <div className="panel-head">{t('debrief.lessons')}</div>
        <ol className="space-y-3 p-4">
          {phase.lessons.map((lesson, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid h-6 w-6 shrink-0 place-items-center rounded border border-neon/40 bg-neon/10 font-mono text-[11px] text-neon"
              >
                {i + 1}
              </span>
              <p className="text-[13px] leading-relaxed text-slate-300">{tr(lesson)}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel">
          <div className="panel-head">{t('debrief.rootcause')}</div>
          <ul className="space-y-2 p-4">
            {phase.rootCause.map((cause, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-300">
                <span aria-hidden="true" className="mt-[2px] text-sev-critical">
                  ✕
                </span>
                {tr(cause)}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">{t('debrief.remediation')}</div>
          <ul className="space-y-2 p-4">
            {phase.remediation.map((action, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-300">
                <span aria-hidden="true" className="mt-[2px] text-ok">
                  ✓
                </span>
                {tr(action)}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          {t('debrief.report')}
          <button
            type="button"
            onClick={copyReport}
            className="ml-auto rounded border border-line px-2 py-0.5 text-[10px] normal-case tracking-normal text-muted transition-colors hover:border-neon hover:text-neon"
          >
            {copied ? `✓ ${t('debrief.copied')}` : t('debrief.copy')}
          </button>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-relaxed text-slate-300">
          <code>{tr(phase.report)}</code>
        </pre>
      </section>
    </div>
  );
}
