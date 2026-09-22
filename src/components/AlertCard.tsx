import type { AlertCard as AlertCardType } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';
import { SeverityBadge } from './SeverityBadge';

export function AlertCard({ alert }: { alert: AlertCardType }) {
  const { t, tr } = useI18n();

  return (
    <section
      className="panel overflow-hidden"
      aria-label={tr(alert.title)}
    >
      <div className="panel-head scanlines">
        <span className="h-1.5 w-1.5 rounded-full bg-sev-critical animate-pulseRing" aria-hidden="true" />
        {t('alert.queue')}
        <span className="ml-auto font-mono text-[11px] normal-case tracking-normal text-dim">
          {alert.id}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <time className="font-mono text-[11px] text-muted">{alert.ts}</time>
          <span className="chip">{alert.source}</span>
        </div>

        <h2 className="text-lg font-semibold leading-snug text-ink">{tr(alert.title)}</h2>

        {alert.rule ? (
          <p className="font-mono text-[11px] text-dim">
            <span className="label-xs mr-2">{t('alert.rule')}</span>
            <span className="text-iris">{alert.rule}</span>
          </p>
        ) : null}

        <dl className="grid gap-x-4 gap-y-1 rounded-md border border-line bg-[#080d16]/80 p-3 sm:grid-cols-2">
          {alert.fields.map((field) => (
            <div key={field.key} className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-dim">
                {field.key}
              </dt>
              <dd className="break-all font-mono text-[12px] text-slate-200">{field.value}</dd>
            </div>
          ))}
        </dl>

        {alert.raw ? (
          <div>
            <p className="label-xs mb-1">{t('alert.raw')}</p>
            <pre className="overflow-x-auto rounded-md border border-line bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-slate-400">
              <code>{alert.raw}</code>
            </pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}
