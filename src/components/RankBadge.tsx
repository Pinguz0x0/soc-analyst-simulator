import type { Rank } from '../engine/scoring';
import { useI18n } from '../i18n/I18nProvider';

export function RankBadge({ rank, compact = false }: { rank: Rank; compact?: boolean }) {
  const { t, tr } = useI18n();

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-2.5 py-1">
        <span aria-hidden="true" className="text-neon">
          {rank.icon}
        </span>
        <span className="text-[12px] font-semibold text-neon-soft">{tr(rank.name)}</span>
      </span>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-neon/40 bg-neon/[0.07] p-3">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-neon/50 bg-abyss text-xl text-neon"
      >
        {rank.icon}
      </span>
      <div className="min-w-0">
        <p className="label-xs">{t('score.rank')}</p>
        <p className="text-[15px] font-semibold text-ink">{tr(rank.name)}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-muted">{tr(rank.blurb)}</p>
      </div>
    </div>
  );
}
