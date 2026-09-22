import type { Phase, Pivot, Question, Scenario, TimelineEvent } from '../types/scenario';
import type { ScenarioResult } from './storage';

/**
 * Scenario engine: a pure reducer plus a handful of pure helpers.
 * No component ever computes a score itself.
 */

export const CONFIDENCE_START = 55;
const CONFIDENCE_MIN = 5;
const CONFIDENCE_MAX = 100;

export type AnswerStatus = 'correct' | 'partial' | 'wrong';

export type AnswerRecord = {
  questionId: string;
  selected: string[];
  status: AnswerStatus;
  points: number;
  maxPoints: number;
  /** Badges unlocked by this answer, surfaced in the feedback panel. */
  badges: string[];
};

export type TimelineRecord = {
  order: string[];
  correctCount: number;
  total: number;
  points: number;
  maxPoints: number;
};

export type RunState = {
  scenarioId: string;
  phaseIndex: number;
  answers: Record<string, AnswerRecord>;
  openedPivots: string[];
  timelines: Record<string, TimelineRecord>;
  points: number;
  confidence: number;
  badges: string[];
  finished: boolean;
};

export type RunAction =
  | { type: 'answer'; question: Question; selected: string[] }
  | { type: 'pivot'; pivot: Pivot }
  | { type: 'timeline'; phaseId: string; events: TimelineEvent[]; order: string[]; points: number }
  | { type: 'next'; totalPhases: number }
  | { type: 'finish'; maxPoints: number; perfectBadge?: string }
  | { type: 'reset'; scenarioId: string };

export function initRun(scenarioId: string): RunState {
  return {
    scenarioId,
    phaseIndex: 0,
    answers: {},
    openedPivots: [],
    timelines: {},
    points: 0,
    confidence: CONFIDENCE_START,
    badges: [],
    finished: false,
  };
}

function clampConfidence(value: number): number {
  return Math.min(CONFIDENCE_MAX, Math.max(CONFIDENCE_MIN, Math.round(value)));
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

/**
 * Multi-answer questions get partial credit at half rate, and a wrong pick
 * cancels a right one — picking everything must never pay off.
 */
export function gradeAnswer(
  question: Question,
  selected: string[],
): { status: AnswerStatus; points: number } {
  const correct = new Set(question.correct);
  const hits = selected.filter((id) => correct.has(id)).length;
  const misses = selected.filter((id) => !correct.has(id)).length;

  if (hits === correct.size && misses === 0) {
    return { status: 'correct', points: question.points };
  }
  const ratio = Math.max(0, (hits - misses) / correct.size);
  if (ratio <= 0) return { status: 'wrong', points: 0 };
  return { status: 'partial', points: Math.round(question.points * ratio * 0.5) };
}

export function badgesFromAnswer(question: Question, selected: string[]): string[] {
  const correct = new Set(question.correct);
  return question.options
    .filter((o) => o.awardsBadge && selected.includes(o.id) && correct.has(o.id))
    .map((o) => o.awardsBadge as string);
}

export function gradeTimeline(events: TimelineEvent[], order: string[], points: number) {
  const total = events.length;
  const correctCount = order.filter((id, index) => events[index] && events[index].id === id).length;
  const ratio = total === 0 ? 0 : correctCount / total;
  return {
    correctCount,
    total,
    points: Math.round(points * ratio),
    maxPoints: points,
    ratio,
  };
}

export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'answer': {
      const { question, selected } = action;
      if (state.answers[question.id]) return state; // answers are final
      const { status, points } = gradeAnswer(question, selected);
      const badges = badgesFromAnswer(question, selected);
      const delta = status === 'correct' ? 6 : status === 'partial' ? 1 : -9;
      return {
        ...state,
        answers: {
          ...state.answers,
          [question.id]: {
            questionId: question.id,
            selected,
            status,
            points,
            maxPoints: question.points,
            badges,
          },
        },
        points: state.points + points,
        confidence: clampConfidence(state.confidence + delta),
        badges: uniq([...state.badges, ...badges]),
      };
    }

    case 'pivot': {
      const { pivot } = action;
      if (state.openedPivots.includes(pivot.id)) return state;
      const gained = pivot.relevant ? pivot.points : 0;
      const delta = pivot.relevant ? 2 : -6;
      const badges = pivot.relevant && pivot.awardsBadge ? [pivot.awardsBadge] : [];
      return {
        ...state,
        openedPivots: [...state.openedPivots, pivot.id],
        points: state.points + gained,
        confidence: clampConfidence(state.confidence + delta),
        badges: uniq([...state.badges, ...badges]),
      };
    }

    case 'timeline': {
      if (state.timelines[action.phaseId]) return state;
      const graded = gradeTimeline(action.events, action.order, action.points);
      const delta = Math.round((graded.ratio - 0.6) * 20);
      return {
        ...state,
        timelines: {
          ...state.timelines,
          [action.phaseId]: {
            order: action.order,
            correctCount: graded.correctCount,
            total: graded.total,
            points: graded.points,
            maxPoints: graded.maxPoints,
          },
        },
        points: state.points + graded.points,
        confidence: clampConfidence(state.confidence + delta),
      };
    }

    case 'next':
      return {
        ...state,
        phaseIndex: Math.min(state.phaseIndex + 1, action.totalPhases - 1),
      };

    case 'finish': {
      const perfect = action.perfectBadge && state.points >= action.maxPoints;
      return {
        ...state,
        finished: true,
        badges: perfect ? uniq([...state.badges, action.perfectBadge as string]) : state.badges,
      };
    }

    case 'reset':
      return initRun(action.scenarioId);

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export function phaseMaxPoints(phase: Phase): number {
  switch (phase.kind) {
    case 'alert':
    case 'decision':
      return phase.questions.reduce((sum, q) => sum + q.points, 0);
    case 'investigation':
      return (
        phase.pivots.filter((p) => p.relevant).reduce((sum, p) => sum + p.points, 0) +
        (phase.question ? phase.question.points : 0)
      );
    case 'mitre':
      return phase.question.points;
    case 'timeline':
      return phase.points;
    default:
      return 0;
  }
}

export function maxPointsFor(scenario: Scenario): number {
  return scenario.phases.reduce((sum, phase) => sum + phaseMaxPoints(phase), 0);
}

export function phaseEarnedPoints(phase: Phase, state: RunState): number {
  switch (phase.kind) {
    case 'alert':
    case 'decision':
      return phase.questions.reduce((sum, q) => sum + (state.answers[q.id]?.points ?? 0), 0);
    case 'investigation': {
      const pivots = phase.pivots
        .filter((p) => p.relevant && state.openedPivots.includes(p.id))
        .reduce((sum, p) => sum + p.points, 0);
      const question = phase.question ? (state.answers[phase.question.id]?.points ?? 0) : 0;
      return pivots + question;
    }
    case 'mitre':
      return state.answers[phase.question.id]?.points ?? 0;
    case 'timeline':
      return state.timelines[phase.id]?.points ?? 0;
    default:
      return 0;
  }
}

export function isPhaseComplete(phase: Phase, state: RunState): boolean {
  switch (phase.kind) {
    case 'alert':
    case 'decision':
      return phase.questions.every((q) => Boolean(state.answers[q.id]));
    case 'investigation': {
      const relevantOpened = phase.pivots.filter(
        (p) => p.relevant && state.openedPivots.includes(p.id),
      ).length;
      const questionDone = phase.question ? Boolean(state.answers[phase.question.id]) : true;
      return relevantOpened >= phase.minPivots && questionDone;
    }
    case 'mitre':
      return Boolean(state.answers[phase.question.id]);
    case 'timeline':
      return Boolean(state.timelines[phase.id]);
    default:
      return true;
  }
}

export type PhaseBreakdown = {
  phase: Phase;
  earned: number;
  max: number;
};

export function breakdownFor(scenario: Scenario, state: RunState): PhaseBreakdown[] {
  return scenario.phases
    .filter((phase) => phaseMaxPoints(phase) > 0)
    .map((phase) => ({
      phase,
      earned: phaseEarnedPoints(phase, state),
      max: phaseMaxPoints(phase),
    }));
}

/** Share of answered questions that were fully correct. */
export function accuracyFor(state: RunState): number {
  const records = Object.values(state.answers);
  if (records.length === 0) return 0;
  const correct = records.filter((r) => r.status === 'correct').length;
  return Math.round((correct / records.length) * 100);
}

/** Everything the result screen needs once a scenario is closed. */
export type RunOutcome = {
  result: ScenarioResult;
  breakdown: PhaseBreakdown[];
  accuracy: number;
};
