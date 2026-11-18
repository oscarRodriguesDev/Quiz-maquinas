"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionCard } from "./QuestionCard";
import { Progress } from "./Progress";
import type { Family } from "@/types/catalog";
import type { Question, QuestionId } from "@/lib/quiz/questions";
import {
  buildFlow,
  clearsOnChange,
  questionById,
} from "@/lib/quiz/flow";
import {
  getSurfaceOptions,
  getWorkloadOptions,
} from "@/lib/quiz/questions";
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

  const baseQuestion: Question | undefined = useMemo(() => {
    if (!family) {
      // Família ainda não definida: mostrar apenas Q1 (objetivo).
      return questionById(GOAL_QUESTION_ID);
    }
    if (!flow) return undefined;
    return questionById(flow.steps[displayIndex].questionId as QuestionId);
  }, [family, flow, displayIndex]);

  // Q4 (surface) e Q5 (workload) exibem opções específicas por família.
  const currentQuestion: Question | undefined = useMemo(() => {
    if (!baseQuestion) return undefined;
    if (!family) return baseQuestion;
    if (baseQuestion.id === "surface") {
      return { ...baseQuestion, options: getSurfaceOptions(family) };
    }
    if (baseQuestion.id === "workload") {
      return { ...baseQuestion, options: getWorkloadOptions(family) };
    }
    return baseQuestion;
  }, [baseQuestion, family]);

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

  const submitQuiz = useCallback(
    async (answersToSubmit: Record<string, string>) => {
      console.log("[Quiz] submitQuiz chamado com answers:", answersToSubmit);
      setSubmitting(true);
      setError(null);
      try {
        // O contrato do servidor (validateAnswers em schema.ts) espera as
        // verificações condicionais (Q9/Q10) agrupadas sob a chave "checks".
        // O estado local armazena cada resposta com seu id direto (goal, ..., check-q9, check-q10),
        // então montamos o payload no formato esperado antes de enviar.
        // "checks" é sempre enviado como objeto (mesmo vazio) para não falhar a validação do servidor.
        const checks: Record<string, string> = {};
        const payloadAnswers: Record<string, string | Record<string, string>> = {};
        for (const [key, value] of Object.entries(answersToSubmit)) {
          if (key.startsWith("check-")) {
            checks[key] = value;
          } else {
            payloadAnswers[key] = value;
          }
        }
        payloadAnswers.checks = checks;

        console.log("[Quiz] payload montado:", payloadAnswers);

        const validated = validateAnswers(payloadAnswers);
        if (!validated.valid || !validated.answers) {
          console.log("[Quiz] validação falhou:", validated.errors);
          setError("Respostas inválidas. Revise o questionário e tente novamente.");
          return;
        }

        console.log("[Quiz] fazendo fetch para /api/recommendations");
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: validated.answers,
            questionnaireVersion: "quiz-1",
          }),
        });

        console.log("[Quiz] resposta do servidor:", res.status, res.statusText);

        if (!res.ok) {
          let detail = "";
          try {
            const errBody = await res.json();
            detail = errBody.error || errBody.message || "";
          } catch {
            /* corpo não é JSON */
          }
          if (res.status === 409) {
            setError(`Versão do questionário incompatível. ${detail} Reinicie o quiz.`);
            return;
          }
          if (res.status === 503) {
            setError(`O catálogo não pôde ser carregado no momento. ${detail} Tente novamente em instantes.`);
            return;
          }
          setError(`Não foi possível processar as respostas (${res.status}). ${detail} Tente novamente.`);
          return;
        }

        let result;
        try {
          result = await res.json();
          console.log("[Quiz] resultado recebido:", result);
        } catch {
          setError("A resposta do servidor está vazia ou inválida. Tente novamente.");
          return;
        }

        if (!result || typeof result !== "object") {
          setError("A resposta do servidor está vazia. Tente novamente.");
          return;
        }

        setResult(result);
        setStage("result");
      } catch (err) {
        console.error("Erro ao submeter o quiz:", err);
        setError("Falha ao comunicar com o servidor. Verifique sua conexão e tente novamente.");
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const selectAnswer = useCallback(
    (value: string) => {
      console.log("[Quiz] selectAnswer chamado:", {
        questionId: currentQuestion?.id,
        value,
        currentAnswersCount: Object.keys(answers).length,
      });
      if (!currentQuestion) {
        console.log("[Quiz] selectAnswer: currentQuestion indefinido, saindo.");
        return;
      }
      setError(null);

      const nextAnswers = { ...answers, [currentQuestion.id]: value };

      const clears = clearsOnChange(currentQuestion.id as QuestionId);
      for (const clearId of clears) {
        delete nextAnswers[clearId];
      }

      setAnswers(nextAnswers);

      // Se a família acabou de ser escolhida (Q1), o fluxo agora existe.
      if (!family && value) {
        console.log("[Quiz] Q1 selecionado, família:", value);
        const nextFlow = buildFlow(value as Family, nextAnswers);
        const unanswered = nextFlow.steps.find(
          (s) => !(s.questionId in nextAnswers),
        );
        console.log("[Quiz] Q1 fluxo:", {
          steps: nextFlow.steps.map((s) => s.questionId),
          unanswered: unanswered?.questionId,
        });
        if (unanswered) {
          goToStep(nextFlow.steps.indexOf(unanswered));
        } else {
          console.log("[Quiz] Q1: todas respondidas, chamando submitQuiz");
          submitQuiz(nextAnswers);
        }
        return;
      }

      console.log("[Quiz] família atual:", family);
      const nextFlow = buildFlow(family as Family, nextAnswers);
      const unanswered = nextFlow.steps.find(
        (s) => !(s.questionId in nextAnswers),
      );
      console.log("[Quiz] fluxo:", {
        steps: nextFlow.steps.map((s) => s.questionId),
        unanswered: unanswered?.questionId,
      });
      if (unanswered) {
        goToStep(nextFlow.steps.indexOf(unanswered));
      } else {
        console.log("[Quiz] todas respondidas, chamando submitQuiz");
        submitQuiz(nextAnswers);
      }
    },
    [answers, currentQuestion, family, goToStep, submitQuiz],
  );

  // Fallback: envio manual caso o fluxo automático não dispare submitQuiz
  const [showManualSubmit, setShowManualSubmit] = useState(false);

  const handleManualSubmit = useCallback(() => {
    console.log("[Quiz] Envio manual disparado com answers:", answers);
    submitQuiz(answers);
  }, [answers, submitQuiz]);

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

  // Quando todas as 8 respostas obrigatórias estão preenchidas e ainda não há
  // resultado, dispara o submitQuiz automaticamente. Isso garante que o usuário
  // sempre receba a indicação da máquina mesmo se o fluxo de perguntas não
  // cobrir Q9/Q10 ou se o currentQuestion sumir.
  useEffect(() => {
    const required = [
      "goal",
      "context",
      "frequency",
      "surface",
      "workload",
      "power",
      "priority",
      "budget",
    ];
    const allRequiredAnswered = required.every(
      (key) => answers[key] !== undefined && answers[key] !== "",
    );
    if (allRequiredAnswered && !result && stage === "questions" && !submitting) {
      console.log("[Quiz] Todas as respostas obrigatórias preenchidas, disparando submitQuiz automático");
      submitQuiz(answers);
    }
  }, [answers, family, result, stage, submitting]);

  if (stage === "result") {
    return (
      <ResultScreen answers={answers} result={result} onRestart={restartQuiz} />
    );
  }

  if (!currentQuestion) {
    return (
      <section className="flex flex-1 w-full flex-col items-center justify-center bg-white p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <img
            src="https://mktkarcher.com.br/download/105/institucionais/1_lVImt0Itud1YA6owcH5VBFyjSULRZMj/LOGO%20KARCHER%20FUNDO%20TRANSPARENTE%20BAIXA.png"
            alt="Kärcher"
            width="80"
            height="27"
            className="h-6 w-auto object-contain"
            loading="lazy"
          />
          <span className="font-klean font-[800] text-brand-ink text-xs sm:text-sm uppercase tracking-tight">
            Kärcher Center Dikmaq
          </span>
        </div>
        <p className="text-brand-ink">Preparando o quiz…</p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 w-full flex-col bg-white">
      <div className="flex-1 w-full overflow-y-auto p-6 sm:p-8" ref={scrollRef}>
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2">
            <img
              src="https://mktkarcher.com.br/download/105/institucionais/1_lVImt0Itud1YA6owcH5VBFyjSULRZMj/LOGO%20KARCHER%20FUNDO%20TRANSPARENTE%20BAIXA.png"
              alt="Kärcher"
              width="72"
              height="24"
              className="h-5 w-auto object-contain"
              loading="lazy"
            />
            <span className="font-klean font-[800] text-brand-ink text-xs sm:text-sm uppercase tracking-tight">
              Kärcher Center Dikmaq
            </span>
          </div>
        </div>
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

        {/* Botão de envio manual como fallback caso o fluxo automático não dispare */}
        {showManualSubmit && !submitting && stage === "questions" && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleManualSubmit}
              disabled={submitting}
              className="w-full sm:w-auto rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 text-brand-ink font-[800] text-base uppercase tracking-tight transition-colors hover:bg-[#e6de00] disabled:opacity-50 disabled:pointer-events-none"
            >
              Enviar resultado
            </button>
            <p className="text-xs text-text-muted">
              Todas as respostas preenchidas. Clique para obter a indicação da máquina.
            </p>
          </div>
        )}
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
  productUrl: string;
  variantId: string | null;
  name: string;
  model: string;
  brand: string;
  descriptionText: string;
  imageUrl: string;
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
      <div className="flex items-center gap-2 mb-6">
        <img
          src="https://mktkarcher.com.br/download/105/institucionais/1_lVImt0Itud1YA6owcH5VBFyjSULRZMj/LOGO%20KARCHER%20FUNDO%20TRANSPARENTE%20BAIXA.png"
          alt="Kärcher"
          width="88"
          height="30"
          className="h-7 w-auto object-contain"
          loading="lazy"
        />
        <span className="font-klean font-[800] text-brand-ink text-xs sm:text-sm uppercase tracking-tight">
          Kärcher Center Dikmaq
        </span>
      </div>
      <h2 className="text-[30px] sm:text-[40px] font-[900] tracking-[-1px] text-brand-ink">
        Resultado da sua busca
      </h2>

      {isNoMatch || items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="shrink-0 text-red-500">⚠</span>
            <h3 className="font-[800] text-brand-ink text-base">
              Nenhuma máquina encontrada
            </h3>
          </div>
          <p className="text-brand-ink mb-2">
            {rec?.reviewReasons?.[0] ||
            "Não há máquina no catálogo que atenda a todos os filtros com as respostas informadas."}
          </p>
          <p className="mt-2 text-text-secondary">
            Tente alterar algumas respostas (por exemplo, orçamento, frequência de uso ou
            alimentação) e refazer o quiz, ou fale com um especialista para uma indicação
            personalizada.
          </p>
          <button
            className="mt-6 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 text-brand-ink font-[800] text-base transition-colors hover:bg-[#e6de00]"
            onClick={onRestart}
          >
            Alterar respostas
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
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={`${item.name} ${item.model}`}
                    className="mb-3 w-full h-24 object-cover rounded-lg bg-border"
                    loading="lazy"
                  />
                )}
                <h3 className="mt-2 text-base font-[700] text-brand-ink leading-snug">
                  {item.name} — {item.model}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  {item.brand} • Referência {item.productId}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Versão: {item.variantId ?? "a confirmar"}
                </p>
                <p className="mt-2 text-sm text-brand-ink leading-snug">
                  {item.descriptionText}
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
                  onClick={() => {
                    if (item.productUrl) {
                      window.open(item.productUrl, "_blank");
                    }
                  }}
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
