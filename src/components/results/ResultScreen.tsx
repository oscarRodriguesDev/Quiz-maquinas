"use client";

import { useState, type ReactNode } from "react";
import type {
  Family,
  RecommendationItem,
  RecommendationResult,
} from "@/types/catalog";
import {
  QUESTIONS,
  getCheckQuestions,
  getSurfaceOptions,
  getWorkloadOptions,
} from "@/lib/quiz/questions";
import { ExpandableText } from "./ExpandableText";
import { ResponsiveBanner } from "@/components/ui/ResponsiveBanner";

interface ResultScreenProps {
  answers: Record<string, string>;
  result: unknown;
  onRestart: () => void;
}

const STORE_URL = "https://www.karcher-center-dikmaq.com.br";

const QUESTION_LABELS: Record<string, string> = {
  goal: "Objetivo",
  context: "Onde será usada",
  frequency: "Frequência de uso",
  surface: "Ambiente ou material",
  workload: "Volume da rotina",
  power: "Alimentação",
  priority: "Prioridade",
  budget: "Investimento",
};

const COMMERCIAL_STATE_LABELS: Record<string, string> = {
  buyable: "Disponível para compra",
  quote: "Disponível sob orçamento",
  unavailable: "Indisponível no momento",
  hidden: "Indisponível no momento",
  review: "Dados a confirmar",
};

function actionLabelFor(state: string): string {
  if (state === "buyable") return "Ver máquina na loja";
  if (state === "quote") return "Solicitar orçamento";
  return "Confirmar com um especialista";
}

function buildOptionLabels(family: Family | null, answers: Record<string, string>) {
  const labels = new Map<string, string>();
  for (const question of QUESTIONS) {
    for (const option of question.options) {
      labels.set(`${question.id}:${option.id}`, option.label);
    }
  }
  if (family) {
    for (const option of getSurfaceOptions(family)) {
      labels.set(`surface:${option.id}`, option.label);
    }
    for (const option of getWorkloadOptions(family)) {
      labels.set(`workload:${option.id}`, option.label);
    }
    for (const check of getCheckQuestions(family, answers)) {
      for (const option of check.options) {
        labels.set(`${check.id}:${option.id}`, option.label);
      }
    }
  }
  return labels;
}

function describeAnswers(answers: Record<string, string>) {
  const family = (answers.goal as Family | undefined) ?? null;
  const optionLabels = buildOptionLabels(family, answers);
  const checkTitles = new Map<string, string>();
  if (family) {
    for (const check of getCheckQuestions(family, answers)) {
      checkTitles.set(check.id, check.title);
    }
  }

  const rows: { label: string; value: string }[] = [];
  for (const [key, value] of Object.entries(answers)) {
    if (!value) continue;
    const label = key.startsWith("check-")
      ? (checkTitles.get(key) ?? "Verificação")
      : QUESTION_LABELS[key];
    if (!label) continue;
    rows.push({
      label,
      value: optionLabels.get(`${key}:${value}`) ?? value,
    });
  }
  return rows;
}

function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-muted px-4 text-center">
        <span className="text-xs text-text-muted">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-yellow px-5 py-3 text-brand-ink font-[800] text-sm uppercase tracking-tight transition-colors hover:bg-brand-yellow-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
    >
      {children}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
      </svg>
    </a>
  );
}

function StoreAction({ item }: { item: RecommendationItem }) {
  if (!item.productUrl) {
    return (
      <span className="text-xs font-[700] text-text-muted">
        Fale com um especialista para conhecer esta máquina.
      </span>
    );
  }
  return (
    <PrimaryButton href={item.productUrl}>
      {actionLabelFor(item.commercialState)}
    </PrimaryButton>
  );
}

function ReasonsList({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null;
  return (
    <div>
      <h4 className="text-[11px] font-[800] uppercase tracking-wider text-text-muted">
        Por que indicamos
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm text-brand-ink">
        {reasons.slice(0, 3).map((reason, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Caveats({ caveats }: { caveats: string[] }) {
  if (caveats.length === 0) return null;
  return (
    <div className="rounded-md border-l-2 border-[#B45309] bg-[#FFFBEB] px-3 py-2 text-xs leading-relaxed text-[#7C2D12]">
      {caveats.join(" ")}
    </div>
  );
}

function StateBadge({ state }: { state: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-muted px-2.5 py-1 text-[11px] font-[700] text-text-secondary">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          state === "buyable" ? "bg-accent" : "bg-text-secondary"
        }`}
      />
      {COMMERCIAL_STATE_LABELS[state] ?? "Dados a confirmar"}
    </span>
  );
}

function PrimaryCard({ item }: { item: RecommendationItem }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col lg:flex-row">
        <div className="flex items-center justify-center border-b border-border-soft bg-white p-4 sm:p-6 lg:w-[42%] lg:border-b-0 lg:border-r lg:p-8">
          <div className="aspect-[4/3] w-full">
            <ProductImage
              src={item.imageUrl}
              alt={`${item.name} ${item.model}`}
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-7">
          <span className="inline-flex w-fit items-center rounded-full border border-brand-ink bg-brand-yellow px-3 py-1 text-[11px] font-[800] uppercase tracking-wider text-brand-ink">
            Recomendação principal
          </span>

          <div>
            <h2 className="text-xl font-[900] leading-snug tracking-tight text-brand-ink sm:text-2xl">
              {item.name}
              {item.model ? ` — ${item.model}` : ""}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {item.brand}
              {item.productId ? ` • Referência ${item.productId}` : ""}
              {item.variantId ? ` • Versão ${item.variantId}` : ""}
            </p>
          </div>

          <div>
            <h4 className="mb-1 text-[11px] font-[800] uppercase tracking-wider text-text-muted">
              Sobre a máquina
            </h4>
            <ExpandableText text={item.descriptionText} collapsedLines={4} />
          </div>

          <ReasonsList reasons={item.reasons} />
          <Caveats caveats={item.caveats} />

          <div className="mt-auto flex flex-col gap-3 border-t border-border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
            <StateBadge state={item.commercialState} />
            <StoreAction item={item} />
          </div>
        </div>
      </div>
    </article>
  );
}

function AlternativeCard({ item }: { item: RecommendationItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-[4/3] w-full border-b border-border-soft bg-white p-4">
        <ProductImage
          src={item.imageUrl}
          alt={`${item.name} ${item.model}`}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-[800] leading-snug text-brand-ink">
            {item.name}
            {item.model ? ` — ${item.model}` : ""}
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            {item.brand}
            {item.productId ? ` • Referência ${item.productId}` : ""}
          </p>
        </div>

        <ExpandableText text={item.descriptionText} collapsedLines={3} />

        <ReasonsList reasons={item.reasons} />
        <Caveats caveats={item.caveats} />

        <div className="mt-auto flex flex-col gap-3 border-t border-border-soft pt-4">
          <StateBadge state={item.commercialState} />
          <StoreAction item={item} />
        </div>
      </div>
    </article>
  );
}

function AnswerSummary({ answers }: { answers: Record<string, string> }) {
  const rows = describeAnswers(answers);
  if (rows.length === 0) return null;

  return (
    <details className="group rounded-xl border border-border bg-surface-muted">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-[800] text-brand-ink marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        Resumo das suas respostas
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <dl className="grid gap-x-8 gap-y-3 border-t border-border px-5 py-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <dt className="text-xs uppercase tracking-wide text-text-muted">
              {row.label}
            </dt>
            <dd className="text-sm font-[700] text-brand-ink sm:text-right">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function ResultScreen({ answers, result, onRestart }: ResultScreenProps) {
  const rec = result as RecommendationResult | null;
  const items = rec?.recommendations ?? [];
  const [main, ...alternatives] = items;
  const hasItems = Boolean(main) && rec?.status !== "no-match";

  return (
    <section className="flex flex-1 w-full flex-col bg-white p-6 sm:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <p className="text-[11px] font-[800] uppercase tracking-[0.2em] text-accent">
            Resultado do quiz
          </p>
          <h1 className="mt-1 text-[30px] font-[900] tracking-[-1px] text-brand-ink sm:text-[40px]">
            Resultado da sua busca
          </h1>
        </div>

        {!hasItems ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="mb-3 flex items-start gap-3">
              <span className="shrink-0 text-red-500">⚠</span>
              <h3 className="font-[800] text-base text-brand-ink">
                Nenhuma máquina encontrada
              </h3>
            </div>
            <p className="mb-2 text-brand-ink">
              {rec?.reviewReasons?.[0] ||
                "Não há máquina no catálogo que atenda a todos os filtros com as respostas informadas."}
            </p>
            <p className="mt-2 text-text-secondary">
              Tente alterar algumas respostas (por exemplo, orçamento, frequência de uso ou
              alimentação) e refazer o quiz, ou fale com um especialista para uma indicação
              personalizada.
            </p>
            <button
              className="mt-6 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 font-[800] text-base text-brand-ink transition-colors hover:bg-brand-yellow-dark"
              onClick={onRestart}
            >
              Descobrir outra máquina
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <p className="text-base text-text-secondary sm:text-lg">
              Esta é a máquina que mais combina com o que você respondeu
              {alternatives.length > 0
                ? ", com opções compatíveis logo abaixo."
                : "."}
            </p>

            <PrimaryCard item={main} />

            {alternatives.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-[800] uppercase tracking-wider text-text-muted">
                  Outras opções compatíveis
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {alternatives.map((item) => (
                    <AlternativeCard key={item.productId} item={item} />
                  ))}
                </div>
              </div>
            )}

            <AnswerSummary answers={answers} />

            <p className="text-xs text-text-muted">
              Confirme preço e disponibilidade na loja antes de finalizar a compra.
            </p>

            <div>
              <button
                className="w-full rounded-lg border border-brand-ink bg-brand-yellow px-6 py-3 font-[800] text-base text-brand-ink transition-colors hover:bg-brand-yellow-dark sm:w-auto"
                onClick={onRestart}
              >
                Descobrir outra máquina
              </button>
            </div>
          </div>
        )}

        <div className="mt-10">
          <a
            href={STORE_URL}
            className="block overflow-hidden rounded-xl border border-border transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
            aria-label="Conheça as soluções Kärcher na loja"
          >
            <ResponsiveBanner
              desktopSrc="/images/banner-horizontal2.webp"
              mobileSrc="/images/banner-mobile4.webp"
              alt="Soluções Kärcher para deixar a rotina de limpeza mais prática"
              className="aspect-[425/495] md:aspect-[10/3]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
