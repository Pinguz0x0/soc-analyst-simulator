import type { DecisionPhase, Question } from '../types/scenario';
import type { AnswerRecord } from '../engine/engine';
import { useI18n } from '../i18n/I18nProvider';
import { QuestionCard } from './QuestionCard';

type Props = {
  phase: DecisionPhase;
  answers: Record<string, AnswerRecord>;
  onAnswer: (question: Question, selected: string[]) => void;
};

export function DecisionPanel({ phase, answers, onAnswer }: Props) {
  const { tr } = useI18n();

  return (
    <div className="space-y-4">
      <section className="panel border-l-2 border-l-sev-high p-4">
        <p className="text-[13px] leading-relaxed text-slate-300">{tr(phase.intro)}</p>
      </section>

      {phase.questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          answer={answers[question.id]}
          index={index + 1}
          total={phase.questions.length}
          onSubmit={(selected) => onAnswer(question, selected)}
        />
      ))}
    </div>
  );
}
