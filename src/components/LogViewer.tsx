import type { LogEntry, Severity } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';
import { SeverityBadge } from './SeverityBadge';

/**
 * Renders normalised events the way a SIEM would: monospace, key/value,
 * with the fields an analyst reads first picked out by colour.
 */

const ACCENT: Record<Severity, string> = {
  critical: 'border-l-sev-critical',
  high: 'border-l-sev-high',
  medium: 'border-l-sev-medium',
  low: 'border-l-sev-low',
  info: 'border-l-line2',
};

/** Field colouring is driven by the key name, so scenario data stays plain. */
function valueClass(key: string): string {
  const k = key.toLowerCase();
  if (/(user|account|member|subject|recipient|sender|identity|jdupont|svc|admin)/.test(k)) {
    return 'text-sev-medium';
  }
  if (/(host|computer|workstation|server|share|channel|group)/.test(k)) return 'text-ok';
  if (/(image|process|command|commandline|decoded|task|entry|path|file|target|args)/.test(k)) {
    return 'text-iris';
  }
  if (/(ip|address|url|domain|destination|source(ip)?|port|dest)/.test(k)) return 'text-sev-high';
  if (/(hash|sha256|md5|fingerprint|guid|sid)/.test(k)) return 'text-slate-400';
  if (/(eventid|event_id|rule|logontype|grantedaccess|status|action)/.test(k)) return 'text-neon-soft';
  return 'text-slate-300';
}

export function LogViewer({ logs, dense = false }: { logs: LogEntry[]; dense?: boolean }) {
  const { tr } = useI18n();

  return (
    <div className="space-y-2">
      {logs.map((entry) => (
        <article
          key={entry.id}
          className={`overflow-hidden rounded-md border border-line border-l-2 bg-[#080d16]/90 ${
            ACCENT[entry.severity ?? 'info']
          }`}
        >
          <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line/70 px-3 py-1.5">
            <time className="font-mono text-[11px] text-neon-soft">{entry.ts}</time>
            <span className="font-mono text-[11px] text-muted">{entry.source}</span>
            {entry.eventId ? (
              <span className="chip !text-[10px]">EID {entry.eventId}</span>
            ) : null}
            {entry.host ? <span className="chip !text-[10px]">{entry.host}</span> : null}
            {entry.severity ? (
              <SeverityBadge severity={entry.severity} className="ml-auto" />
            ) : null}
          </header>

          <dl className={`grid gap-x-3 px-3 ${dense ? 'py-1.5' : 'py-2'}`}>
            {entry.fields.map((field) => (
              <div
                key={field.key}
                className="flex flex-col gap-x-2 py-[2px] sm:flex-row sm:items-baseline"
              >
                <dt className="shrink-0 font-mono text-[11px] text-dim sm:w-[168px]">
                  {field.key}
                </dt>
                <dd
                  className={`break-all font-mono text-[12px] leading-relaxed ${valueClass(field.key)}`}
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>

          {entry.note ? (
            <p className="border-t border-line/70 bg-panel2/40 px-3 py-2 text-[12px] leading-relaxed text-muted">
              <span aria-hidden="true" className="mr-1.5 text-neon">
                ▸
              </span>
              {tr(entry.note)}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
