import Link from "next/link";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ResponsiveBanner } from "@/components/ui/ResponsiveBanner";

const PORTABLE_URL =
  "https://www.karcher-center-dikmaq.com.br/lavadoras-de-alta-pressao-portatil-karcher";
const SWEEPER_URL =
  "https://www.karcher-center-dikmaq.com.br/varredeira-manual-7015";
const FLOOR_URL =
  "https://www.karcher-center-dikmaq.com.br/lavadoras-automaticas-de-piso/uso-residencial/limpadora-de-piso-fc-7-bateria";

const highlights = [
  {
    title: "Revenda oficial Kärcher",
    icon: (
      <path d="M12 2 3 7v6c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7l-9-5Z" />
    ),
  },
  {
    title: "Atendimento especializado",
    icon: (
      <>
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M18 19a2 2 0 0 1-2 2h-2" />
        <rect x="2" y="14" width="4" height="6" rx="1" />
        <rect x="18" y="14" width="4" height="6" rx="1" />
      </>
    ),
  },
  {
    title: "Produtos originais",
    icon: (
      <>
        <path d="m9 12 2 2 4-4" />
        <path d="M12 2 3 7v6c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7l-9-5Z" />
      </>
    ),
  },
  {
    title: "Compra na loja Dikmaq",
    icon: (
      <>
        <path d="M3 9 4.5 3h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  },
];

const steps = [
  {
    title: "Conte sua rotina",
    text: "Responda de 8 a 10 perguntas sobre o ambiente, o volume de uso e o seu investimento.",
  },
  {
    title: "Receba a recomendação",
    text: "Mostramos uma máquina principal e até duas alternativas compatíveis com o seu perfil.",
  },
  {
    title: "Confira na loja",
    text: "Abra a página da máquina na loja Kärcher Center Dikmaq e confirme preço e disponibilidade.",
  },
];

const categories = [
  {
    title: "Lavagem de alta pressão",
    text: "Fachadas, veículos, quintais e calçadas.",
    image:
      "https://images.tcdn.com.br/img/img_prod/1276888/lavadora_de_alta_pressao_karcher_portatil_521_1_5f0e3b7b90abffaccd43d2182952d556.jpg",
    imageAlt: "Lavadora de alta pressão portátil Kärcher",
    href: PORTABLE_URL,
  },
  {
    title: "Varrição de áreas amplas",
    text: "Estacionamentos, galpões e áreas externas.",
    image:
      "https://images.tcdn.com.br/img/img_prod/1276888/varredeira_manual_7020_c_twin_1_20260820145625_a65a615fe3b5.jpg",
    imageAlt: "Varredeira manual Kärcher KM 70/15",
    href: SWEEPER_URL,
  },
  {
    title: "Limpeza de pisos",
    text: "Mais praticidade na rotina da casa ou do negócio.",
    image:
      "https://images.tcdn.com.br/img/img_prod/1276888/limpadora_de_piso_fc_7_bateria_505_1_e8f2032470026e7ebbcf9c7fc07accb7.jpg",
    imageAlt: "Limpadora de piso FC 7 bateria",
    href: FLOOR_URL,
  },
  {
    title: "Aspiração e limpeza úmida",
    text: "Poeira, líquidos e resíduos em casa ou na empresa.",
    image:
      "https://images.tcdn.com.br/img/img_prod/1276888/aspirador_de_po_e_liquidos_nt_2000_253_1_d7cca03d66406c170b3dc0edb5faa347.jpg",
    imageAlt: "Aspirador de pó e líquidos NT 2000",
    href: "https://www.karcher-center-dikmaq.com.br/aspirador-de-po-e-liquidos-nt-2000",
  },
];

export default function Home() {
  return (
    <div className="flex w-full flex-col bg-surface">
      <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <HeroCarousel />
      </section>

      <section className="mt-8 border-y border-border-soft bg-surface-muted sm:mt-10">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-4 py-5 sm:px-6 lg:grid-cols-4 lg:px-8">
          {highlights.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-ink">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
              </span>
              <span className="text-xs font-[800] uppercase leading-tight tracking-tight text-brand-ink sm:text-sm">
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-brand-yellow px-3 py-1 text-[11px] font-[800] uppercase tracking-wider text-brand-ink">
              Quiz de máquinas
            </span>

            <h1 className="mt-4 text-balance text-[34px] font-[900] leading-[1.05] tracking-[-1.5px] text-brand-ink sm:text-[44px] lg:text-[52px]">
              Encontre a máquina ideal para a sua limpeza.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Responda algumas perguntas sobre a sua rotina e descubra as
              máquinas Kärcher que combinam com o que você precisa — sem
              cadastro e sem compromisso.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-brand-ink sm:text-base">
              {[
                "Uma recomendação principal e até duas alternativas compatíveis",
                "Respostas sobre ambiente, frequência de uso e investimento",
                "Link direto para conferir a máquina na loja",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    width="18"
                    height="18"
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
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-yellow px-6 py-4 text-base font-[800] uppercase tracking-tight text-brand-ink shadow-sm transition-colors hover:bg-brand-yellow-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
              >
                Descobrir minha máquina
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
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
              <span className="text-xs font-[700] uppercase tracking-wide text-text-muted">
                Leva menos de 2 minutos
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand-yellow/45 blur-2xl"
            />
            <a
              href={PORTABLE_URL}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-offset-4"
              aria-label="Conhecer a lavadora de alta pressão portátil Kärcher na loja"
            >
              <ResponsiveBanner
                desktopSrc="/images/banner-mobile1.webp"
                mobileSrc="/images/banner-mobile1.webp"
                alt="Lavadora de alta pressão portátil Kärcher em uso em uma área externa"
                className="aspect-[425/495] rounded-2xl border border-border shadow-xl transition-opacity hover:opacity-95"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-brand-ink py-14 text-white sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-[800] uppercase tracking-[0.2em] text-brand-yellow">
              Como funciona
            </p>
            <h2 className="mt-3 text-balance text-[28px] font-[900] leading-tight tracking-[-1px] sm:text-[36px]">
              Três passos até a máquina certa
            </h2>
          </div>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, stepIndex) => (
              <li
                key={step.title}
                className="border-t border-white/15 pt-6"
              >
                <span className="text-4xl font-[900] leading-none text-brand-yellow">
                  0{stepIndex + 1}
                </span>
                <h3 className="mt-4 text-lg font-[800] tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-[800] uppercase tracking-[0.2em] text-accent">
              Soluções Kärcher
            </p>
            <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-[900] leading-tight tracking-[-1px] text-brand-ink sm:text-[36px]">
              Uma máquina para cada tipo de limpeza
            </h2>
          </div>
          <Link
            href="/quiz"
            className="inline-flex w-fit items-center gap-2 text-sm font-[800] uppercase tracking-tight text-brand-ink underline decoration-brand-yellow decoration-4 underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2"
          >
            Encontrar a minha
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
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.title}
              href={category.href}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-opacity-25"
              aria-label={`${category.title} na loja`}
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-border-soft bg-surface-muted p-5">
                <img
                  src={category.image}
                  alt={category.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="text-sm font-[800] leading-snug text-brand-ink sm:text-base">
                  {category.title}
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {category.text}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-brand-ink/10 bg-brand-yellow px-6 py-10 text-center sm:px-12 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[18px] border-brand-ink/5"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full border-[22px] border-brand-ink/5"
          />
          <h2 className="relative text-balance text-[28px] font-[900] leading-tight tracking-[-1px] text-brand-ink sm:text-[38px]">
            Pronto para encontrar a sua máquina?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-ink/75 sm:text-base">
            Responda ao quiz e receba uma recomendação personalizada da Kärcher
            Center Dikmaq em poucos minutos.
          </p>
          <Link
            href="/quiz"
            className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-lg border border-brand-ink bg-brand-ink px-6 py-4 text-base font-[800] uppercase tracking-tight text-brand-yellow transition-colors hover:bg-brand-ink/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-ink focus-visible:ring-offset-2"
          >
            Fazer o quiz agora
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
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
