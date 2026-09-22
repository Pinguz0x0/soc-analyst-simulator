import { useState } from 'react';
import type { Question } from '../types/scenario';
import type { AnswerRecord } from '../engine/engine';
import { useI18n } from '../i18n/I18nProvider';
import { BadgeChip } from './BadgeChip';

type Props = {
  question: Question;
  answer?: AnswerRecord;
  onSubmit: (selected: string[]) => void;
  /** Live selection, used by the ATT&CK matrix to light up while choosing. */
  onChange?: (selected: string[]) => void;
  index?: number;
  total?: number;
};

const STATUS_TONE = {
  correct: {
    wrap: 'border-ok/50 bg-ok/10',
    text: 'text-ok',
    glyph: '✓',
  },
  partial: {
    wrap: 'border-sev-medium/50 bg-sev-medium/10',
    text: 'text-sev-medium',
    glyph: '≈',
  },
  wrong: {
    wrap: 'border-bad/50 bg-bad/10',
    text: 'text-bad',
    glyph: '✗',
  },
} as const;

export function QuestionCard({ question, answer, onSubmit, onChange, index, total }: Props) {
  const { t, tr } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);

  const answered = Boolean(answer);
  const picks = answer ? answer.selected : selected;
  const correctSet = new Set(question.correct);
  const multi = Boolean(question.multi) || question.correct.length > 1;

  function toggle(id: string) {
    const next = multi
      ? picks.includes(id)
        ? picks.filter((value) => value !== id)
        : [...picks, id]
      : [id];
    setSelected(next);
    onChange?.(next);
  }

  const tone = answer ? STATUS_TONE[answer.status] : null;
  const statusLabel = answer
    ? answer.status === 'correct'
      ? t('fb.correct')
      : answer.status === 'partial'
        ? t('fb.partial')
        : t('fb.wrong')
    : '';

  return (
    <section className="panel animate-fadeIn">
      <div className="panel-head">
        <span>
          {typeof index === 'number'
            ? `Q${index}${typeof total === 'number' ? `/${total}` : ''}`
            : 'Q'}
        </span>
        <span className="ml-auto flex items-center gap-2 normal-case tracking-normal">
          <span className="chip">{multi ? t('q.multi') : t('q.single')}</span>
          <span className="chip !text-neon-soft">{t('q.points', { n: question.points })}</span>
        </span>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-[15px] font-medium leading-relaxed text-ink">{tr(question.prompt)}</p>

        {question.hint ? (
          <details className="group rounded-md border border-line bg-panel2/40">
            <summary className="cursor-pointer select-none px-3 py-2 text-[12px] text-muted hover:text-ink">
              <span className="label-xs mr-2">{t('q.hint')}</span>
              <span className="group-open:hidden" aria-hidden="true">
                +
              </span>
              <span className="hidden group-open:inline" aria-hidden="true">
                −
              </span>
            </summary>
            <p className="border-t border-line px-3 py-2 text-[12px] leading-relaxed text-muted">
              {tr(question.hint)}
            </p>
          </details>
        ) : null}

        <fieldset disabled={answered} className="space-y-2">
          <legend className="sr-only">{tr(question.prompt)}</legend>

          {question.options.map((option) => {
            const isPicked = picks.includes(option.id);
            const isCorrect = correctSet.has(option.id);

            let box = 'border-line bg-panel2/50 hover:border-line2';
            if (!answered && isPicked) box = 'border-neon/70 bg-neon/10';
            if (answered && isCorrect) box = 'border-ok/60 bg-ok/10';
            if (answered && isPicked && !isCorrect) box = 'border-bad/60 bg-bad/10';

            return (
              <label key={option.id} className="relative block">
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={question.id}
                  value={option.id}
                  checked={isPicked}
                  onChange={() => toggle(option.id)}
                  className="peer sr-only"
                />
                <span
                  className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-[13px] leading-relaxed transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-neon peer-disabled:cursor-default ${box}`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-[2px] grid h-4 w-4 shrink-0 place-items-center border font-mono text-[10px] ${
                      multi ? 'rounded-[3px]' : 'rounded-full'
                    } ${
                      answered && isCorrect
                        ? 'border-ok text-ok'
                        : answered && isPicked
                          ? 'border-bad text-bad'
                          : isPicked
                            ? 'border-neon text-neon'
                            : 'border-line2 text-transparent'
                    }`}
                  >
                    {answered ? (isCorrect ? '✓' : isPicked ? '✗' : '') : isPicked ? '•' : ''}
                  </span>
                  <span className="min-w-0 flex-1 text-slate-200">{tr(option.label)}</span>
                  {answered && isCorrect && !isPicked ? (
                    <span className="shrink-0 self-center rounded border border-sev-medium/50 px-1.5 py-[1px] font-mono text-[10px] text-sev-medium">
                      {t('q.missed')}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>

        {!answered ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={selected.length === 0}
              onClick={() => onSubmit(selected)}
            >
              {t('phase.validate')}
            </button>
            {selected.length > 0 ? (
              <span className="font-mono text-[11px] text-dim">
                {t('q.yourAnswer')}: {selected.length}
              </span>
            ) : null}
          </div>
        ) : null}

        {answer && tone ? (
          <div className={`space-y-3 rounded-md border p-3 ${tone.wrap}`} role="status">
            <p className={`flex items-center gap-2 text-[13px] font-semibold ${tone.text}`}>
              <span aria-hidden="true">{tone.glyph}</span>
              {statusLabel}
              <span className="ml-auto font-mono text-[12px]">
                {t('fb.earned', { n: answer.points })}
              </span>
            </p>

            {question.options
              .filter((option) => answer.selected.includes(option.id) && option.feedback)
              .map((option) => (
                <p
                  key={option.id}
                  className="border-l-2 border-line2 pl-3 text-[12px] leading-relaxed text-muted"
                >
                  <span className="mr-1 font-semibold text-slate-300">« {tr(option.label)} » —</span>
                  {option.feedback ? tr(option.feedback) : null}
                </p>
              ))}

            <div>
              <p className="label-xs mb-1">{t('fb.why')}</p>
              <p className="text-[13px] leading-relaxed text-slate-300">
                {tr(question.explanation)}
              </p>
            </div>

            {answer.badges.length > 0 ? (
              <div>
                <p className="label-xs mb-1.5">{t('fb.badge')}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {answer.badges.map((id) => (
                    <BadgeChip key={id} id={id} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
