import type { Scenario } from '../types/scenario';
import type { Progress } from '../engine/storage';
import { maxPointsFor } from '../engine/engine';
import { gradeFor, rankFor } from '../engine/scoring';
import { SCENARIOS } from '../data/scenarios';
import { BADGE_ORDER } from '../data/badges';
import { useI18n } from '../i18n/I18nProvider';
import type { UiKey } from '../i18n/strings';
import { BadgeChip } from '../components/BadgeChip';
import { RankBadge } from '../components/RankBadge';

type Props = {
  progress: Progress;
  storageOk: boolean;
  onStart: (scenarioId: string) => void;
  onReset: () => void;
};

const LOOP_STEPS: UiKey[] = [
  'loop.briefing',
  'loop.triage',
  'loop.investigation',
  'loop.mitre',
  'loop.timeline',
  'loop.containment',
  'loop.debrief',
];

const LOOP_TITLES: UiKey[] = [
  'phase.kind.briefing',
  'phase.kind.alert',
  'phase.kind.investigation',
  'phase.kind.mitre',
  'phase.kind.timeline',
  'phase.kind.decision',
  'phase.kind.debrief',
];

function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-1.5 w-4 rounded-full ${
            step <= level
              ? level === 1
                ? 'bg-ok'
                : level === 2
                  ? 'bg-sev-medium'
                  : 'bg-sev-critical'
              : 'bg-line2'
          }`}
        />
      ))}
    </span>
  );
}

function LevelCard({
  scenario,
  progress,
  onStart,
}: {
  scenario: Scenario;
  progress: Progress;
  onStart: (id: string) => void;
}) {
  const { t, tr } = useI18n();
  const best = progress.results[scenario.id];
  const max = maxPointsFor(scenario);

  return (
    <article className="panel group flex flex-col overflow-hidden transition-colors hover:border-neon/40">
      <div className="panel-head">
        <span className="text-neon">{scenario.code}</span>
        <span className="ml-auto flex items-center gap-2 normal-case tracking-normal">
          <Difficulty level={scenario.difficulty} />
          <span className="font-mono text-[11px] text-dim">
            {t('level.duration', { min: scenario.durationMin })}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[16px] font-semibold text-ink">{tr(scenario.title)}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">{tr(scenario.subtitle)}</p>
        </div>

        <p className="flex items-start gap-2 text-[12px] text-slate-300">
          <span className="label-xs mt-[2px] shrink-0">{t('level.role')}</span>
          {tr(scenario.role)}
        </p>

        <p className="flex items-start gap-2 text-[12px] text-slate-300">
          <span className="label-xs mt-[2px] shrink-0">{t('level.realcase')}</span>
          {tr(scenario.realCase.name)}
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {scenario.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <button type="button" className="btn-primary" onClick={() => onStart(scenario.id)}>
            {best ? t('level.replay') : t('level.start')} →
          </button>
          {best ? (
            <span className="text-[12px] text-muted">
              <span className="label-xs mr-1.5">{t('level.best')}</span>
              <span className="font-mono text-neon-soft">
                {best.points}/{max}
              </span>
              <span className="ml-1.5 font-mono text-dim">
                {gradeFor(best.pct).letter}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function HomeScreen({ progress, storageOk, onStart, onReset }: Props) {
  const { t, tr } = useI18n();
  const rank = rankFor(progress);
  const completed = rank.completed;

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <p className="label-xs">{t('home.hero.eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {t('home.hero.title')}
          </h1>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-slate-300">
            {t('home.hero.subtitle')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => onStart(SCENARIOS[0].id)}
            >
              {t('home.hero.cta')} →
            </button>
            <a href="#levels" className="btn-ghost">
              {t('home.levels')}
            </a>
          </div>
        </div>

        <aside className="panel p-4">
          <RankBadge rank={rank.rank} />
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className="label-xs">{t('home.progress')}</dt>
              <dd className="font-mono text-lg text-ink">
                {completed}
                <span className="text-[13px] text-dim">/{SCENARIOS.length}</span>
              </dd>
            </div>
            <div>
              <dt className="label-xs">{t('score.accuracy')}</dt>
              <dd className="font-mono text-lg text-ink">{rank.avg}%</dd>
            </div>
          </dl>
          {rank.next ? (
            <p className="mt-3 border-t border-line pt-3 text-[11px] leading-snug text-dim">
              <span className="text-neon">{rank.next.icon}</span> {tr(rank.next.name)} —{' '}
              {rank.next.minLevels} × {rank.next.minAvg}%
            </p>
          ) : null}
        </aside>
      </section>

      <section id="levels" className="mt-10 scroll-mt-20">
        <h2 className="text-lg font-semibold text-ink">{t('home.levels')}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SCENARIOS.map((scenario) => (
            <LevelCard
              key={scenario.id}
              scenario={scenario}
              progress={progress}
              onStart={onStart}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">{t('home.loop.title')}</h2>
        <p className="mt-1 text-[13px] text-muted">{t('home.loop.subtitle')}</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP_STEPS.map((key, index) => (
            <li key={key} className="panel flex gap-3 p-3">
              <span
                aria-hidden="true"
                className="grid h-6 w-6 shrink-0 place-items-center rounded border border-neon/40 bg-neon/10 font-mono text-[11px] text-neon"
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink">
                  {t(LOOP_TITLES[index])}
                </span>
                <span className="block text-[12px] leading-snug text-muted">{t(key)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">{t('badges.title')}</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_ORDER.map((id) => (
            <BadgeChip key={id} id={id} locked={!progress.badges.includes(id)} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-line pt-5">
        {!storageOk ? (
          <p className="mb-3 rounded-md border border-sev-medium/40 bg-sev-medium/10 px-3 py-2 text-[12px] text-sev-medium">
            {t('home.storage.off')}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <p className="max-w-[70ch] flex-1 text-[11px] leading-relaxed text-dim">
            {t('home.disclaimer')}
          </p>
          {completed > 0 ? (
            <button
              type="button"
              className="btn-ghost !py-1.5 !text-[12px]"
              onClick={() => {
                if (window.confirm(t('home.reset.confirm'))) onReset();
              }}
            >
              {t('home.reset')}
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
