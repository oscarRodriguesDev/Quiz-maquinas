import type { Family } from "../../types/catalog";
import type { QuestionId } from "./questions";
import {
  BASE_QUESTION_IDS,
  MAX_EFFECTIVE_QUESTIONS,
  getCheckQuestions,
  QUESTIONS,
} from "./questions";

export interface FlowStep {
  questionId: QuestionId;
  index: number;
  total: number;
  last: boolean;
}

export interface FlowSnapshot {
  completed: boolean;
  next: FlowStep | null;
  steps: FlowStep[];
  answeredCount: number;
}

export function buildFlow(
  family: Family,
  answers: Record<string, string>,
): FlowSnapshot {
  const ordered: QuestionId[] = [...BASE_QUESTION_IDS];

  const checks = getCheckQuestions(family, answers);
  for (const check of checks) {
    ordered.push(check.id as QuestionId);
  }

  // Limite rígido: no máximo 10 perguntas efetivamente exibidas por sessão.
  const capped = ordered.slice(0, MAX_EFFECTIVE_QUESTIONS);

  const steps: FlowStep[] = capped.map((id, i) => ({
    questionId: id,
    index: i + 1,
    total: capped.length,
    last: i === capped.length - 1,
  }));

  const answeredIds = Object.keys(answers);
  const answeredCount = steps.filter((s) => answeredIds.includes(s.questionId))
    .length;

  const next = steps.find((s) => !answeredIds.includes(s.questionId)) ?? null;

  return {
    completed: next === null,
    next,
    steps,
    answeredCount,
  };
}

export function questionById(questionId: QuestionId) {
  return QUESTIONS.find((q) => q.id === questionId);
}

export function clearsOnChange(questionId: QuestionId): QuestionId[] {
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q?.clears ?? [];
}
