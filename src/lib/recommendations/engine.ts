import type {
  CommercialState,
  Machine,
  QuizAnswers,
  RecommendationResult,
} from "../../types/catalog";

import { filterEligible, type EligibleCandidate } from "./eligibility";
import type { ScoredCandidate } from "./scoring";
import { rankCandidates, scoreCandidates } from "./scoring";
import { reasonText, type ReasonCode } from "./reasons";

const CATALOG_VERSION = "snapshot-1";
const RULES_VERSION = "rules-1";

/** Subtypes que NÃO devem aparecer como recomendação de máquina completa no quiz. */
const EXCLUDED_SUBTYPES = new Set([
  "Peças e Acessórios",
  "Acessórios",
  "Detergente",
]);

function commercialStateOfCandidate(c: ScoredCandidate): CommercialState {
  return c.variant?.commercialState ?? c.machine.commercial.state;
}

function statusFor(
  candidates: ScoredCandidate[],
): "direct" | "quote" | "needs-review" | "no-match" {
  if (candidates.length === 0) {
    return "no-match";
  }
  const hasBuyable = candidates.some(
    (c) => commercialStateOfCandidate(c) === "buyable",
  );
  const hasQuote = candidates.some(
    (c) => commercialStateOfCandidate(c) === "quote",
  );
  if (hasBuyable) {
    return "direct";
  }
  if (hasQuote) {
    return "quote";
  }
  return "needs-review";
}

export function recommend(
  machines: Machine[],
  answers: QuizAnswers,
): RecommendationResult {
  const eligible = filterEligible(machines, answers);

  // Fallback: quando não há candidatos elegíveis após os filtros obrigatórios,
  // relaxar os critérios para garantir que SEMPRE retorne pelo menos uma máquina.
  // O usuário quer que qualquer combinação resulte em uma indicação.
  let candidates: EligibleCandidate[] = eligible;
  let usedFallback = false;
  if (candidates.length === 0) {
    usedFallback = true;
    // Tentar apenas pela família do objetivo (relaxar energia, orçamento, etc.)
    const familyMachines = machines.filter(
      (m) =>
        m.quizStatus === "approved" &&
        m.isCompleteMachine &&
        m.family === answers.goal &&
        !EXCLUDED_SUBTYPES.has(m.subtype) &&
        m.commercial.visible &&
        m.commercial.enabled &&
        m.commercial.state !== "hidden",
    );
    candidates = familyMachines.map((m) => ({
      machine: m,
      variant: null,
      issues: [],
    }));
    // Se ainda nada, retornar as máquinas aprovadas de qualquer família.
    if (candidates.length === 0) {
      const anyMachines = machines.filter(
        (m) =>
          m.quizStatus === "approved" &&
          m.isCompleteMachine &&
          !EXCLUDED_SUBTYPES.has(m.subtype) &&
          m.commercial.visible &&
          m.commercial.enabled &&
          m.commercial.state !== "hidden",
      );
      candidates = anyMachines.map((m) => ({
        machine: m,
        variant: null,
        issues: [],
      }));
    }
  }

  const scored = scoreCandidates(candidates, answers);
  const ranked = rankCandidates(scored);

  const status = usedFallback && ranked.length === 0 ? "no-match" : statusFor(ranked);

  const recommendations = ranked.slice(0, 3).map((candidate) => {
    const { machine, variant } = candidate;
    const price = variant?.priceCents ?? machine.commercial.regularPriceCents;
    const reasons: string[] = [];
    const reasonCodes: ReasonCode[] = [];
    const caveats: string[] = [];

    if (candidate.score.routine > 0) {
      reasonCodes.push("family-match");
      reasons.push(reasonText("family-match"));
    }
    if (candidate.score.priority > 0) {
      reasonCodes.push("application-match");
      reasons.push(reasonText("application-match"));
    }
    if (candidate.score.environment > 0) {
      reasonCodes.push("power-confirmed");
      reasons.push(reasonText("power-confirmed"));
    }
    if (candidate.score.investment > 0 && price !== null) {
      reasonCodes.push("within-budget");
      reasons.push(reasonText("within-budget"));
    }

    const state = variant?.commercialState ?? machine.commercial.state;
    if (state === "buyable") {
      reasonCodes.push("buyable");
      reasons.push(reasonText("buyable"));
    } else if (state === "quote") {
      reasonCodes.push("quote-required");
      reasons.push(reasonText("quote-required"));
    } else if (state === "unavailable") {
      reasonCodes.push("stock-unavailable");
      reasons.push(reasonText("stock-unavailable"));
    }

    if (reasons.length === 0) {
      reasonCodes.push("no-evidence");
      reasons.push(reasonText("no-evidence"));
    }

    if (!variant && machine.variants.length > 0) {
      caveats.push("Versão a confirmar: não há SKU de voltagem validado no catálogo.");
    }
    if (state === "review") {
      caveats.push("Dados comerciais pendentes de validação pela equipe.");
    }

    const mainReason = reasons[0] || "Ideal para o seu uso informado no quiz.";
    const descriptionPersuasiva = machine.descriptionText
      ? `${machine.descriptionText} ${mainReason}`
      : mainReason;

    return {
      productId: machine.id,
      productUrl: machine.productUrl,
      variantId: variant?.id ?? null,
      name: machine.name,
      model: machine.model,
      brand: machine.brand,
      descriptionText: descriptionPersuasiva,
      imageUrl: machine.imageUrl,
      reasonCodes,
      reasons,
      caveats,
      priceCents: price ?? null,
      commercialState: state,
    };
  });

  const reviewReasons: string[] = [];
  if (status === "needs-review") {
    reviewReasons.push("Não há opção com preço e estoque confirmados para compra direta.");
  }
  if (status === "no-match") {
    reviewReasons.push(
      "Nenhuma máquina do catálogo atende a todos os filtros obrigatórios com as respostas informadas.",
    );
  }

  return {
    status,
    catalogVersion: CATALOG_VERSION,
    rulesVersion: RULES_VERSION,
    evaluatedAt: new Date().toISOString(),
    recommendations,
    reviewReasons,
  };
}
