import type { I18n, Scenario, Tactic } from '../types/scenario';
import { level1 } from './level1-malspam';
import { level2 } from './level2-log4shell';
import { level3 } from './level3-ghost-account';

/** Ordered by difficulty: the engine plays whichever scenario it is handed. */
export const SCENARIOS: Scenario[] = [level1, level2, level3];

export function scenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

export function nextScenario(id: string): Scenario | undefined {
  const index = SCENARIOS.findIndex((scenario) => scenario.id === id);
  return index >= 0 ? SCENARIOS[index + 1] : undefined;
}

/** ATT&CK tactic columns, in the order the matrix displays them. */
export const TACTIC_ORDER: Tactic[] = [
  'reconnaissance',
  'initial-access',
  'execution',
  'persistence',
  'privilege-escalation',
  'defense-evasion',
  'credential-access',
  'discovery',
  'lateral-movement',
  'collection',
  'command-and-control',
  'exfiltration',
  'impact',
];

export const TACTIC_LABELS: Record<Tactic, I18n> = {
  reconnaissance: { fr: 'Reconnaissance', en: 'Reconnaissance' },
  'initial-access': { fr: 'Accès initial', en: 'Initial Access' },
  execution: { fr: 'Exécution', en: 'Execution' },
  persistence: { fr: 'Persistance', en: 'Persistence' },
  'privilege-escalation': { fr: 'Élévation de privilèges', en: 'Privilege Escalation' },
  'defense-evasion': { fr: 'Évasion défensive', en: 'Defense Evasion' },
  'credential-access': { fr: "Accès aux identifiants", en: 'Credential Access' },
  discovery: { fr: 'Découverte', en: 'Discovery' },
  'lateral-movement': { fr: 'Mouvement latéral', en: 'Lateral Movement' },
  collection: { fr: 'Collecte', en: 'Collection' },
  'command-and-control': { fr: 'Commande et contrôle', en: 'Command and Control' },
  exfiltration: { fr: 'Exfiltration', en: 'Exfiltration' },
  impact: { fr: 'Impact', en: 'Impact' },
};
