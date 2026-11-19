"use client";

import { useId, useState } from "react";

interface ExpandableTextProps {
  text: string;
  /** Linhas visíveis quando recolhido. */
  collapsedLines?: 3 | 4;
  className?: string;
}

/**
 * Texto longo com corte visual e botão "Ler mais".
 * O corte é apenas visual (line-clamp): o conteúdo completo segue no DOM,
 * acessível por leitores de tela e pela busca do navegador.
 */
export function ExpandableText({
  text,
  collapsedLines = 4,
  className,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const canExpand = text.trim().length > 180;
  const clampClass = collapsedLines === 3 ? "line-clamp-3" : "line-clamp-4";
  const isClamped = canExpand && !expanded;

  return (
    <div className={className}>
      <p
        id={contentId}
        className={`text-sm leading-relaxed text-brand-ink ${
          isClamped ? clampClass : ""
        }`}
      >
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 inline-flex items-center gap-1 rounded-md text-xs font-[800] uppercase tracking-tight text-brand-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:decoration-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {expanded ? "Ler menos" : "Ler mais"}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
