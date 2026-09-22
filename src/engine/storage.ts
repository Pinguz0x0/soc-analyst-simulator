import type { Lang } from '../types/scenario';

/**
 * localStorage is a bonus, never a dependency: every access is guarded so the
 * game still runs in private windows or with site data blocked.
 */

const PROGRESS_KEY = 'soc-sim:progress:v1';
const LANG_KEY = 'soc-sim:lang:v1';

export type ScenarioResult = {
  scenarioId: string;
  points: number;
  maxPoints: number;
  /** 0-100, rounded. */
  pct: number;
  confidence: number;
  badges: string[];
  completedAt: number;
};

export type Progress = {
  version: 1;
  results: Record<string, ScenarioResult>;
  badges: string[];
};

export const emptyProgress: Progress = { version: 1, results: {}, badges: [] };

let storageWarned = false;

function storage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__soc_sim_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    if (!storageWarned) {
      storageWarned = true;
      // Not an error: the app degrades to a memory-only session.
      console.info('[soc-sim] localStorage unavailable — progress will not persist.');
    }
    return null;
  }
}

export function isStorageAvailable(): boolean {
  return storage() !== null;
}

export function loadProgress(): Progress {
  const s = storage();
  if (!s) return emptyProgress;
  try {
    const raw = s.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (!parsed || parsed.version !== 1 || typeof parsed.results !== 'object') {
      return emptyProgress;
    }
    return {
      version: 1,
      results: parsed.results ?? {},
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: Progress): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* quota or blocked storage: ignore, the run still works in memory */
  }
}

/** Merges a finished run into the saved progress, keeping the best score. */
export function mergeResult(progress: Progress, result: ScenarioResult): Progress {
  const previous = progress.results[result.scenarioId];
  const best = !previous || result.points > previous.points ? result : previous;
  const badges = Array.from(new Set([...progress.badges, ...result.badges]));
  return {
    version: 1,
    results: { ...progress.results, [result.scenarioId]: best },
    badges,
  };
}

export function clearProgress(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

export function loadLang(fallback: Lang): Lang {
  const s = storage();
  if (!s) return fallback;
  try {
    const value = s.getItem(LANG_KEY);
    return value === 'fr' || value === 'en' ? value : fallback;
  } catch {
    return fallback;
  }
}

export function saveLang(lang: Lang): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

/** First visit: follow the browser, default to French. */
export function detectLang(): Lang {
  try {
    const nav = navigator.language || '';
    return nav.toLowerCase().startsWith('en') ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}
