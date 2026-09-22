import type { Severity } from '../types/scenario';
import { useI18n } from '../i18n/I18nProvider';
import type { UiKey } from '../i18n/strings';

const TONES: Record<Severity, string> = {
  critical: 'border-sev-critical/60 bg-sev-critical/15 text-sev-critical',
  high: 'border-sev-high/60 bg-sev-high/15 text-sev-high',
  medium: 'border-sev-medium/60 bg-sev-medium/15 text-sev-medium',
  low: 'border-sev-low/60 bg-sev-low/15 text-sev-low',
  info: 'border-sev-info/40 bg-sev-info/10 text-sev-info',
};

export function SeverityBadge({
  severity,
  className = '',
}: {
  severity: Severity;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-[2px] font-mono text-[10px] font-bold tracking-widest ${TONES[severity]} ${className}`}
    >
      {t(`sev.${severity}` as UiKey)}
    </span>
  );
}
