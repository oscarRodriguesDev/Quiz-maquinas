import type { Family, QuizAnswers } from "../../types/catalog";
import type { QuestionId } from "./questions";

export const BUDGET_IDS: Record<string, number> = {
  "500": 50000,
  "1000": 100000,
  "2000": 200000,
  "3500": 350000,
  "6000": 600000,
  "15000": 1500000,
};

export const CONTEXTS: ("home" | "business" | "service" | "industrial")[] = [
  "home",
  "business",
  "service",
  "industrial",
];

export const FREQUENCIES: ("occasional" | "weekly" | "daily" | "extended")[] = [
  "occasional",
  "weekly",
  "daily",
  "extended",
];

export const POWER_MODES: string[] = [
  "127-single",
  "220-single",
  "both-single",
  "three-phase",
  "off-grid",
  "unknown",
];

export const PRIORITIES: string[] = [
  "economy",
  "mobility",
  "capacity",
  "quiet",
  "automation",
  "cordless",
];

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  answers?: QuizAnswers;
}

export function validateAnswers(raw: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: [{ path: "root", message: "Corpo inválido." }] };
  }

  const obj = raw as Record<string, unknown>;

  const goal = obj.goal;
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
  if (!validFamilies.includes(goal as Family)) {
    errors.push({ path: "goal", message: "Objetivo inválido." });
  }

  const context = obj.context;
  if (!CONTEXTS.includes(context as any)) {
    errors.push({ path: "context", message: "Contexto inválido." });
  }

  const frequency = obj.frequency;
  if (!FREQUENCIES.includes(frequency as any)) {
    errors.push({ path: "frequency", message: "Frequência inválida." });
  }

  if (typeof obj.surface !== "string" || obj.surface.length === 0) {
    errors.push({ path: "surface", message: "Superfície é obrigatória." });
  }

  if (typeof obj.workload !== "string" || obj.workload.length === 0) {
    errors.push({ path: "workload", message: "Carga de trabalho é obrigatória." });
  }

  if (!POWER_MODES.includes(obj.power as string)) {
    errors.push({ path: "power", message: "Alimentação inválida." });
  }

  if (!PRIORITIES.includes(obj.priority as string)) {
    errors.push({ path: "priority", message: "Prioridade inválida." });
  }

  let budget: number | "open" = "open";
  if (obj.budget === "open") {
    budget = "open";
  } else if (typeof obj.budget === "string" && BUDGET_IDS[obj.budget] !== undefined) {
    budget = BUDGET_IDS[obj.budget];
  } else if (typeof obj.budget === "number") {
    budget = obj.budget;
  } else {
    errors.push({ path: "budget", message: "Orçamento inválido." });
  }

  const checks = obj.checks;
  if (!checks || typeof checks !== "object" || Array.isArray(checks)) {
    errors.push({ path: "checks", message: "Verificações são obrigatórias." });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    answers: {
      goal: goal as Family,
      context: context as any,
      frequency: frequency as any,
      surface: obj.surface as string,
      workload: obj.workload as string,
      power: obj.power as string,
      priority: obj.priority as string,
      budget,
      checks: (checks as Record<string, string>) ?? {},
    },
  };
}

export function requiredQuestionIds(family: Family): QuestionId[] {
  return ["goal", "context", "frequency", "surface", "workload", "power", "priority", "budget"];
}
