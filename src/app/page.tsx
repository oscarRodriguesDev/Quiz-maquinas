import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center bg-white px-6 pt-12 pb-24 sm:px-8">
      <div className="max-w-2xl flex flex-col items-center justify-center gap-8 text-center sm:text-left sm:items-start">
        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-[30px] sm:text-[40px] lg:text-[48px] font-[900] tracking-[-1px] text-brand-ink leading-tight">
            Encontre a máquina ideal para sua limpeza.
          </h1>
          <p className="text-balance text-lg sm:text-xl leading-relaxed text-ink-secondary">
            Responda algumas perguntas sobre sua rotina e conheça as opções que
            combinam com o que você precisa.
          </p>
          <p className="text-sm text-muted">
            De 8 a 10 perguntas ・ Sem cadastro ・ Sem compromisso
          </p>
        </div>
        <Link
          href="/quiz"
          className="flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-4 text-brand-ink font-[800] text-base uppercase tracking-tight transition-colors hover:bg-[#e6de00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
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
