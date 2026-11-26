"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionCard } from "./QuestionCard";
import { Progress } from "./Progress";
import { ResultScreen } from "@/components/results/ResultScreen";
import { ResponsiveBanner } from "@/components/ui/ResponsiveBanner";
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

const PORTABLE_STORE_URL =
  "https://www.karcher-center-dikmaq.com.br/lavadoras-de-alta-pressao-portatil-karcher";

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
    <section className="flex-1 w-full bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div ref={scrollRef} className="min-w-0 scroll-mt-6">
            <div className="mb-6">
              <p className="text-[11px] font-[800] uppercase tracking-[0.2em] text-accent">
                Quiz de máquinas
              </p>
              <h1 className="mt-1 text-2xl font-[900] tracking-[-0.5px] text-brand-ink sm:text-3xl">
                Encontre a sua máquina
              </h1>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
                {error}
              </div>
            )}

            <Progress total={progress.total} answered={progress.answered} />

            <div className="mt-8">
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
                hideContinue={
                  !flow?.steps.some(
                    (step, i) => i > displayIndex && !(step.questionId in answers)
                  )
                }
              />
            </div>

            {/* Botão de envio manual como fallback caso o fluxo automático não dispare */}
            {showManualSubmit && !submitting && stage === "questions" && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleManualSubmit}
                  disabled={submitting}
                  className="w-full rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 text-base font-[800] uppercase tracking-tight text-brand-ink transition-colors hover:bg-[#e6de00] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                >
                  Descobrir minha máquina
                </button>
                <p className="text-xs text-text-muted">
                  Todas as respostas preenchidas. Clique para obter a indicação da máquina.
                </p>
              </div>
            )}
          </div>

          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <a
              href={PORTABLE_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-offset-4"
              aria-label="Conhecer a lavadora de alta pressão portátil Kärcher na loja (abre em nova aba)"
            >
              <ResponsiveBanner
                desktopSrc="/images/banner-mobile1.webp"
                mobileSrc="/images/banner-mobile1.webp"
                alt="Lavadora de alta pressão portátil Kärcher em uso"
                className="aspect-[425/495] rounded-xl border border-border shadow-sm transition-opacity hover:opacity-95"
              />
            </a>

            <div className="mt-4 rounded-xl border border-border-soft bg-surface-muted p-5">
              <h2 className="text-[11px] font-[800] uppercase tracking-wider text-text-muted">
                Enquanto você responde
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-brand-ink">
                <li className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  Uma pergunta por tela, no seu ritmo
                </li>
                <li className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  Você pode voltar e ajustar as respostas
                </li>
                <li className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  Sem cadastro e sem compromisso
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
