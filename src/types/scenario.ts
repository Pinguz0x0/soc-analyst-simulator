/**
 * Data contract for the whole game.
 *
 * The engine is scenario-agnostic: it knows how to play any object that
 * satisfies `Scenario`. Adding a new level means adding a data file, never
 * touching a component.
 */

export type Lang = 'fr' | 'en';

/** Every player-visible string exists in both languages. */
export type I18n = { fr: string; en: string };

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type Tactic =
  | 'reconnaissance'
  | 'initial-access'
  | 'execution'
  | 'persistence'
  | 'privilege-escalation'
  | 'defense-evasion'
  | 'credential-access'
  | 'discovery'
  | 'lateral-movement'
  | 'collection'
  | 'command-and-control'
  | 'exfiltration'
  | 'impact';

export type Reference = {
  label: I18n;
  url: string;
  /** Publisher shown as a chip: MITRE ATT&CK, CISA, NVD... */
  source: string;
};

export type LogField = { key: string; value: string };

/** One normalised event as the SIEM would render it. */
export type LogEntry = {
  id: string;
  ts: string;
  /** Log source / sourcetype, e.g. "Sysmon", "Windows Security", "VPN". */
  source: string;
  eventId?: string;
  host?: string;
  severity?: Severity;
  fields: LogField[];
  /** Analyst annotation displayed under the raw event. */
  note?: I18n;
};

export type IocType =
  | 'ip'
  | 'domain'
  | 'url'
  | 'hash'
  | 'file'
  | 'account'
  | 'email'
  | 'task';

export type Ioc = { type: IocType; value: string; note?: I18n };

export type QuestionOption = {
  id: string;
  label: I18n;
  /** Shown when the player picks this option — where traps are explained. */
  feedback?: I18n;
  /** Badge unlocked when this option is part of a correct answer. */
  awardsBadge?: string;
};

export type Question = {
  id: string;
  prompt: I18n;
  hint?: I18n;
  options: QuestionOption[];
  /** Option ids. Length 1 = single choice unless `multi` is set. */
  correct: string[];
  multi?: boolean;
  /** Always explains the SOC reasoning, not just the verdict. */
  explanation: I18n;
  points: number;
};

/** A place the analyst can dig into. Wrong pivots cost confidence, not points. */
export type Pivot = {
  id: string;
  label: I18n;
  rationale: I18n;
  /** SIEM query displayed in monospace above the results. */
  query: string;
  relevant: boolean;
  points: number;
  logs: LogEntry[];
  finding: I18n;
  iocs?: Ioc[];
  awardsBadge?: string;
};

export type MitreTechnique = {
  /** ATT&CK id, e.g. "T1003.001". Doubles as the question option id. */
  id: string;
  name: I18n;
  tactic: Tactic;
  url: string;
  /** False = decoy technique that is *not* supported by the evidence. */
  observed: boolean;
  evidence?: I18n;
};

export type TimelineEvent = {
  id: string;
  time: string;
  label: I18n;
  detail?: I18n;
};

export type AlertCard = {
  id: string;
  ts: string;
  severity: Severity;
  title: I18n;
  source: string;
  rule?: string;
  fields: LogField[];
  raw?: string;
};

export type BriefingPhase = {
  kind: 'briefing';
  id: string;
  title: I18n;
  content: I18n;
  objectives: I18n[];
};

export type AlertPhase = {
  kind: 'alert';
  id: string;
  title: I18n;
  alert: AlertCard;
  questions: Question[];
};

export type InvestigationPhase = {
  kind: 'investigation';
  id: string;
  title: I18n;
  intro: I18n;
  pivots: Pivot[];
  /** Relevant pivots required before the phase can be closed. */
  minPivots: number;
  question?: Question;
};

export type MitrePhase = {
  kind: 'mitre';
  id: string;
  title: I18n;
  intro: I18n;
  techniques: MitreTechnique[];
  question: Question;
};

export type TimelinePhase = {
  kind: 'timeline';
  id: string;
  title: I18n;
  intro: I18n;
  /** Stored in the correct order; the UI shuffles them for the player. */
  events: TimelineEvent[];
  points: number;
};

export type DecisionPhase = {
  kind: 'decision';
  id: string;
  title: I18n;
  intro: I18n;
  questions: Question[];
};

export type DebriefPhase = {
  kind: 'debrief';
  id: string;
  title: I18n;
  summary: I18n;
  facts: { label: I18n; value: I18n }[];
  lessons: I18n[];
  rootCause: I18n[];
  remediation: I18n[];
  /** Incident report the player "files" at the end. */
  report: I18n;
};

export type Phase =
  | BriefingPhase
  | AlertPhase
  | InvestigationPhase
  | MitrePhase
  | TimelinePhase
  | DecisionPhase
  | DebriefPhase;

export type Asset = { name: string; role: I18n };

export type Scenario = {
  id: string;
  code: string;
  difficulty: 1 | 2 | 3;
  title: I18n;
  subtitle: I18n;
  /** Which seat the player takes: L1 triage, L2 investigation, IR lead. */
  role: I18n;
  durationMin: number;
  tags: string[];
  realCase: {
    name: I18n;
    summary: I18n;
    references: Reference[];
  };
  environment: {
    summary: I18n;
    assets: Asset[];
    telemetry: I18n[];
  };
  phases: Phase[];
  /** Badge granted for a flawless run. */
  perfectBadge?: string;
};

export type BadgeDef = {
  id: string;
  name: I18n;
  description: I18n;
  /** Single glyph rendered in the badge chip. */
  icon: string;
};
