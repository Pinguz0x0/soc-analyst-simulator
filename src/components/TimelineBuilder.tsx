import { useMemo, useState } from 'react';
import type { TimelineEvent, TimelinePhase } from '../types/scenario';
import type { TimelineRecord } from '../engine/engine';
import { hashSeed, move, seededShuffle } from '../engine/shuffle';
import { useI18n } from '../i18n/I18nProvider';

type Props = {
  phase: TimelinePhase;
  record?: TimelineRecord;
  onSubmit: (order: string[]) => void;
};

/**
 * Kill chain reconstruction. Drag and drop for pointers, arrow buttons for
 * keyboards and touch — the two paths are equivalent on purpose.
 * Timestamps stay hidden until submission, otherwise there is nothing to solve.
 */
export function TimelineBuilder({ phase, record, onSubmit }: Props) {
  const { t, tr } = useI18n();

  const shuffled = useMemo(
    () => seededShuffle(phase.events, hashSeed(phase.id)),
    [phase.events, phase.id],
  );

  const [order, setOrder] = useState<TimelineEvent[]>(shuffled);
  const [dragId, setDragId] = useState<string | null>(null);

  const submitted = Boolean(record);
  const current: TimelineEvent[] = record
    ? record.order
        .map((id) => phase.events.find((event) => event.id === id))
        .filter((event): event is TimelineEvent => Boolean(event))
    : order;

  function reorder(from: number, to: number) {
    if (submitted) return;
    setOrder((items) => move(items, from, to));
  }

  return (
    <section className="panel">
      <div className="panel-head">
        {t('phase.kind.timeline')}
        <span className="ml-auto normal-case tracking-normal">
          <span className="chip !text-neon-soft">{t('q.points', { n: phase.points })}</span>
        </span>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-[13px] leading-relaxed text-slate-300">{tr(phase.intro)}</p>
        <p className="rounded-md border border-line bg-panel2/40 px-3 py-2 text-[12px] text-muted">
          {t('timeline.help')}
          {!submitted ? (
            <span className="mt-1 block font-mono text-[11px] text-dim">
              {t('timeline.hidden')}
            </span>
          ) : null}
        </p>

        <ol className="space-y-1.5">
          {current.map((event, index) => {
            const wellPlaced = submitted && phase.events[index]?.id === event.id;
            const tone = submitted
              ? wellPlaced
                ? 'border-ok/50 bg-ok/10'
                : 'border-bad/40 bg-bad/10'
              : dragId === event.id
                ? 'border-neon/70 bg-neon/10'
                : 'border-line bg-panel2/50 hover:border-line2';

            return (
              <li
                key={event.id}
                draggable={!submitted}
                onDragStart={() => setDragId(event.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!dragId) return;
                  const from = current.findIndex((item) => item.id === dragId);
                  if (from >= 0) reorder(from, index);
                  setDragId(null);
                }}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${tone} ${
                  submitted ? '' : 'cursor-grab active:cursor-grabbing'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded border border-line bg-abyss font-mono text-[11px] text-dim"
                >
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] leading-snug text-slate-200">
                    {tr(event.label)}
                  </span>
                  {submitted ? (
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="text-neon-soft">{event.time}</span>
                      {wellPlaced ? (
                        <span className="text-ok">✓</span>
                      ) : (
                        <span className="text-bad">✗</span>
                      )}
                      {event.detail ? (
                        <span className="font-sans text-[11px] text-muted">{tr(event.detail)}</span>
                      ) : null}
                    </span>
                  ) : null}
                </span>

                {!submitted ? (
                  <span className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => reorder(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`${t('timeline.up')} — ${tr(event.label)}`}
                      className="rounded border border-line px-1.5 text-[10px] leading-4 text-muted hover:border-neon hover:text-neon disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(index, index + 1)}
                      disabled={index === current.length - 1}
                      aria-label={`${t('timeline.down')} — ${tr(event.label)}`}
                      className="rounded border border-line px-1.5 text-[10px] leading-4 text-muted hover:border-neon hover:text-neon disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        {!submitted ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSubmit(order.map((event) => event.id))}
          >
            {t('timeline.submit')}
          </button>
        ) : record ? (
          <div
            className={`rounded-md border p-3 ${
              record.correctCount === record.total
                ? 'border-ok/50 bg-ok/10'
                : record.correctCount >= record.total / 2
                  ? 'border-sev-medium/50 bg-sev-medium/10'
                  : 'border-bad/50 bg-bad/10'
            }`}
            role="status"
          >
            <p className="flex items-center justify-between text-[13px] font-semibold text-ink">
              <span>{t('timeline.result', { ok: record.correctCount, total: record.total })}</span>
              <span className="font-mono text-neon-soft">
                {t('fb.earned', { n: record.points })}
              </span>
            </p>

            <div className="mt-3">
              <p className="label-xs mb-1.5">{t('timeline.solution')}</p>
              <ol className="space-y-1">
                {phase.events.map((event) => (
                  <li key={event.id} className="flex gap-3 text-[12px] leading-relaxed">
                    <span className="w-12 shrink-0 font-mono text-neon-soft">{event.time}</span>
                    <span className="text-slate-300">{tr(event.label)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
