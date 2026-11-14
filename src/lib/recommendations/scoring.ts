import type { QuizAnswers } from "../../types/catalog";
import type { EligibleCandidate } from "./eligibility";

import * as eligibility from "./eligibility";

export interface ScoredCandidate extends EligibleCandidate {
  score: ScoreBreakdown;
}

export interface ScoreBreakdown {
  routine: number; // max 35
  priority: number; // max 30
  environment: number; // max 20
  investment: number; // max 15
  total: number;
}

function evidenceApproved<T>(ev: { value: T | null; state: string } | undefined): boolean {
  return !!ev && ev.state === "approved" && ev.value !== null && ev.value !== undefined;
}

function tagMatches(evidence: { value: string[] | null; state: string } | undefined, tag: string): boolean {
  return !!evidence && evidence.state === "approved" && !!evidence.value && evidence.value.includes(tag);
}

export function scoreCandidates(
  candidates: EligibleCandidate[],
  answers: QuizAnswers,
): ScoredCandidate[] {
  const buyablePrices = candidates
    .filter((c) => eligibility.isBuyable(c))
    .map((c) => c.variant?.priceCents ?? c.machine.commercial.regularPriceCents)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const lowestPrice = buyablePrices.length > 0 ? Math.min(...buyablePrices) : null;

  return candidates.map((candidate) => {
    const { machine, variant } = candidate;
    const price = variant?.priceCents ?? machine.commercial.regularPriceCents;

    // Adequação à rotina declarada (máx. 35): somente com tags aprovadas.
    let routine = 0;
    if (
      tagMatches(machine.dutyProfile, answers.frequency) &&
      tagMatches(machine.workloadBands, answers.workload)
    ) {
      routine = 35;
    }

    // Prioridade escolhida (máx. 30): somente característica documentada.
    let priority = 0;
    if (tagMatches(machine.priorityTags, answers.priority)) {
      priority = 30;
    }

    // Ambiente e mobilidade (máx. 20): contexto aprovado + compatibilidade.
    let environment = 0;
    if (
      tagMatches(machine.contexts, answers.context) &&
      tagMatches(machine.applications, answers.surface)
    ) {
      environment = 20;
    }

    // Investimento (máx. 15): para economia, menor preço entre elegíveis.
    let investment = 0;
    if (typeof price === "number" && price > 0 && lowestPrice !== null) {
      investment = Math.round(15 * (lowestPrice / price));
      if (investment > 15) investment = 15;
    }

    const total = routine + priority + environment + investment;

    return {
      ...candidate,
      score: { routine, priority, environment, investment, total },
    };
  });
}

export function rankCandidates(
  scored: ScoredCandidate[],
): ScoredCandidate[] {
  return [...scored].sort((a, b) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    if (b.score.priority !== a.score.priority) {
      return b.score.priority - a.score.priority;
    }
    const pa = a.variant?.priceCents ?? a.machine.commercial.regularPriceCents ?? Infinity;
    const pb = b.variant?.priceCents ?? b.machine.commercial.regularPriceCents ?? Infinity;
    if (pa !== pb) {
      return pa - pb;
    }
    return a.machine.id.localeCompare(b.machine.id);
  });
}
