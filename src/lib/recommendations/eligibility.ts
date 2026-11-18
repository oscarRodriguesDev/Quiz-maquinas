import type {
  CommercialState,
  Machine,
  QuizAnswers,
  Variant,
} from "../../types/catalog";

export interface EligibilityIssue {
  machineId: string;
  code: string;
  message: string;
}

export interface EligibleCandidate {
  machine: Machine;
  variant: Variant | null;
  issues: EligibilityIssue[];
}

const BUYABLE_STATES: CommercialState[] = ["buyable", "quote"];

/** Subtypes que NÃO devem aparecer como recomendação de máquina completa no quiz. */
const EXCLUDED_SUBTYPES = new Set([
  "Peças e Acessórios",
  "Acessórios",
  "Detergente",
]);

/** Filtros obrigatórios antes de pontuar (seção 6.1 dos requisitos). */
export function filterEligible(
  machines: Machine[],
  answers: QuizAnswers,
): EligibleCandidate[] {
  const candidates: EligibleCandidate[] = [];

  for (const machine of machines) {
    const issues: EligibilityIssue[] = [];

    // 1. Máquina completa aprovada para o quiz.
    if (!machine.isCompleteMachine) {
      issues.push({
        machineId: machine.id,
        code: "not-complete-machine",
        message: "Não é uma máquina completa.",
      });
    }
    if (machine.quizStatus !== "approved") {
      issues.push({
        machineId: machine.id,
        code: "quiz-not-approved",
        message: "Máquina sem aprovação técnica para o quiz.",
      });
    }

    // 2. Excluir peças, acessórios e categorias que não são máquinas completas recomendáveis.
    if (EXCLUDED_SUBTYPES.has(machine.subtype)) {
      issues.push({
        machineId: machine.id,
        code: "excluded-subtype",
        message: `Categoria "${machine.subtype}" não é recomendável no quiz.`,
      });
    }

    // 3. Família compatível com o objetivo (Q1).
    if (machine.family !== answers.goal) {
      issues.push({
        machineId: machine.id,
        code: "family-mismatch",
        message: `Família ${machine.family} não corresponde ao objetivo ${answers.goal}.`,
      });
    }

    // 6. Visibilidade e situação comercial válidas.
    if (!machine.commercial.visible || !machine.commercial.enabled) {
      issues.push({
        machineId: machine.id,
        code: "not-visible",
        message: "Máquina não está visível ou habilitada na loja.",
      });
    }
    if (machine.commercial.state === "hidden") {
      issues.push({
        machineId: machine.id,
        code: "hidden",
        message: "Máquina oculta do quiz.",
      });
    }

    // Variante compatível com energia/tensão/fase (Q6).
    let compatibleVariant: Variant | null = null;
    for (const variant of machine.variants) {
      const powerOk =
        variant.powerSource.value === "mains" ||
        variant.powerSource.value === null;
      const [voltage] = answers.power.split("-");
      const voltageOk =
        variant.voltage.value === null ||
        variant.voltage.value === "none" ||
        variant.voltage.value === "bivolt" ||
        variant.voltage.value === voltage ||
        answers.power === "both-single" ||
        answers.power === "unknown";
      const phaseOk =
        variant.phase.value === null ||
        variant.phase.value === "none" ||
        answers.power === "unknown" ||
        (answers.power === "three-phase"
          ? variant.phase.value === "three"
          : variant.phase.value !== "three");
      if (powerOk && voltageOk && phaseOk) {
        compatibleVariant = variant;
        break;
      }
    }
    if (!compatibleVariant && machine.variants.length > 0) {
      issues.push({
        machineId: machine.id,
        code: "power-incompatible",
        message: "Nenhuma versão compatível com a alimentação informada.",
      });
    }

    // 7. Preço dentro do teto, se houver preço e teto definidos.
    if (
      answers.budget !== "open" &&
      compatibleVariant &&
      compatibleVariant.priceCents !== null &&
      compatibleVariant.priceCents > answers.budget
    ) {
      issues.push({
        machineId: machine.id,
        code: "over-budget",
        message: "Preço acima do teto informado.",
      });
    }

    if (issues.length === 0) {
      candidates.push({ machine, variant: compatibleVariant, issues: [] });
    }
  }

  return candidates;
}

export function commercialStateOf(candidate: EligibleCandidate): CommercialState {
  if (candidate.variant) {
    return candidate.variant.commercialState;
  }
  return candidate.machine.commercial.state;
}

export function isBuyable(candidate: EligibleCandidate): boolean {
  return BUYABLE_STATES.includes(commercialStateOf(candidate));
}
