import type { Question } from "@/lib/quiz/questions";

interface QuestionCardProps {
  question: Question;
  step: number;
  total: number;
  value: string | undefined;
  onSelect: (value: string) => void;
  onBack: () => void;
  canBack: boolean;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  step,
  total,
  value,
  onSelect,
  onBack,
  canBack,
  disabled,
}: QuestionCardProps) {
  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-brand-ink bg-brand-ink text-surface text-[10px] font-[800]">
            {step}
          </span>
          <span className="text-xs font-[700] uppercase tracking-wider text-accent">
            Pergunta {step} de {total}
          </span>
        </div>
        <fieldset className="border-none p-0 m-0 flex flex-col gap-3">
          <legend className="text-[24px] sm:text-[28px] font-[900] tracking-[-0.5px] text-brand-ink leading-tight">
            {question.title}
          </legend>
          {question.help && (
            <p className="text-sm text-text-secondary">{question.help}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex flex-col items-center justify-between gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                  value === option.id
                    ? "border-brand-ink bg-brand-yellow text-brand-ink shadow-sm"
                    : "border-border bg-surface text-brand-ink hover:border-text-secondary hover:bg-surface-muted"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={value === option.id}
                  onChange={() => onSelect(option.id)}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="font-[700] text-sm">{option.label}</span>
                {value === option.id && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <footer className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-end border-t border-border-soft pt-6">
        <button
          type="button"
          disabled={!canBack || disabled}
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-brand-ink font-[700] text-base transition-colors hover:bg-surface-muted disabled:opacity-50 disabled:pointer-events-none"
        >
          ← Voltar
        </button>
        <button
          type="button"
          disabled={!value || disabled}
          onClick={() => onSelect(value!)}
          className="rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 text-brand-ink font-[800] text-base uppercase tracking-tight transition-colors hover:bg-brand-yellow-dark disabled:opacity-50 disabled:pointer-events-none shadow-sm"
        >
          Continuar
        </button>
      </footer>
    </article>
  );
}
