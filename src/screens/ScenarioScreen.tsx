import { useEffect, useMemo, useReducer, useState } from 'react';
import type { Phase, Question, Scenario } from '../types/scenario';
import {
  accuracyFor,
  breakdownFor,
  initRun,
  isPhaseComplete,
  maxPointsFor,
  runReducer,
} from '../engine/engine';
import type { RunOutcome } from '../engine/engine';
import { pctOf } from '../engine/scoring';
import { useI18n } from '../i18n/I18nProvider';
import type { UiKey } from '../i18n/strings';
import { AlertCard } from '../components/AlertCard';
import { BriefingPanel } from '../components/BriefingPanel';
import { Debrief } from '../components/Debrief';
import { DecisionPanel } from '../components/DecisionPanel';
import { InvestigationBoard } from '../components/InvestigationBoard';
import { MitreMatrix } from '../components/MitreMatrix';
import { PhaseProgress } from '../components/PhaseProgress';
import { QuestionCard } from '../components/QuestionCard';
import { ScorePanel } from '../components/ScorePanel';
import { TimelineBuilder } from '../components/TimelineBuilder';

type Props = {
  scenario: Scenario;
  onExit: () => void;
  onFinish: (outcome: RunOutcome) => void;
};

export function ScenarioScreen({ scenario, onExit, onFinish }: Props) {
  const { t, tr } = useI18n();
  const [state, dispatch] = useReducer(runReducer, scenario.id, initRun);
  const [mitrePicks, setMitrePicks] = useState<string[]>([]);

  const maxPoints = useMemo(() => maxPointsFor(scenario), [scenario]);
  const phase: Phase = scenario.phases[state.phaseIndex];
  const isLast = state.phaseIndex === scenario.phases.length - 1;
  const canContinue = isPhaseComplete(phase, state);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.phaseIndex]);

  useEffect(() => {
    if (!state.finished) return;
    onFinish({
      result: {
        scenarioId: scenario.id,
        points: state.points,
        maxPoints,
        pct: pctOf(state.points, maxPoints),
        confidence: state.confidence,
        badges: state.badges,
        completedAt: Date.now(),
      },
      breakdown: breakdownFor(scenario, state),
      accuracy: accuracyFor(state),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finished]);

  function answer(question: Question, selected: string[]) {
    dispatch({ type: 'answer', question, selected });
  }

  function goNext() {
    if (isLast) {
      dispatch({ type: 'finish', maxPoints, perfectBadge: scenario.perfectBadge });
      return;
    }
    dispatch({ type: 'next', totalPhases: scenario.phases.length });
  }

  function quit() {
    if (window.confirm(t('phase.quit.confirm'))) onExit();
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-mono text-[11px] text-dim">
            <span className="text-neon">{scenario.code}</span>
            <span>·</span>
            <span>{tr(scenario.role)}</span>
          </p>
          <h1 className="mt-0.5 text-xl font-semibold text-ink sm:text-2xl">
            {tr(scenario.title)}
          </h1>
        </div>
        <button type="button" onClick={quit} className="btn-ghost shrink-0 !py-1.5 !text-[12px]">
          ← {t('phase.quit')}
        </button>
      </div>

      <div className="mb-5 overflow-x-auto pb-1">
        <PhaseProgress phases={scenario.phases} index={state.phaseIndex} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <main className="min-w-0 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-neon-soft">{tr(phase.title)}</h2>
            <span className="font-mono text-[11px] text-dim">
              {t('phase.progress', {
                n: state.phaseIndex + 1,
                total: scenario.phases.length,
              })}
            </span>
          </div>

          {phase.kind === 'briefing' ? <BriefingPanel scenario={scenario} phase={phase} /> : null}

          {phase.kind === 'alert' ? (
            <>
              <AlertCard alert={phase.alert} />
              {phase.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  answer={state.answers[question.id]}
                  index={index + 1}
                  total={phase.questions.length}
                  onSubmit={(selected) => answer(question, selected)}
                />
              ))}
            </>
          ) : null}

          {phase.kind === 'investigation' ? (
            <>
              <InvestigationBoard
                phase={phase}
                opened={state.openedPivots}
                badges={state.badges}
                onOpen={(pivot) => dispatch({ type: 'pivot', pivot })}
              />
              {phase.question ? (
                <QuestionCard
                  question={phase.question}
                  answer={state.answers[phase.question.id]}
                  onSubmit={(selected) =>
                    phase.question ? answer(phase.question, selected) : undefined
                  }
                />
              ) : null}
            </>
          ) : null}

          {phase.kind === 'mitre' ? (
            <>
              <section className="panel border-l-2 border-l-iris p-4">
                <p className="text-[13px] leading-relaxed text-slate-300">{tr(phase.intro)}</p>
              </section>
              <MitreMatrix
                techniques={phase.techniques}
                selected={state.answers[phase.question.id]?.selected ?? mitrePicks}
                revealed={Boolean(state.answers[phase.question.id])}
              />
              <QuestionCard
                question={phase.question}
                answer={state.answers[phase.question.id]}
                onChange={setMitrePicks}
                onSubmit={(selected) => answer(phase.question, selected)}
              />
            </>
          ) : null}

          {phase.kind === 'timeline' ? (
            <TimelineBuilder
              phase={phase}
              record={state.timelines[phase.id]}
              onSubmit={(order) =>
                dispatch({
                  type: 'timeline',
                  phaseId: phase.id,
                  events: phase.events,
                  order,
                  points: phase.points,
                })
              }
            />
          ) : null}

          {phase.kind === 'decision' ? (
            <DecisionPanel phase={phase} answers={state.answers} onAnswer={answer} />
          ) : null}

          {phase.kind === 'debrief' ? <Debrief phase={phase} /> : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <button
              type="button"
              className="btn-primary"
              onClick={goNext}
              disabled={!canContinue}
            >
              {isLast ? t('phase.finish') : t('phase.next')} →
            </button>
            {!canContinue ? (
              <p className="text-[12px] text-muted" role="status">
                {t('phase.locked')}
              </p>
            ) : null}
          </div>
        </main>

        <div className="space-y-4 lg:sticky lg:top-[68px] lg:self-start">
          <ScorePanel
            points={state.points}
            max={maxPoints}
            confidence={state.confidence}
            badges={state.badges}
          />

          <aside className="panel hidden p-4 lg:block">
            <p className="label-xs mb-2">{t('home.loop.title')}</p>
            <ol className="space-y-1">
              {scenario.phases.map((item, index) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-[12px] ${
                    index === state.phaseIndex
                      ? 'bg-neon/10 text-neon-soft'
                      : index < state.phaseIndex
                        ? 'text-muted'
                        : 'text-dim'
                  }`}
                >
                  <span aria-hidden="true" className="font-mono text-[10px]">
                    {index < state.phaseIndex ? '✓' : index === state.phaseIndex ? '▸' : '·'}
                  </span>
                  {t(`phase.kind.${item.kind}` as UiKey)}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </div>
  );
}
