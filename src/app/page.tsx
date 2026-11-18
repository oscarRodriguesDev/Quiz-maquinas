import Link from "next/link";

/* Logo Kärcher — fundo transparente, portal de marketing da marca */
const KARCHER_LOGO_URL =
  "https://mktkarcher.com.br/download/105/institucionais/1_lVImt0Itud1YA6owcH5VBFyjSULRZMj/LOGO%20KARCHER%20FUNDO%20TRANSPARENTE%20BAIXA.png";

export default function Home() {
  return (
    <main className="flex-1 w-full flex-col items-center justify-center bg-surface px-6 pt-6 pb-16 sm:pt-10 sm:pb-20 lg:pb-24">
      <div className="max-w-4xl flex flex-col items-center justify-center gap-8 text-center sm:gap-10 sm:text-left sm:items-start">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <img
            src={KARCHER_LOGO_URL}
            alt="Kärcher"
            width="100"
            height="34"
            className="h-8 w-auto object-contain sm:h-10 sm:w-auto"
            loading="eager"
          />
          <span className="font-klean font-[900] text-brand-ink text-xs sm:text-sm uppercase tracking-tight">
            Kärcher Center Dikmaq
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-[30px] sm:text-[40px] lg:text-[48px] font-[900] tracking-[-1px] text-brand-ink leading-tight">
            Encontre a máquina ideal para sua limpeza.
          </h1>
          <p className="text-balance text-lg sm:text-xl leading-relaxed text-text-secondary">
            Responda algumas perguntas sobre sua rotina e conheça as opções que
            combinam com o que você precisa.
          </p>
          <p className="text-sm text-text-muted">
            De 8 a 10 perguntas ・ Sem cadastro ・ Sem compromisso
          </p>
        </div>

        <Link
          href="/quiz"
          className="flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-4 text-brand-ink font-[800] text-base uppercase tracking-tight transition-colors hover:bg-brand-yellow-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
        >
          Encontrar minha máquina
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
            <path d="m 5 5 14 14" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
