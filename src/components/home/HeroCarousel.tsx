"use client";

import { useCallback, useEffect, useState } from "react";
import { ResponsiveBanner } from "@/components/ui/ResponsiveBanner";

const STORE_URL = "https://www.karcher-center-dikmaq.com.br";
const PORTABLE_URL =
  "https://www.karcher-center-dikmaq.com.br/lavadoras-de-alta-pressao-portatil-karcher";
const SWEEPER_URL =
  "https://www.karcher-center-dikmaq.com.br/varredeira-manual-7015";

interface Slide {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  href: string;
}

const slides: Slide[] = [
  {
    desktopSrc: "/images/banner-horizontal1.webp",
    mobileSrc: "/images/banner-mobile4.webp",
    alt: "Líder mundial em soluções de limpeza — conheça as máquinas Kärcher",
    href: STORE_URL,
  },
  {
    desktopSrc: "/images/banner-horizontal3.webp",
    mobileSrc: "/images/banner-mobile1.webp",
    alt: "Kärcher Portátil — limpeza rápida e sem esforço para as tarefas do dia a dia",
    href: PORTABLE_URL,
  },
  {
    desktopSrc: "/images/banner-horizontal4.webp",
    mobileSrc: "/images/banner-mobile2.webp",
    alt: "Varredeira compacta KM 70/15 C — facilidade para alta produtividade",
    href: SWEEPER_URL,
  },
  {
    desktopSrc: "/images/banner-horizontal2.webp",
    mobileSrc: "/images/banner-mobile3.webp",
    alt: "Combos especiais e limpadoras de piso Kärcher",
    href: STORE_URL,
  },
];

const AUTOPLAY_MS = 6500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const isPaused = paused || hovered || focused || reduceMotion;

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [isPaused, index]);

  const goTo = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, []);

  const slide = slides[index];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques Kärcher Center Dikmaq"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <div className="relative">
        <a
          key={index}
          href={slide.href}
          className="block animate-hero-fade focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-inset"
          aria-label={slide.alt}
        >
          <ResponsiveBanner
            desktopSrc={slide.desktopSrc}
            mobileSrc={slide.mobileSrc}
            alt={slide.alt}
            className="aspect-[425/495] md:aspect-[10/3]"
            priority={index === 0}
          />
        </a>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border-soft bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-brand-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2"
            aria-label="Destaque anterior"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-brand-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2"
            aria-label="Próximo destaque"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div
            className="ml-1 flex items-center gap-2"
            role="group"
            aria-label="Escolher destaque"
          >
            {slides.map((item, dotIndex) => (
              <button
                key={item.desktopSrc}
                type="button"
                onClick={() => goTo(dotIndex)}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2 ${
                  dotIndex === index
                    ? "w-7 bg-brand-ink"
                    : "w-2.5 bg-border hover:bg-text-muted"
                }`}
                aria-label={`Ir para o destaque ${dotIndex + 1}: ${item.alt}`}
                aria-current={dotIndex === index ? "true" : undefined}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-[700] tabular-nums text-text-muted sm:inline">
            {index + 1} / {slides.length}
          </span>

          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setPaused((current) => !current)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-brand-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2"
              aria-label={
                paused ? "Retomar rotação automática" : "Pausar rotação automática"
              }
            >
              {paused ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live={isPaused ? "polite" : "off"}>
        Destaque {index + 1} de {slides.length}: {slide.alt}
      </p>
    </div>
  );
}
