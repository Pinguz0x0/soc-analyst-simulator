import { badge } from '../data/badges';
import { useI18n } from '../i18n/I18nProvider';

export function BadgeChip({ id, locked = false }: { id: string; locked?: boolean }) {
  const { tr, t } = useI18n();
  const def = badge(id);
  if (!def) return null;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-md border px-2.5 py-2 transition-colors ${
        locked
          ? 'border-line bg-panel2/40 opacity-50'
          : 'border-neon/35 bg-neon/[0.07] hover:border-neon/60'
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-[1px] text-base leading-none ${locked ? 'text-dim' : 'text-neon'}`}
      >
        {locked ? '◌' : def.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-ink">{tr(def.name)}</span>
        <span className="block text-[11px] leading-snug text-muted">
          {locked ? t('badges.locked') : tr(def.description)}
        </span>
      </span>
    </div>
  );
}
