import type { BadgeDef } from '../types/scenario';

/**
 * Badges reward *reasoning*, not clicks: each one maps to a decision a real
 * analyst gets credit for (or blamed for missing) during a post-mortem.
 */
export const BADGES: Record<string, BadgeDef> = {
  /* ---- Level 1 ------------------------------------------------------ */
  'ioc-hunter': {
    id: 'ioc-hunter',
    icon: '◈',
    name: { fr: "Chasseur d'IOC", en: 'IOC hunter' },
    description: {
      fr: "A remonté la chaîne jusqu'aux indicateurs exploitables : expéditeur, hash, URL, C2.",
      en: 'Walked the chain back to actionable indicators: sender, hash, URL, C2.',
    },
  },
  'no-blind-trust': {
    id: 'no-blind-trust',
    icon: '◎',
    name: {
      fr: "Ne croit pas l'antivirus sur parole",
      en: 'Does not take the AV verdict on faith',
    },
    description: {
      fr: "« Quarantaine réussie » ne veut pas dire « rien ne s'est exécuté ». A vérifié ce qui a tourné avant la détection.",
      en: '"Quarantined" does not mean "nothing ran". Checked what executed before detection.',
    },
  },
  'scope-first': {
    id: 'scope-first',
    icon: '⌖',
    name: { fr: 'Pense périmètre', en: 'Thinks in scope' },
    description: {
      fr: "A cherché les autres destinataires avant de clore : une alerte sur un poste, c'est rarement un seul poste.",
      en: 'Looked for the other recipients before closing: one alert on one host is rarely one host.',
    },
  },

  /* ---- Level 2 ------------------------------------------------------ */
  'patch-not-mask': {
    id: 'patch-not-mask',
    icon: '⛭',
    name: { fr: 'Corrige, ne masque pas', en: 'Fixes, does not mask' },
    description: {
      fr: "A traité la vulnérabilité à la source au lieu de se contenter d'une règle WAF.",
      en: 'Treated the vulnerability at the source instead of settling for a WAF rule.',
    },
  },
  'cloud-creds': {
    id: 'cloud-creds',
    icon: '☁',
    name: { fr: 'A pensé aux secrets cloud', en: 'Remembered the cloud secrets' },
    description: {
      fr: "A vu l'appel au service de métadonnées et fait tourner les identifiants d'instance.",
      en: 'Spotted the instance metadata call and rotated the instance credentials.',
    },
  },
  'hunt-wide': {
    id: 'hunt-wide',
    icon: '⌗',
    name: { fr: 'Chasse sur tout le parc', en: 'Hunts across the estate' },
    description: {
      fr: "A transformé un IOC local en recherche rétroactive sur l'ensemble du SI.",
      en: 'Turned one local IOC into a retro-hunt across the whole estate.',
    },
  },

  /* ---- Level 3 ------------------------------------------------------ */
  'not-mimikatz': {
    id: 'not-mimikatz',
    icon: '⏸',
    name: {
      fr: 'Ne conclut pas à Mimikatz trop vite',
      en: 'Does not jump to Mimikatz',
    },
    description: {
      fr: "Un accès LSASS n'est pas un verdict : a qualifié processus, compte, hôte et heure avant de nommer l'outil.",
      en: 'One LSASS access is not a verdict: qualified process, account, host and time before naming the tool.',
    },
  },
  'ghost-account': {
    id: 'ghost-account',
    icon: '👻',
    name: { fr: 'A repéré le compte fantôme', en: 'Spotted the ghost account' },
    description: {
      fr: "A compris qu'un compte désactivé qui apparaît dans des journaux récents est une anomalie, pas un artefact.",
      en: 'Understood that a disabled account showing up in recent logs is an anomaly, not an artefact.',
    },
  },
  'volatile-evidence': {
    id: 'volatile-evidence',
    icon: '⏱',
    name: { fr: 'A préservé les preuves volatiles', en: 'Preserved volatile evidence' },
    description: {
      fr: 'A isolé au lieu d’éteindre : RAM, processus et connexions réseau sont restés exploitables.',
      en: 'Isolated instead of powering off: memory, processes and connections stayed usable.',
    },
  },
  'service-account-care': {
    id: 'service-account-care',
    icon: '⚙',
    name: { fr: 'Ne casse pas la production', en: 'Does not break production' },
    description: {
      fr: "A cartographié les dépendances du compte de service avant d'en changer le secret.",
      en: 'Mapped the service account dependencies before rotating its secret.',
    },
  },
  'siem-remembers': {
    id: 'siem-remembers',
    icon: '▤',
    name: { fr: 'Le SIEM a la mémoire longue', en: 'The SIEM has a long memory' },
    description: {
      fr: "A utilisé les journaux centralisés pour battre l'effacement des logs locaux.",
      en: 'Used centralised logs to beat the local log wiping.',
    },
  },
  'dwell-time': {
    id: 'dwell-time',
    icon: '◷',
    name: { fr: 'Remonte à la première heure', en: 'Goes back to hour zero' },
    description: {
      fr: "N'a pas pris l'alerte du matin pour le début de l'attaque : a daté le véritable premier accès.",
      en: 'Did not mistake the morning alert for the start of the attack: dated the real first access.',
    },
  },

  /* ---- Flawless runs ------------------------------------------------ */
  'perfect-l1': {
    id: 'perfect-l1',
    icon: '★',
    name: { fr: 'Sans faute — Niveau 1', en: 'Flawless — Level 1' },
    description: {
      fr: 'Score parfait sur la campagne de phishing.',
      en: 'Perfect score on the phishing campaign.',
    },
  },
  'perfect-l2': {
    id: 'perfect-l2',
    icon: '★',
    name: { fr: 'Sans faute — Niveau 2', en: 'Flawless — Level 2' },
    description: {
      fr: "Score parfait sur l'exploitation du serveur web.",
      en: 'Perfect score on the web server exploitation.',
    },
  },
  'perfect-l3': {
    id: 'perfect-l3',
    icon: '★',
    name: { fr: 'Sans faute — Niveau 3', en: 'Flawless — Level 3' },
    description: {
      fr: 'Score parfait sur la compromission de domaine.',
      en: 'Perfect score on the domain compromise.',
    },
  },
};

export const BADGE_ORDER: string[] = Object.keys(BADGES);

export function badge(id: string): BadgeDef | undefined {
  return BADGES[id];
}
