"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { QuestionCard } from "./QuestionCard";
import { Progress } from "./Progress";
import type { Family } from "@/types/catalog";
import type { Question, QuestionId } from "@/lib/quiz/questions";
import {
  buildFlow,
  clearsOnChange,
  questionById,
} from "@/lib/quiz/flow";
import { validateAnswers } from "@/lib/quiz/schema";

const GOAL_QUESTION_ID: QuestionId = "goal";

const validFamilies: Family[] = [
  "pressure",
  "extraction",
  "vacuum",
  "steam",
  "floor",
  "sweep",
  "drain",
  "pet",
];

export default function Quiz() {
  const [stage, setStage] = useState<"questions" | "result">("questions");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<unknown>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const family = useMemo<Family | null>(() => {
    const g = answers.goal;
    return validFamilies.includes(g as Family) ? (g as Family) : null;
  }, [answers.goal]);

  // Quando a família ainda não foi escolhida, o quiz começa com Q1 (goal).
  // A partir daí, buildFlow monta o restante do caminho por família.
  const flow = useMemo(() => {
    if (!family) return null;
    return buildFlow(family, answers);
  }, [family, answers]);

  const maxIndex = flow ? flow.steps.length - 1 : 0;
  const displayIndex = Math.min(stepIndex, maxIndex);

  const currentQuestion: Question | undefined = useMemo(() => {
    if (!family) {
      // Família ainda não definida: mostrar apenas Q1 (objetivo).
      return questionById(GOAL_QUESTION_ID);
    }
    if (!flow) return undefined;
    return questionById(flow.steps[displayIndex].questionId as QuestionId);
  }, [family, flow, displayIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (!flow) return;
      const clamped = Math.max(0, Math.min(index, flow.steps.length - 1));
      setStepIndex(clamped);
      setError(null);
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [flow],
  );

  const submitQuiz = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: validateAnswers(answers).answers ?? answers,
          questionnaireVersion: "quiz-1",
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setError("Versão do questionário incompatível. Reinicie o quiz.");
          return;
        }
        if (res.status === 503) {
          setError(
            "O catálogo não pôde ser carregado no momento. Tente novamente em instantes.",
          );
          return;
        }
        setError("Não foi possível processar as respostas. Tente novamente.");
        return;
      }

      const result = await res.json();
      setResult(result);
      setStage("result");
    } catch {
      setError("Falha ao comunicar com o servidor. Verifique sua conexão.");
    } finally {
      setSubmitting(false);
    }
  }, [answers]);

  const selectAnswer = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setError(null);

      const nextAnswers = { ...answers, [currentQuestion.id]: value };

      const clears = clearsOnChange(currentQuestion.id as QuestionId);
      for (const clearId of clears) {
        delete nextAnswers[clearId];
      }

      setAnswers(nextAnswers);

      // Se a família acabou de ser escolhida (Q1), o fluxo agora existe.
      if (!family && value) {
        const nextFlow = buildFlow(value as Family, nextAnswers);
        const unanswered = nextFlow.steps.find(
          (s) => !(s.questionId in nextAnswers),
        );
        if (unanswered) {
          goToStep(nextFlow.steps.indexOf(unanswered));
        } else {
          submitQuiz();
        }
        return;
      }

      const nextFlow = buildFlow(family as Family, nextAnswers);
      const unanswered = nextFlow.steps.find(
        (s) => !(s.questionId in nextAnswers),
      );
      if (unanswered) {
        goToStep(nextFlow.steps.indexOf(unanswered));
      } else {
        submitQuiz();
      }
    },
    [answers, currentQuestion, family, goToStep, submitQuiz],
  );

  const restartQuiz = useCallback(() => {
    setAnswers({});
    setStepIndex(0);
    setStage("questions");
    setError(null);
    setResult(null);
  }, []);

  const progress = useMemo(() => {
    if (!family) return { current: 1, total: 1, answered: 0 };
    if (!flow) return { current: 0, total: 0, answered: 0 };
    const answered = flow.steps.filter((s) => s.questionId in answers).length;
    return { current: displayIndex + 1, total: flow.steps.length, answered };
  }, [family, flow, displayIndex, answers]);

  if (stage === "result") {
    return (
      <ResultScreen answers={answers} result={result} onRestart={restartQuiz} />
    );
  }

  if (!currentQuestion) {
    return (
      <section className="flex flex-1 w-full flex-col items-center justify-center bg-white p-6">
        <p className="text-brand-ink">Preparando o quiz…</p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 w-full flex-col bg-white">
      <div className="flex-1 w-full overflow-y-auto p-6 sm:p-8" ref={scrollRef}>
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
            {error}
          </div>
        )}
        <Progress total={progress.total} answered={progress.answered} />
        <QuestionCard
          key={`${currentQuestion.id}-${displayIndex}`}
          question={currentQuestion}
          step={progress.current}
          total={progress.total}
          value={answers[currentQuestion.id]}
          onSelect={selectAnswer}
          onBack={() => {
            if (displayIndex > 0) {
              goToStep(displayIndex - 1);
            }
          }}
          canBack={displayIndex > 0}
          disabled={submitting}
        />
      </div>
    </section>
  );
}

interface ResultScreenProps {
  answers: Record<string, string>;
  result: unknown;
  onRestart: () => void;
}

type RecommendationItem = {
  productId: string;
  variantId: string | null;
  reasonCodes: string[];
  reasons: string[];
  caveats: string[];
  priceCents: number | null;
  commercialState: string;
};

function formatPrice(cents: number | null): string {
  if (cents === null || cents === undefined) {
    return "Preço a confirmar";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function actionFor(state: string) {
  if (state === "buyable") {
    return { label: "Ver máquina na loja", kind: "buyable" as const };
  }
  if (state === "quote") {
    return { label: "Solicitar orçamento", kind: "quote" as const };
  }
  return { label: "Confirmar com um especialista", kind: "review" as const };
}

function ResultScreen({ answers, result, onRestart }: ResultScreenProps) {
  const rec = result as {
    status?: string;
    recommendations?: RecommendationItem[];
    reviewReasons?: string[];
  } | null;

  const isNoMatch = rec?.status === "no-match";
  const items: RecommendationItem[] = rec?.recommendations ?? [];

  return (
    <section className="flex flex-1 w-full flex-col bg-white p-6 sm:p-8">
      <h2 className="text-[30px] sm:text-[40px] font-[900] tracking-[-1px] text-brand-ink">
        Resultado da sua busca
      </h2>

      {isNoMatch || items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border p-6 bg-surface-muted">
          <p className="text-brand-ink">
            {rec?.reviewReasons?.[0] ||
            "Não foi encontrada máquina compatível com as respostas informadas."}
          </p>
          <p className="mt-2 text-text-secondary">
            Precisamos confirmar alguns detalhes para indicar uma máquina adequada
            ao seu uso.
          </p>
          <button
            className="mt-6 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 text-brand-ink font-[800] text-base transition-colors hover:bg-[#e6de00]"
            onClick={onRestart}
          >
            Falar com um especialista
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-lg text-text-secondary">
            Indicamos a máquina abaixo, com até duas alternativas compatíveis.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.productId}
                className="rounded-lg border border-border p-6 bg-surface flex flex-col"
              >
                {i === 0 && (
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-[700] text-text-secondary">
                    Recomendação principal
                  </span>
                )}
                <h3 className="mt-2 text-base font-[700] text-brand-ink leading-snug">
                  Referência {item.productId}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  Versão: {item.variantId ?? "a confirmar"}
                </p>
                <p className="mt-2 text-base font-[800] text-brand-ink">
                  {formatPrice(item.priceCents)}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-brand-ink">
                  {item.reasons.slice(0, 3).map((reason, j) => (
                    <li key={j} className="flex items-start gap-1">
                      <span className="shrink-0 text-accent">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
                {item.caveats.length > 0 && (
                  <p className="mt-3 text-xs text-red-700">
                    {item.caveats.join(" ")}
                  </p>
                )}
                <p className="mt-auto text-xs text-text-muted">
                  Situação: {item.commercialState}
                </p>
                <button
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-yellow px-4 py-2.5 text-brand-ink font-[800] text-sm uppercase tracking-tight transition-colors hover:bg-[#e6de00]"
                >
                  {actionFor(item.commercialState).label}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border p-6 bg-surface-muted">
            <h3 className="mb-4 font-[700] text-brand-ink">Resumo das respostas</h3>
            <ul className="space-y-2 text-sm text-brand-ink">
              {Object.entries(answers).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="text-text-muted">{key}</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              className="flex-1 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 text-brand-ink font-[800] text-base transition-colors hover:bg-[#e6de00]"
              onClick={onRestart}
            >
              Alterar respostas
            </button>
            <button
              className="flex-1 rounded-lg border border-border bg-surface px-6 py-3 text-brand-ink font-[700] text-base transition-colors hover:bg-surface-muted"
              onClick={onRestart}
            >
              Refazer quiz
            </button>
          </div>
        </>
      )}
    </section>
  );
}
