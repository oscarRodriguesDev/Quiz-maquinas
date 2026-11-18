"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Logo Kärcher — fundo transparente, disponível no portal de marketing da marca */
const KARCHER_LOGO_URL =
  "https://mktkarcher.com.br/download/105/institucionais/1_lVImt0Itud1YA6owcH5VBFyjSULRZMj/LOGO%20KARCHER%20FUNDO%20TRANSPARENTE%20BAIXA.png";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/quiz", label: "Quiz de máquinas" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Kärcher Center Dikmaq — página inicial"
          >
            <img
              src={KARCHER_LOGO_URL}
              alt="Kärcher"
              width="120"
              height="40"
              className="h-10 w-auto object-contain"
              loading="eager"
            />
            <span className="font-klean font-[900] text-brand-ink tracking-tight text-sm sm:text-base uppercase">
              Kärcher Center Dikmaq
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-[700] uppercase tracking-tight">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-base transition-colors ${
                  pathname === link.href
                    ? "bg-brand-yellow text-brand-ink"
                    : "text-text-secondary hover:text-brand-ink hover:bg-surface-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/quiz"
              className="flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-yellow px-5 py-2.5 text-brand-ink font-[800] text-sm uppercase tracking-tight transition-colors hover:bg-brand-yellow-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
            >
              Encontrar minha máquina
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
              >
                <path d="m 5 5 14 14" />
              </svg>
            </Link>
          </div>

          {/* Botão de menu mobile */}
          <button className="md:hidden flex items-center justify-center p-2 text-brand-ink hover:bg-surface-muted rounded-lg transition-colors" aria-label="Abrir menu">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
