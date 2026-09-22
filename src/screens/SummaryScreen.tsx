import { useState } from 'react';
import type { Scenario } from '../types/scenario';
import type { RunOutcome } from '../engine/engine';
import type { RankState } from '../engine/scoring';
import { gradeFor } from '../engine/scoring';
import { nextScenario } from '../data/scenarios';
import { badge } from '../data/badges';
import { useI18n } from '../i18n/I18nProvider';
import type { UiKey } from '../i18n/strings';
import { BadgeChip } from '../components/BadgeChip';
import { RankBadge } from '../components/RankBadge';

type Props = {
  scenario: Scenario;
  outcome: RunOutcome;
  rankBefore: RankState;
  rankAfter: RankState;
  onReplay: () => void;
  onHome: () => void;
  onNext: (scenarioId: string) => void;
};

const GRADE_TONE = {
  ok: 'border-ok/50 bg-ok/10 text-ok',
  warn: 'border-sev-medium/50 bg-sev-medium/10 text-sev-medium',
  bad: 'border-bad/50 bg-bad/10 text-bad',
} as const;

export function SummaryScreen({
  scenario,
  outcome,
  rankBefore,
  rankAfter,
  onReplay,
  onHome,
  onNext,
}: Props) {
  const { t, tr } = useI18n();
  const [copied, setCopied] = useState(false);

  const { result, breakdown, accuracy } = outcome;
  const grade = gradeFor(result.pct);
  const following = nextScenario(scenario.id);
  const promoted = rankAfter.index > rankBefore.index;

  async function share() {
    const lines = [
      `SOC Analyst Simulator — ${tr(scenario.title)} (${scenario.code})`,
      `${t('score.points')}: ${result.points}/${result.maxPoints} (${result.pct}%) · ${grade.letter} ${tr(grade.label)}`,
      `${t('score.accuracy')}: ${accuracy}% · ${t('score.confidence')}: ${result.confidence}%`,
      `${t('score.rank')}: ${tr(rankAfter.rank.name)}`,
      result.badges.length
        ? `${t('score.badges')}: ${result.badges
            .map((id) => {
              const def = badge(id);
              return def ? tr(def.name) : id;
            })
            .join(' · ')}`
        : '',
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do, the recap is on screen */
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6">
      <p className="label-xs">{t('result.subtitle')}</p>
      <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">{t('result.title')}</h1>
      <p className="mt-1 text-[13px] text-muted">
        {scenario.code} — {tr(scenario.title)}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-[180px_1fr]">
        <div
          className={`flex flex-col items-center justify-center rounded-lg border p-5 ${GRADE_TONE[grade.tone]}`}
        >
          <span className="font-mono text-5xl font-bold leading-none">{grade.letter}</span>
          <span className="mt-2 text-[13px] font-semibold">{tr(grade.label)}</span>
          <span className="mt-0.5 font-mono text-[12px] opacity-80">{result.pct}%</span>
        </div>

        <div className="panel p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="label-xs">{t('score.points')}</dt>
              <dd className="font-mono text-lg text-neon">
                {result.points}
                <span className="text-[13px] text-dim"> / {result.maxPoints}</span>
              </dd>
            </div>
            <div>
              <dt className="label-xs">{t('score.accuracy')}</dt>
              <dd className="font-mono text-lg text-ink">{accuracy}%</dd>
            </div>
            <div>
              <dt className="label-xs">{t('score.confidence')}</dt>
              <dd className="font-mono text-lg text-ink">{result.confidence}%</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-line pt-3">
            {promoted ? (
              <p className="mb-2 inline-flex items-center gap-2 rounded border border-neon/50 bg-neon/10 px-2 py-1 text-[12px] font-semibold text-neon-soft">
                ★ {t('result.rankup')}
              </p>
            ) : null}
            <RankBadge rank={rankAfter.rank} />
          </div>
        </div>
      </div>

      <section className="panel mt-4">
        <div className="panel-head">{t('result.breakdown')}</div>
        <ul className="space-y-2.5 p-4">
          {breakdown.map(({ phase, earned, max }) => {
            const ratio = max > 0 ? Math.round((earned / max) * 100) : 0;
            return (
              <li key={phase.id}>
                <div className="mb-1 flex items-baseline justify-between text-[12px]">
                  <span className="text-slate-300">
                    <span className="mr-2 font-mono text-[11px] text-dim">
                      {t(`phase.kind.${phase.kind}` as UiKey)}
                    </span>
                    {tr(phase.title)}
                  </span>
                  <span className="font-mono text-muted">
                    {earned}/{max}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-panel2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      ratio >= 75 ? 'bg-ok' : ratio >= 40 ? 'bg-sev-medium' : 'bg-sev-critical'
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel mt-4">
        <div className="panel-head">{t('result.newbadges')}</div>
        <div className="p-4">
          {result.badges.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {result.badges.map((id) => (
                <BadgeChip key={id} id={id} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted">{t('result.nobadge')}</p>
          )}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        {following ? (
          <button type="button" className="btn-primary" onClick={() => onNext(following.id)}>
            {t('result.next')} — {tr(following.title)} →
          </button>
        ) : null}
        <button type="button" className="btn-ghost" onClick={onReplay}>
          ↻ {t('result.replay')}
        </button>
        <button type="button" className="btn-ghost" onClick={share}>
          {copied ? `✓ ${t('debrief.copied')}` : t('result.share')}
        </button>
        <button type="button" className="btn-ghost" onClick={onHome}>
          {t('result.home')}
        </button>
      </div>
    </div>
  );
}
