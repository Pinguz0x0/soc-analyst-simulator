/**
 * Content tests for the scenario data — run with `npm run validate`.
 *
 * TypeScript guarantees the *shape* of a scenario; it cannot tell that a
 * question declares a correct answer that is not one of its options, that two
 * pivots share an id, that an ATT&CK link points at a different technique than
 * the one it labels, or that an English string was never written. This script
 * bundles the data files with esbuild, imports them, and checks exactly that.
 *
 * Errors fail the build. Warnings are printed and tolerated (a log excerpt is
 * legitimately identical in both languages).
 */
import { build } from 'esbuild';

const bundle = await build({
  entryPoints: ['src/data/scenarios.ts'],
  bundle: true,
  format: 'esm',
  write: false,
  platform: 'node',
  logLevel: 'silent',
});
const code = bundle.outputFiles[0].text;
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
);

const badgesBundle = await build({
  entryPoints: ['src/data/badges.ts'],
  bundle: true,
  format: 'esm',
  write: false,
  platform: 'node',
  logLevel: 'silent',
});
const badgesMod = await import(
  'data:text/javascript;base64,' +
    Buffer.from(badgesBundle.outputFiles[0].text).toString('base64')
);

const BADGES = badgesMod.BADGES;
const errors = [];
const warnings = [];
const stats = { questions: 0, options: 0, pivots: 0, logs: 0, i18n: 0, techniques: 0, events: 0 };

function fail(where, msg) {
  errors.push(`${where}: ${msg}`);
}

function warn(where, msg) {
  warnings.push(`${where}: ${msg}`);
}

const isI18n = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) &&
  Object.keys(v).length === 2 && typeof v.fr === 'string' && typeof v.en === 'string';

/** Walks every object looking for {fr,en} pairs and checks both sides. */
function scanI18n(node, path) {
  if (!node || typeof node !== 'object') return;
  if (isI18n(node)) {
    stats.i18n += 1;
    if (!node.fr.trim()) fail(path, 'empty FR string');
    if (!node.en.trim()) fail(path, 'empty EN string');
    if (node.fr.trim() === node.en.trim() && node.fr.length > 40) {
      warn(path, `FR and EN identical (${node.fr.slice(0, 50)}…)`);
    }
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object') scanI18n(value, `${path}.${key}`);
  }
}

function checkQuestion(q, where, allowedIds) {
  stats.questions += 1;
  const ids = q.options.map((o) => o.id);
  stats.options += ids.length;
  if (new Set(ids).size !== ids.length) fail(where, 'duplicate option ids');
  if (!q.correct.length) fail(where, 'no correct answer declared');
  if (new Set(q.correct).size !== q.correct.length) fail(where, 'duplicate correct ids');
  for (const id of q.correct) {
    if (!ids.includes(id)) fail(where, `correct id "${id}" is not an option`);
  }
  if (q.correct.length === ids.length) fail(where, 'every option is correct');
  if (!(q.points > 0)) fail(where, 'points must be > 0');
  if (!q.multi && q.correct.length > 1) {
    fail(where, 'several correct answers but multi is not set');
  }
  if (allowedIds) {
    for (const id of ids) {
      if (!allowedIds.has(id)) fail(where, `option "${id}" has no matching technique`);
    }
  }
  for (const o of q.options) {
    if (o.awardsBadge && !BADGES[o.awardsBadge]) {
      fail(where, `unknown badge "${o.awardsBadge}"`);
    }
    if (o.awardsBadge && !q.correct.includes(o.id)) {
      fail(where, `option "${o.id}" awards a badge but is not a correct answer`);
    }
  }
}

for (const s of mod.SCENARIOS) {
  const where0 = s.id;
  if (s.perfectBadge && !BADGES[s.perfectBadge]) fail(where0, 'unknown perfectBadge');

  const phaseIds = s.phases.map((p) => p.id);
  if (new Set(phaseIds).size !== phaseIds.length) fail(where0, 'duplicate phase ids');

  const kinds = s.phases.map((p) => p.kind);
  for (const required of ['briefing', 'alert', 'investigation', 'mitre', 'timeline', 'decision', 'debrief']) {
    if (!kinds.includes(required)) fail(where0, `missing phase kind "${required}"`);
  }

  const questionIds = [];

  for (const p of s.phases) {
    const where = `${s.id}/${p.id}`;
    if (p.kind === 'alert' || p.kind === 'decision') {
      p.questions.forEach((q) => {
        questionIds.push(q.id);
        checkQuestion(q, `${where}/${q.id}`);
      });
    }
    if (p.kind === 'investigation') {
      stats.pivots += p.pivots.length;
      const pivotIds = p.pivots.map((x) => x.id);
      if (new Set(pivotIds).size !== pivotIds.length) fail(where, 'duplicate pivot ids');
      const relevant = p.pivots.filter((x) => x.relevant);
      if (relevant.length < p.minPivots) fail(where, 'minPivots exceeds relevant pivots');
      if (!p.pivots.some((x) => !x.relevant)) fail(where, 'no decoy pivot');
      for (const pivot of p.pivots) {
        const pw = `${where}/${pivot.id}`;
        if (pivot.relevant && !(pivot.points > 0)) fail(pw, 'relevant pivot with no points');
        if (!pivot.relevant && pivot.points !== 0) fail(pw, 'decoy pivot must score 0');
        if (!pivot.logs.length) fail(pw, 'pivot has no logs');
        stats.logs += pivot.logs.length;
        const logIds = pivot.logs.map((l) => l.id);
        if (new Set(logIds).size !== logIds.length) fail(pw, 'duplicate log ids');
        for (const log of pivot.logs) {
          if (!log.fields.length) fail(`${pw}/${log.id}`, 'log entry has no fields');
        }
        if (pivot.awardsBadge && !BADGES[pivot.awardsBadge]) fail(pw, 'unknown badge');
        if (pivot.awardsBadge && !pivot.relevant) fail(pw, 'decoy pivot awards a badge');
      }
      if (p.question) {
        questionIds.push(p.question.id);
        checkQuestion(p.question, `${where}/${p.question.id}`);
      }
    }
    if (p.kind === 'mitre') {
      stats.techniques += p.techniques.length;
      const techIds = p.techniques.map((t) => t.id);
      if (new Set(techIds).size !== techIds.length) fail(where, 'duplicate technique ids');
      const observed = p.techniques.filter((t) => t.observed).map((t) => t.id).sort();
      const correct = [...p.question.correct].sort();
      if (JSON.stringify(observed) !== JSON.stringify(correct)) {
        fail(where, `observed techniques ${observed.join(',')} != correct ${correct.join(',')}`);
      }
      for (const t of p.techniques) {
        if (!/^https:\/\/attack\.mitre\.org\/techniques\/T\d{4}(\/\d{3})?\/$/.test(t.url)) {
          fail(`${where}/${t.id}`, `suspicious ATT&CK url: ${t.url}`);
        }
        if (!t.url.includes(t.id.replace('.', '/'))) {
          fail(`${where}/${t.id}`, `url does not match id: ${t.url}`);
        }
        if (t.observed && !t.evidence) fail(`${where}/${t.id}`, 'observed without evidence');
      }
      questionIds.push(p.question.id);
      checkQuestion(p.question, `${where}/${p.question.id}`, new Set(techIds));
    }
    if (p.kind === 'timeline') {
      stats.events += p.events.length;
      const ids = p.events.map((e) => e.id);
      if (new Set(ids).size !== ids.length) fail(where, 'duplicate timeline event ids');
      if (p.events.length < 5) fail(where, 'timeline too short');
      if (!(p.points > 0)) fail(where, 'timeline has no points');
      const times = p.events.map((e) => e.time);
      if (times.some((t) => !/^\d{2}:\d{2}$/.test(t))) fail(where, 'bad time format');
    }
    if (p.kind === 'debrief') {
      if (!p.lessons.length || !p.rootCause.length || !p.remediation.length) {
        fail(where, 'incomplete debrief');
      }
    }
  }

  if (new Set(questionIds).size !== questionIds.length) fail(where0, 'duplicate question ids');

  for (const ref of s.realCase.references) {
    if (!/^https:\/\//.test(ref.url)) fail(where0, `non-https reference: ${ref.url}`);
  }

  scanI18n(s, s.id);
}

console.log('Scenario content check');
console.log(
  `  ${mod.SCENARIOS.length} scenarios · ${stats.questions} questions · ${stats.options} options · ` +
    `${stats.pivots} pivots · ${stats.logs} log entries · ${stats.techniques} technique cells · ` +
    `${stats.events} timeline events · ${stats.i18n} bilingual strings · ` +
    `${Object.keys(BADGES).length} badges`,
);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('  ! ' + w));
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log('  x ' + e));
  process.exit(1);
}

console.log('\nOK - every content check passed.');
