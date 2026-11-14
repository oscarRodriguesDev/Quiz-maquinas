import { NextResponse } from "next/server";
import { validateAnswers } from "@/lib/quiz/schema";
import { loadCatalog } from "@/lib/catalog/load";
import { recommend } from "@/lib/recommendations/engine";

const QUESTIONNAIRE_VERSION = "quiz-1";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const { answers, questionnaireVersion } = body as {
    answers?: unknown;
    questionnaireVersion?: string;
  };

  if (questionnaireVersion !== QUESTIONNAIRE_VERSION) {
    return NextResponse.json(
      { error: "Versão do questionário incompatível." },
      { status: 409 },
    );
  }

  const validation = validateAnswers(answers);
  if (!validation.valid || !validation.answers) {
    return NextResponse.json(
      { error: "Respostas inválidas.", details: validation.errors },
      { status: 400 },
    );
  }

  let machines;
  try {
    const catalog = await loadCatalog();
    machines = catalog.machines;
  } catch (err) {
    return NextResponse.json(
      { error: (err as { message?: string }).message || "Catálogo indisponível." },
      { status: 503 },
    );
  }

  const result = recommend(machines, validation.answers);
  return NextResponse.json(result, { status: 200 });
}
