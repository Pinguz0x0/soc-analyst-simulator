import type { I18n } from '../types/scenario';

/**
 * UI chrome strings. Scenario content lives in `src/data` as I18n objects,
 * so this dictionary stays small and never mixes with the security content.
 */
export const ui = {
  'app.title': { fr: 'SOC Analyst Simulator', en: 'SOC Analyst Simulator' },
  'app.tagline': {
    fr: 'Trois incidents réels. Une console. Votre jugement.',
    en: 'Three real incidents. One console. Your judgement.',
  },
  'app.status': { fr: 'SIEM connecté', en: 'SIEM connected' },

  'lang.switch': { fr: 'Switch to English', en: 'Passer en français' },
  'lang.current': { fr: 'Langue : français', en: 'Language: English' },

  'home.hero.eyebrow': {
    fr: 'Simulation de centre opérationnel de sécurité',
    en: 'Security operations centre simulation',
  },
  'home.hero.title': {
    fr: "Prenez le poste d'analyste SOC.",
    en: 'Take the SOC analyst seat.',
  },
  'home.hero.subtitle': {
    fr: "Triez l'alerte, pivotez dans les logs, mappez sur MITRE ATT&CK, reconstruisez la kill chain et décidez de l'endiguement — sur trois incidents inspirés de cas réels.",
    en: 'Triage the alert, pivot through the logs, map to MITRE ATT&CK, rebuild the kill chain and choose your containment — across three incidents drawn from real cases.',
  },
  'home.hero.cta': { fr: 'Commencer le niveau 1', en: 'Start level 1' },
  'home.levels': { fr: 'Les investigations', en: 'The investigations' },
  'home.loop.title': { fr: 'Le cycle de réponse à incident', en: 'The incident response loop' },
  'home.loop.subtitle': {
    fr: 'Chaque niveau se joue en sept phases, comme en vrai.',
    en: 'Every level runs through seven phases, the way it really works.',
  },
  'home.progress': { fr: 'Progression', en: 'Progress' },
  'home.reset': { fr: 'Réinitialiser la progression', en: 'Reset progress' },
  'home.reset.confirm': {
    fr: 'Effacer scores, badges et rang enregistrés dans ce navigateur ?',
    en: 'Erase scores, badges and rank stored in this browser?',
  },
  'home.storage.off': {
    fr: 'Stockage local indisponible : la progression ne sera pas conservée.',
    en: 'Local storage unavailable: progress will not be saved.',
  },
  'home.disclaimer': {
    fr: "Contenu pédagogique. Les noms d'hôtes, comptes et adresses IP sont fictifs ; les techniques, les journaux et les raisonnements sont réalistes.",
    en: 'Educational content. Hostnames, accounts and IP addresses are fictional; the techniques, logs and reasoning are realistic.',
  },

  'level.duration': { fr: '~{min} min', en: '~{min} min' },
  'level.role': { fr: 'Rôle', en: 'Role' },
  'level.start': { fr: "Ouvrir l'investigation", en: 'Open the investigation' },
  'level.replay': { fr: 'Rejouer', en: 'Replay' },
  'level.best': { fr: 'Meilleur score', en: 'Best score' },
  'level.realcase': { fr: 'Cas réel', en: 'Real case' },

  'phase.progress': { fr: 'Phase {n}/{total}', en: 'Phase {n}/{total}' },
  'phase.next': { fr: 'Phase suivante', en: 'Next phase' },
  'phase.validate': { fr: 'Valider', en: 'Submit' },
  'phase.quit': { fr: "Quitter l'investigation", en: 'Leave investigation' },
  'phase.quit.confirm': {
    fr: 'Quitter ? La progression de ce niveau sera perdue.',
    en: 'Leave? Progress on this level will be lost.',
  },
  'phase.finish': { fr: "Clôturer l'incident", en: 'Close the incident' },
  'phase.locked': {
    fr: 'Répondez aux questions de cette phase pour continuer.',
    en: 'Answer this phase to continue.',
  },
  'phase.kind.briefing': { fr: 'Briefing', en: 'Briefing' },
  'phase.kind.alert': { fr: 'Triage', en: 'Triage' },
  'phase.kind.investigation': { fr: 'Investigation', en: 'Investigation' },
  'phase.kind.mitre': { fr: 'ATT&CK', en: 'ATT&CK' },
  'phase.kind.timeline': { fr: 'Timeline', en: 'Timeline' },
  'phase.kind.decision': { fr: 'Endiguement', en: 'Containment' },
  'phase.kind.debrief': { fr: 'Débrief', en: 'Debrief' },

  'briefing.objectives': { fr: 'Objectifs de la mission', en: 'Mission objectives' },
  'briefing.environment': { fr: 'Environnement', en: 'Environment' },
  'briefing.assets': { fr: 'Actifs', en: 'Assets' },
  'briefing.telemetry': { fr: 'Télémétrie disponible', en: 'Available telemetry' },
  'briefing.realcase': { fr: 'Le cas réel derrière ce niveau', en: 'The real case behind this level' },
  'briefing.references': { fr: 'Sources', en: 'Sources' },
  'briefing.newtab': { fr: 'nouvel onglet', en: 'new tab' },

  'alert.queue': { fr: "File d'alertes", en: 'Alert queue' },
  'alert.rule': { fr: 'Règle', en: 'Rule' },
  'alert.raw': { fr: 'Événement brut', en: 'Raw event' },

  'sev.critical': { fr: 'CRITIQUE', en: 'CRITICAL' },
  'sev.high': { fr: 'ÉLEVÉE', en: 'HIGH' },
  'sev.medium': { fr: 'MOYENNE', en: 'MEDIUM' },
  'sev.low': { fr: 'FAIBLE', en: 'LOW' },
  'sev.info': { fr: 'INFO', en: 'INFO' },

  'inv.pivots': { fr: 'Pistes à creuser', en: 'Pivots to dig into' },
  'inv.open': { fr: 'Lancer la recherche', en: 'Run the search' },
  'inv.opened': { fr: 'Consultée', en: 'Reviewed' },
  'inv.progress': {
    fr: '{done}/{need} pistes utiles exploitées',
    en: '{done}/{need} useful pivots explored',
  },
  'inv.query': { fr: 'Requête SIEM', en: 'SIEM query' },
  'inv.finding': { fr: "Ce que l'analyste en retient", en: 'Analyst takeaway' },
  'inv.iocs': { fr: 'IOC extraits', en: 'Extracted IOCs' },
  'inv.results': { fr: 'Résultats', en: 'Results' },
  'inv.noise': { fr: 'Piste sans valeur pour cet incident', en: 'Dead end for this incident' },
  'inv.hintDone': {
    fr: 'Assez de matière : vous pouvez conclure la phase.',
    en: 'Enough material: you can close this phase.',
  },

  'mitre.matrix': {
    fr: 'Matrice ATT&CK — techniques candidates',
    en: 'ATT&CK matrix — candidate techniques',
  },
  'mitre.legend.observed': { fr: 'Étayé par les preuves', en: 'Backed by evidence' },
  'mitre.legend.decoy': { fr: 'Non étayé', en: 'Unsupported' },
  'mitre.legend.picked': { fr: 'Votre sélection', en: 'Your selection' },
  'mitre.evidence': { fr: 'Preuve', en: 'Evidence' },
  'mitre.doc': { fr: 'Fiche ATT&CK', en: 'ATT&CK page' },

  'timeline.help': {
    fr: 'Glissez-déposez les événements, ou utilisez les flèches, pour reconstituer la kill chain du plus ancien au plus récent.',
    en: 'Drag and drop the events, or use the arrows, to rebuild the kill chain from oldest to newest.',
  },
  'timeline.submit': { fr: 'Valider la chronologie', en: 'Submit the timeline' },
  'timeline.up': { fr: 'Monter', en: 'Move up' },
  'timeline.down': { fr: 'Descendre', en: 'Move down' },
  'timeline.result': {
    fr: '{ok}/{total} événements bien placés',
    en: '{ok}/{total} events correctly placed',
  },
  'timeline.solution': { fr: 'Chronologie réelle', en: 'Actual timeline' },
  'timeline.hidden': {
    fr: 'Horodatages masqués pendant le classement',
    en: 'Timestamps hidden while sorting',
  },

  'q.single': { fr: 'Une seule réponse', en: 'Single answer' },
  'q.multi': { fr: 'Plusieurs réponses attendues', en: 'Several answers expected' },
  'q.hint': { fr: 'Indice', en: 'Hint' },
  'q.points': { fr: '{n} pts', en: '{n} pts' },
  'q.yourAnswer': { fr: 'Votre réponse', en: 'Your answer' },
  'q.missed': { fr: 'Manqué', en: 'Missed' },

  'loop.briefing': {
    fr: "Le contexte du SI, la mission, et le cas réel derrière le niveau.",
    en: 'The environment, the mission, and the real case behind the level.',
  },
  'loop.triage': {
    fr: 'Évaluer la sévérité, vrai ou faux positif — sans conclure trop vite.',
    en: 'Assess severity, true or false positive — without concluding too early.',
  },
  'loop.investigation': {
    fr: 'Pivoter dans les logs : processus, comptes, authentifications, réseau.',
    en: 'Pivot through the logs: processes, accounts, authentications, network.',
  },
  'loop.mitre': {
    fr: "Traduire les preuves en techniques ATT&CK — et n'en inventer aucune.",
    en: 'Translate the evidence into ATT&CK techniques — and invent none.',
  },
  'loop.timeline': {
    fr: 'Reconstituer la kill chain, du premier accès à la détection.',
    en: 'Rebuild the kill chain, from first access to detection.',
  },
  'loop.containment': {
    fr: 'Endiguer sans détruire les preuves ni la production.',
    en: 'Contain without destroying the evidence or production.',
  },
  'loop.debrief': {
    fr: "Rapport d'incident, causes racines, plan de remédiation.",
    en: 'Incident report, root causes, remediation plan.',
  },

  'fb.correct': { fr: 'Bon raisonnement', en: 'Sound reasoning' },
  'fb.partial': { fr: 'Partiellement juste', en: 'Partly right' },
  'fb.wrong': { fr: 'Raisonnement à revoir', en: 'Rethink that one' },
  'fb.why': { fr: 'Pourquoi', en: 'Why' },
  'fb.earned': { fr: '+{n} pts', en: '+{n} pts' },
  'fb.badge': { fr: 'Badge débloqué', en: 'Badge unlocked' },

  'score.points': { fr: 'Points', en: 'Points' },
  'score.confidence': { fr: "Confiance de l'analyse", en: 'Analysis confidence' },
  'score.confidence.help': {
    fr: 'Monte quand vos conclusions sont étayées, descend quand vous partez sur une fausse piste.',
    en: 'Rises when your conclusions are evidenced, falls when you chase a dead end.',
  },
  'score.badges': { fr: 'Badges', en: 'Badges' },
  'score.rank': { fr: 'Rang', en: 'Rank' },
  'score.accuracy': { fr: 'Précision', en: 'Accuracy' },

  'debrief.facts': { fr: "Fiche d'incident", en: 'Incident fact sheet' },
  'debrief.lessons': { fr: 'Leçons clés', en: 'Key lessons' },
  'debrief.rootcause': { fr: 'Causes racines', en: 'Root causes' },
  'debrief.remediation': { fr: 'Plan de remédiation', en: 'Remediation plan' },
  'debrief.report': { fr: "Rapport d'incident", en: 'Incident report' },
  'debrief.copy': { fr: 'Copier le rapport', en: 'Copy the report' },
  'debrief.copied': { fr: 'Copié', en: 'Copied' },

  'result.title': { fr: 'Incident clôturé', en: 'Incident closed' },
  'result.subtitle': { fr: 'Revue de performance', en: 'Performance review' },
  'result.replay': { fr: 'Rejouer le niveau', en: 'Replay the level' },
  'result.next': { fr: 'Niveau suivant', en: 'Next level' },
  'result.home': { fr: 'Retour au tableau de bord', en: 'Back to the dashboard' },
  'result.share': { fr: 'Copier le récap', en: 'Copy the recap' },
  'result.breakdown': { fr: 'Détail par phase', en: 'Phase breakdown' },
  'result.newbadges': { fr: 'Badges obtenus', en: 'Badges earned' },
  'result.nobadge': { fr: 'Aucun badge sur cette partie.', en: 'No badge this run.' },
  'result.rankup': { fr: 'Promotion !', en: 'Promoted!' },

  'badges.title': { fr: 'Tableau de badges', en: 'Badge board' },
  'badges.locked': { fr: 'Non débloqué', en: 'Locked' },

} satisfies Record<string, I18n>;

export type UiKey = keyof typeof ui;
