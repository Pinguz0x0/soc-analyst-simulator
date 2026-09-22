import { useCallback, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './screens/HomeScreen';
import { ScenarioScreen } from './screens/ScenarioScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { scenarioById } from './data/scenarios';
import type { RunOutcome } from './engine/engine';
import { rankFor } from './engine/scoring';
import type { RankState } from './engine/scoring';
import {
  clearProgress,
  emptyProgress,
  isStorageAvailable,
  loadProgress,
  mergeResult,
  saveProgress,
} from './engine/storage';
import type { Progress } from './engine/storage';

/**
 * Three views, no router: the app is a single static page and GitHub Pages
 * serves it from a sub-path, so hash/history routing would only add friction.
 */
type View =
  | { name: 'home' }
  | { name: 'scenario'; scenarioId: string; runKey: number }
  | { name: 'summary'; scenarioId: string; outcome: RunOutcome; rankBefore: RankState };

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [view, setView] = useState<View>({ name: 'home' });
  const storageOk = useMemo(() => isStorageAvailable(), []);

  const start = useCallback((scenarioId: string) => {
    setView({ name: 'scenario', scenarioId, runKey: Date.now() });
  }, []);

  const goHome = useCallback(() => setView({ name: 'home' }), []);

  const finish = useCallback(
    (scenarioId: string, outcome: RunOutcome) => {
      const rankBefore = rankFor(progress);
      const updated = mergeResult(progress, outcome.result);
      setProgress(updated);
      saveProgress(updated);
      setView({ name: 'summary', scenarioId, outcome, rankBefore });
    },
    [progress],
  );

  const reset = useCallback(() => {
    clearProgress();
    setProgress(emptyProgress);
  }, []);

  const scenario = view.name === 'home' ? undefined : scenarioById(view.scenarioId);

  return (
    <div className="min-h-screen">
      <Header onHome={goHome} canGoHome={view.name !== 'home'} />

      {view.name === 'home' || !scenario ? (
        <HomeScreen
          progress={progress}
          storageOk={storageOk}
          onStart={start}
          onReset={reset}
        />
      ) : view.name === 'scenario' ? (
        <ScenarioScreen
          key={view.runKey}
          scenario={scenario}
          onExit={goHome}
          onFinish={(outcome) => finish(scenario.id, outcome)}
        />
      ) : (
        <SummaryScreen
          scenario={scenario}
          outcome={view.outcome}
          rankBefore={view.rankBefore}
          rankAfter={rankFor(progress)}
          onReplay={() => start(scenario.id)}
          onHome={goHome}
          onNext={start}
        />
      )}

      <footer className="border-t border-line py-6 text-center">
        <p className="font-mono text-[11px] text-dim">
          SOC Analyst Simulator · MIT ·{' '}
          <a
            href="https://attack.mitre.org/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-dotted underline-offset-2 hover:text-neon"
          >
            MITRE ATT&amp;CK®
          </a>
        </p>
      </footer>
    </div>
  );
}
