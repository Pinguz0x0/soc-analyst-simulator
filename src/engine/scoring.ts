import type { I18n } from '../types/scenario';
import type { Progress } from './storage';

export type Grade = {
  letter: string;
  label: I18n;
  tone: 'ok' | 'warn' | 'bad';
};

export function gradeFor(pct: number): Grade {
  if (pct >= 90) {
    return { letter: 'S', label: { fr: 'Exemplaire', en: 'Exemplary' }, tone: 'ok' };
  }
  if (pct >= 75) {
    return { letter: 'A', label: { fr: 'Solide', en: 'Solid' }, tone: 'ok' };
  }
  if (pct >= 60) {
    return { letter: 'B', label: { fr: 'Correct', en: 'Decent' }, tone: 'ok' };
  }
  if (pct >= 40) {
    return { letter: 'C', label: { fr: 'Fragile', en: 'Shaky' }, tone: 'warn' };
  }
  return { letter: 'D', label: { fr: 'À reprendre', en: 'Needs a rerun' }, tone: 'bad' };
}

export type Rank = {
  id: string;
  name: I18n;
  blurb: I18n;
  icon: string;
  /** Completed scenarios required. */
  minLevels: number;
  /** Average score (%) required across completed scenarios. */
  minAvg: number;
};

export const RANKS: Rank[] = [
  {
    id: 'trainee',
    name: { fr: 'Recrue SOC', en: 'SOC Trainee' },
    blurb: {
      fr: "Vous venez de badger. Le casque est encore sur la table.",
      en: 'You just badged in. The headset is still on the desk.',
    },
    icon: '◇',
    minLevels: 0,
    minAvg: 0,
  },
  {
    id: 'l1',
    name: { fr: 'Analyste SOC L1', en: 'SOC Analyst L1' },
    blurb: {
      fr: "Vous triez la file d'alertes et vous savez quand escalader.",
      en: 'You work the alert queue and know when to escalate.',
    },
    icon: '◈',
    minLevels: 1,
    minAvg: 50,
  },
  {
    id: 'l2',
    name: { fr: 'Analyste SOC L2', en: 'SOC Analyst L2' },
    blurb: {
      fr: 'Vous corrélez plusieurs sources et vous menez une investigation complète.',
      en: 'You correlate multiple sources and run an investigation end to end.',
    },
    icon: '◆',
    minLevels: 2,
    minAvg: 60,
  },
  {
    id: 'ir',
    name: { fr: 'Incident Responder', en: 'Incident Responder' },
    blurb: {
      fr: "Vous pilotez l'endiguement, la preuve et le retour à la normale.",
      en: 'You drive containment, evidence handling and recovery.',
    },
    icon: '❖',
    minLevels: 3,
    minAvg: 75,
  },
];

export type RankState = {
  rank: Rank;
  index: number;
  next: Rank | null;
  completed: number;
  avg: number;
};

export function rankFor(progress: Progress): RankState {
  const results = Object.values(progress.results);
  const completed = results.length;
  const avg =
    completed === 0
      ? 0
      : Math.round(results.reduce((sum, r) => sum + r.pct, 0) / completed);

  let index = 0;
  RANKS.forEach((rank, i) => {
    if (completed >= rank.minLevels && avg >= rank.minAvg) index = i;
  });

  return {
    rank: RANKS[index],
    index,
    next: index < RANKS.length - 1 ? RANKS[index + 1] : null,
    completed,
    avg,
  };
}

export function pctOf(points: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((points / max) * 100)));
}
