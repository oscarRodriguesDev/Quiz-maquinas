"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionCard } from "./QuestionCard";
import { Progress } from "./Progress";
import type { Question } from "@/lib/quiz/questions";
import {
  buildFlow,
  clearsOnChange,
  questionById,
} from "@/lib/quiz/flow";
import { validateAnswers } from "@/lib/quiz/schema";
import type { Family } from "@/types/catalog";

const BUDGET_LABELS: Record<string, string> = {
  "500": "Até R$ 500",
  "1000": "Até R$ 1.000",
  "2000": "Até R$ 2.000",
  "3500": "Até R$ 3.500",
  "6000": "Até R$ 6.000",
  "15000": "Até R$ 15.000",
  open: "Sem limite definido / prefiro orçamento",
};

const GOAL_LABELS: Record<Family, string> = {
  pressure: "Lavar veículos, calçadas ou áreas externas com jato de água",
  extraction: "Lavar sofás, colchões, carpetes ou estofados com extração",
  vacuum: "Aspirar sujeira em casa, na empresa ou na oficina",
  steam: "Limpar superfícies com vapor",
  floor: "Esfregar e limpar pisos com máquina",
  sweep: "Recolher folhas, poeira e resíduos soltos do chão",
  drain: "Retirar água acumulada com uma bomba",
  pet: "Aspirar pelos durante os cuidados com o pet",
};

function answerLabel(question: Question | undefined, value: string): string {
  if (!question) return value;
  const option = question.options.find((o) => o.id === value);
  return option ? option.label : value;
}

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
    const valid: Family[] = [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ];
    return valid.includes(g as Family) ? (g as Family) : null;
  }, [answers.goal]);

  const flow = useMemo(() => {
    if (!family) return null;
    return buildFlow(family, answers);
  }, [family, answers]);

  const currentQuestion = useMemo(() => {
    if (!flow) return null;
    if (stepIndex < 0 || stepIndex >= flow.steps.length) return null;
    return questionById(flow.steps[stepIndex].questionId);
  }, [flow, stepIndex]);

  // Reajusta o índice quando o fluxo encolhe (ex.: resposta alterada removeu perguntas).
  useEffect(() => {
    if (!flow) return;
    if (stepIndex >= flow.steps.length) {
      setStepIndex(flow.steps.length - 1);
    }
  }, [flow, stepIndex]);

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

  const selectAnswer = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setError(null);

      const nextAnswers = { ...answers, [currentQuestion.id]: value };

      // Limpar respostas dependentes incompatíveis (ex.: mudar Q1 limpa Q4/Q5/Q7 e verificações).
      const clears = clearsOnChange(currentQuestion.id);
      for (const clearId of clears) {
        delete nextAnswers[clearId];
      }

      setAnswers(nextAnswers);

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
    [answers, currentQuestion, family, goToStep],
  );

  const submitQuiz = async () => {
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
  };

  const restartQuiz = useCallback(() => {
    setAnswers({});
    setStepIndex(0);
    setStage("questions");
    setError(null);
  }, []);

  const progress = useMemo(() => {
    if (!flow) return { current: 0, total: 0, answered: 0 };
    const answered = flow.steps.filter((s) => s.questionId in answers).length;
    return { current: stepIndex + 1, total: flow.steps.length, answered };
  }, [flow, stepIndex, answers]);

  if (stage === "result") {
    return <ResultScreen answers={answers} result={result} onRestart={restartQuiz} />;
  }

  if (!flow || !currentQuestion) {
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
        <Progress
          current={progress.current}
          total={progress.total}
          answered={progress.answered}
        />
        <QuestionCard
          key={`${currentQuestion.id}-${stepIndex}`}
          question={currentQuestion}
          step={progress.current}
          total={progress.total}
          value={answers[currentQuestion.id]}
          onSelect={selectAnswer}
          onBack={() => {
            if (stepIndex > 0) {
              goToStep(stepIndex - 1);
            }
          }}
          canBack={stepIndex > 0}
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
