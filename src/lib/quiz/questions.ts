import type { Family } from "../../types/catalog";

export type QuestionId =
  | "goal"
  | "context"
  | "frequency"
  | "surface"
  | "workload"
  | "power"
  | "priority"
  | "budget"
  | "check-q9"
  | "check-q10";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  help?: string;
  options: QuestionOption[];
  /** Famílias para as quais esta pergunta é exibida. Q4/Q5 mudam por família. */
  families: Family[];
  /** Perguntas que devem ser limpas quando esta resposta muda. */
  clears?: QuestionId[];
  /** Quando obrigatório por família (apenas para verificações condicionais Q9/Q10). */
  requiredFor?: Family[];
}

const surfaceOptions: Record<Family, QuestionOption[]> = {
  pressure: [
    { id: "cars", label: "Veículos leves" },
    { id: "outdoor", label: "Calçadas e quintais" },
    { id: "fleet", label: "Frota ou equipamentos" },
    { id: "industrial", label: "Ambiente industrial" },
  ],
  extraction: [
    { id: "sofa", label: "Sofás e poltronas" },
    { id: "mattress", label: "Colchões" },
    { id: "carpet", label: "Carpetes" },
    { id: "car-seats", label: "Estofados automotivos" },
  ],
  vacuum: [
    { id: "home", label: "Pisos e móveis de casa" },
    { id: "office", label: "Escritórios e lojas" },
    { id: "workshop", label: "Oficinas e manutenção" },
    { id: "carpet", label: "Carpetes" },
  ],
  steam: [
    { id: "floor", label: "Pisos compatíveis com vapor" },
    { id: "kitchen", label: "Cozinha" },
    { id: "bathroom", label: "Banheiro e rejuntes" },
    { id: "mixed", label: "Superfícies variadas" },
  ],
  floor: [
    { id: "home", label: "Piso interno residencial" },
    { id: "commercial", label: "Loja ou escritório" },
    { id: "condominium", label: "Condomínio" },
    { id: "warehouse", label: "Galpão ou grande área" },
  ],
  sweep: [
    { id: "outdoor", label: "Quintal ou calçada" },
    { id: "parking", label: "Estacionamento" },
    { id: "warehouse", label: "Galpão" },
    { id: "urban", label: "Ruas e áreas urbanas" },
  ],
  drain: [
    { id: "flood", label: "Área alagada" },
    { id: "tank", label: "Esvaziamento de reservatório" },
    { id: "other", label: "Outro local" },
  ],
  pet: [
    { id: "dog", label: "Cães" },
    { id: "cat", label: "Gatos" },
    { id: "both", label: "Ambos" },
  ],
};

const workloadOptions: Record<Family, QuestionOption[]> = {
  pressure: [
    { id: "light", label: "Uma tarefa pontual" },
    { id: "medium", label: "Vários veículos ou áreas" },
    { id: "high", label: "Frota ou operação extensa" },
    { id: "unknown", label: "Ainda não sei" },
  ],
  extraction: [
    { id: "personal", label: "Uso próprio, sem atendimentos" },
    { id: "one-two", label: "1 a 2" },
    { id: "three-plus", label: "3 ou mais" },
    { id: "unknown", label: "Ainda não sei" },
  ],
  vacuum: [
    { id: "small", label: "Até 100 m²" },
    { id: "medium", label: "De 101 a 500 m²" },
    { id: "large", label: "Acima de 500 m²" },
    { id: "unknown", label: "Não sei" },
  ],
  steam: [
    { id: "spot", label: "Pontos específicos" },
    { id: "rooms", label: "Um ou poucos ambientes" },
    { id: "many", label: "Vários ambientes na mesma rotina" },
    { id: "unknown", label: "Não sei" },
  ],
  floor: [
    { id: "small", label: "Até 100 m²" },
    { id: "medium", label: "101 a 500 m²" },
    { id: "large", label: "501 a 2.000 m²" },
    { id: "very-large", label: "Mais de 2.000 m²" },
    { id: "unknown", label: "Não sei" },
  ],
  sweep: [
    { id: "small", label: "Até 200 m²" },
    { id: "medium", label: "201 a 1.000 m²" },
    { id: "large", label: "Mais de 1.000 m²" },
    { id: "unknown", label: "Não sei" },
  ],
  drain: [
    { id: "small", label: "Até 1.000 litros" },
    { id: "large", label: "Acima de 1.000 litros" },
    { id: "unknown", label: "Não sei" },
  ],
  pet: [
    { id: "one", label: "Um" },
    { id: "few", label: "Dois ou três" },
    { id: "many", label: "Mais de três" },
    { id: "business", label: "Uso em estabelecimento profissional" },
  ],
};

/**
 * Q7 (priority): a especificação exige mostrar apenas opções que podem existir
 * na família escolhida em Q1. Automação só faz sentido na rota de aspiradores;
 * "sem cabo" só onde o catálogo tem versões a bateria.
 */
const basePriorityOptions: QuestionOption[] = [
  { id: "economy", label: "Menor investimento entre as opções adequadas" },
  { id: "mobility", label: "Facilidade de transportar e guardar" },
  { id: "capacity", label: "Menos interrupções durante a rotina" },
  { id: "quiet", label: "Menor ruído, quando houver dados comparáveis" },
];

const automationPriorityOption: QuestionOption = {
  id: "automation",
  label: "Limpeza automática, disponível na rota de aspiradores",
};

const cordlessPriorityOption: QuestionOption = {
  id: "cordless",
  label: "Liberdade para trabalhar sem cabo, quando aplicável",
};

const priorityOptions: Record<Family, QuestionOption[]> = {
  pressure: [...basePriorityOptions],
  extraction: [...basePriorityOptions],
  vacuum: [...basePriorityOptions, automationPriorityOption, cordlessPriorityOption],
  steam: [...basePriorityOptions],
  floor: [...basePriorityOptions, cordlessPriorityOption],
  sweep: [...basePriorityOptions, cordlessPriorityOption],
  drain: [...basePriorityOptions],
  pet: [...basePriorityOptions, cordlessPriorityOption],
};

export const QUESTIONS: Question[] = [
  {
    id: "goal",
    title: "Qual é a principal tarefa que você quer realizar?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [
      {
        id: "pressure",
        label: "Lavar veículos, calçadas ou áreas externas com jato de água",
      },
      {
        id: "extraction",
        label: "Lavar sofás, colchões, carpetes ou estofados com extração",
      },
      { id: "vacuum", label: "Aspirar sujeira em casa, na empresa ou na oficina" },
      { id: "steam", label: "Limpar superfícies com vapor" },
      {
        id: "floor",
        label: "Esfregar e limpar pisos com máquina",
      },
      {
        id: "sweep",
        label: "Recolher folhas, poeira e resíduos soltos do chão",
      },
      { id: "drain", label: "Retirar água acumulada com uma bomba" },
      { id: "pet", label: "Aspirar pelos durante os cuidados com o pet" },
    ],
    clears: ["surface", "workload", "priority", "check-q9", "check-q10"],
  },
  {
    id: "context",
    title: "Onde e para quem a máquina será usada?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [
      { id: "home", label: "Em casa, para uso próprio." },
      { id: "business", label: "Na limpeza da minha empresa ou condomínio." },
      {
        id: "service",
        label: "Para prestar serviços de limpeza.",
      },
      {
        id: "industrial",
        label: "Em operação industrial, urbana ou de grande porte.",
      },
    ],
  },
  {
    id: "frequency",
    title: "Com que frequência pretende usar a máquina?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [
      { id: "occasional", label: "Algumas vezes por mês" },
      { id: "weekly", label: "Algumas vezes por semana" },
      { id: "daily", label: "Todos os dias" },
      { id: "extended", label: "Por períodos prolongados ou em vários serviços por dia" },
    ],
  },
  {
    id: "surface",
    title: "Qual é o principal ambiente ou material da limpeza?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [],
  },
  {
    id: "workload",
    title: "Qual é o volume aproximado da sua rotina?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [],
  },
  {
    id: "power",
    title: "Qual alimentação você tem disponível no local?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [
      { id: "127-single", label: "Tomada 127 V monofásica" },
      { id: "220-single", label: "Tomada 220 V monofásica" },
      { id: "both-single", label: "Tenho 127 V e 220 V monofásicas" },
      {
        id: "three-phase",
        label: "Rede trifásica, a confirmar",
      },
      { id: "off-grid", label: "Não tenho energia no ponto de trabalho" },
      { id: "unknown", label: "Não sei informar" },
    ],
  },
  {
    id: "priority",
    title: "O que é mais importante para você?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [],
  },
  {
    id: "budget",
    title: "Qual é o seu limite de investimento?",
    families: [
      "pressure",
      "extraction",
      "vacuum",
      "steam",
      "floor",
      "sweep",
      "drain",
      "pet",
    ],
    options: [
      { id: "500", label: "Até R$ 500" },
      { id: "1000", label: "Até R$ 1.000" },
      { id: "2000", label: "Até R$ 2.000" },
      { id: "3500", label: "Até R$ 3.500" },
      { id: "6000", label: "Até R$ 6.000" },
      { id: "15000", label: "Até R$ 15.000" },
      {
        id: "open",
        label: "Sem limite definido / prefiro orçamento",
      },
    ],
  },
];

export function getSurfaceOptions(family: Family): QuestionOption[] {
  return surfaceOptions[family] ?? [];
}

export function getWorkloadOptions(family: Family): QuestionOption[] {
  return workloadOptions[family] ?? [];
}

export function getPriorityOptions(family: Family): QuestionOption[] {
  return priorityOptions[family] ?? [...basePriorityOptions];
}

export interface CheckQuestion {
  id: "check-q9" | "check-q10";
  title: string;
  options: QuestionOption[];
  requiredFor: Family[];
}

const q9Options: Record<Family, QuestionOption[]> = {
  pressure: [
    { id: "tap", label: "Torneira/rede" },
    { id: "tank", label: "Reservatório" },
    { id: "unknown", label: "Não sei" },
  ],
  extraction: [
    { id: "yes", label: "Sim" },
    { id: "no", label: "Não" },
    { id: "unknown", label: "Não sei" },
  ],
  vacuum: [
    { id: "dust", label: "Pó doméstico" },
    { id: "dust-liquid", label: "Pó e líquidos comuns" },
    { id: "fine-dust", label: "Pó fino de obra" },
    { id: "hazardous", label: "Material perigoso ou não identificado" },
  ],
  steam: [
    { id: "yes", label: "Sim" },
    { id: "no", label: "Não" },
    { id: "unknown", label: "Não sei" },
  ],
  floor: [
    { id: "ceramic", label: "Cerâmica/porcelanato" },
    { id: "concrete", label: "Concreto" },
    { id: "wood", label: "Madeira/laminado" },
    { id: "other", label: "Outro/não sei" },
  ],
  sweep: [
    { id: "leaves", label: "Folhas e resíduos soltos" },
    { id: "fine-dust", label: "Poeira fina" },
    { id: "mixed", label: "Misto comum" },
    { id: "hazardous", label: "Perigoso/não identificado" },
  ],
  drain: [
    { id: "clean", label: "Limpa" },
    { id: "particles", label: "Com partículas" },
    { id: "chemicals", label: "Com químicos/resíduos desconhecidos" },
    { id: "unknown", label: "Não sei" },
  ],
  pet: [
    { id: "yes", label: "Sim" },
    { id: "no", label: "Não" },
    { id: "unknown", label: "Não sei" },
  ],
};

const q9Titles: Record<Family, string> = {
  pressure: "Há abastecimento de água no local?",
  extraction: "O material permite limpeza úmida com extração?",
  vacuum: "Qual sujeira será aspirada?",
  steam: "A superfície tem liberação para uso de vapor?",
  floor: "Qual o piso?",
  sweep: "Qual resíduo predomina?",
  drain: "Como é a água?",
  pet: "A principal necessidade é recolher pelos durante escovação/tosa?",
};

const q10Options: Record<Family, QuestionOption[]> = {
  pressure: [
    { id: "no", label: "Não" },
    { id: "yes", label: "Sim" },
    { id: "unknown", label: "Não sei" },
  ],
  extraction: [
    { id: "no", label: "Não" },
    { id: "yes", label: "Sim" },
    { id: "unknown", label: "Não sei" },
  ],
  vacuum: [
    { id: "yes", label: "Sim" },
    { id: "no", label: "Não" },
    { id: "unknown", label: "Não sei" },
  ],
  steam: [
    { id: "yes", label: "Sim" },
    { id: "no", label: "Não" },
    { id: "unknown", label: "Não sei" },
  ],
  floor: [
    { id: "open", label: "Área livre" },
    { id: "corridors", label: "Corredores/obstáculos" },
    { id: "levels", label: "Desníveis/escadas" },
    { id: "unknown", label: "Não sei" },
  ],
  sweep: [
    { id: "flat", label: "Área plana" },
    { id: "corridors", label: "Corredores/obstáculos" },
    { id: "ramps", label: "Rampas/irregularidades" },
    { id: "unknown", label: "Não sei" },
  ],
  drain: [
    { id: "up-to-2m", label: "Até 2 m" },
    { id: "above-2m", label: "Acima de 2 m" },
    { id: "unknown", label: "Não sei" },
  ],
  pet: [
    { id: "home", label: "Casa" },
    { id: "professional", label: "Serviço profissional" },
  ],
};

const q10Titles: Record<Family, string> = {
  pressure: "A limpeza exige água quente ou envolve gordura pesada?",
  extraction: "Há necessidade obrigatória de limpar carpetes/pisos com bocal específico?",
  vacuum: "Precisa obrigatoriamente de automação?",
  steam: "Precisa reabastecer durante a rotina, sem aguardar resfriamento?",
  floor: "Qual condição afeta o trabalho?",
  sweep: "Qual condição afeta o trabalho?",
  drain: "Qual a altura aproximada de elevação?",
  pet: "O equipamento será usado em casa ou em serviço profissional?",
};

const CHECK_QUESTIONS: Record<Family, CheckQuestion[]> = {
  pressure: [
    { id: "check-q9", title: q9Titles.pressure, options: q9Options.pressure, requiredFor: ["pressure"] },
    { id: "check-q10", title: q10Titles.pressure, options: q10Options.pressure, requiredFor: ["pressure"] },
  ],
  extraction: [
    { id: "check-q9", title: q9Titles.extraction, options: q9Options.extraction, requiredFor: ["extraction"] },
    { id: "check-q10", title: q10Titles.extraction, options: q10Options.extraction, requiredFor: ["extraction"] },
  ],
  vacuum: [
    { id: "check-q9", title: q9Titles.vacuum, options: q9Options.vacuum, requiredFor: ["vacuum"] },
    { id: "check-q10", title: q10Titles.vacuum, options: q10Options.vacuum, requiredFor: ["vacuum"] },
  ],
  steam: [
    { id: "check-q9", title: q9Titles.steam, options: q9Options.steam, requiredFor: ["steam"] },
    { id: "check-q10", title: q10Titles.steam, options: q10Options.steam, requiredFor: ["steam"] },
  ],
  floor: [
    { id: "check-q9", title: q9Titles.floor, options: q9Options.floor, requiredFor: ["floor"] },
    { id: "check-q10", title: q10Titles.floor, options: q10Options.floor, requiredFor: ["floor"] },
  ],
  sweep: [
    { id: "check-q9", title: q9Titles.sweep, options: q9Options.sweep, requiredFor: ["sweep"] },
    { id: "check-q10", title: q10Titles.sweep, options: q10Options.sweep, requiredFor: ["sweep"] },
  ],
  drain: [
    { id: "check-q9", title: q9Titles.drain, options: q9Options.drain, requiredFor: ["drain"] },
    { id: "check-q10", title: q10Titles.drain, options: q10Options.drain, requiredFor: ["drain"] },
  ],
  pet: [
    { id: "check-q9", title: q9Titles.pet, options: q9Options.pet, requiredFor: ["pet"] },
    { id: "check-q10", title: q10Titles.pet, options: q10Options.pet, requiredFor: ["pet"] },
  ],
};

export const BASE_QUESTION_IDS: QuestionId[] = [
  "goal",
  "context",
  "frequency",
  "surface",
  "workload",
  "power",
  "priority",
  "budget",
];

export const MAX_EFFECTIVE_QUESTIONS = 10;

export function getCheckQuestions(
  family: Family,
  answers: Record<string, string>,
): CheckQuestion[] {
  const list = CHECK_QUESTIONS[family] ?? [];
  const q9 = list.find((c) => c.id === "check-q9");
  const q10 = list.find((c) => c.id === "check-q10");

  const result: CheckQuestion[] = [];
  if (q9) result.push(q9);

  // Q10 condicional: só quando ainda necessária.
  if (q10) {
    let showQ10 = true;
    if (family === "vacuum") {
      // Q10 só se a automação ainda não estiver resolvida por Q7.
      showQ10 = answers.priority !== "automation";
    }
    if (family === "pet") {
      // Q10 só se Q2 não esclareceu casa vs profissional.
      showQ10 = answers.context !== "home" && answers.context !== "business";
    }
    if (showQ10) {
      result.push(q10);
    }
  }

  return result;
}

/**
 * Resolve uma pergunta pelo id considerando a família e as respostas já dadas.
 * Isso garante que Q4, Q5, Q7 e as verificações Q9/Q10 sempre reflitam Q1 e as
 * respostas anteriores, em vez de usar opções fixas.
 */
export function getQuestion(
  questionId: QuestionId,
  family: Family | null,
  answers: Record<string, string>,
): Question | undefined {
  if (questionId === "check-q9" || questionId === "check-q10") {
    if (!family) return undefined;
    const check = getCheckQuestions(family, answers).find(
      (item) => item.id === questionId,
    );
    if (!check) return undefined;
    return {
      id: check.id,
      title: check.title,
      options: check.options,
      families: [family],
    };
  }

  const question = QUESTIONS.find((item) => item.id === questionId);
  if (!question) return undefined;
  if (!family) return question;

  if (question.id === "surface") {
    return { ...question, options: getSurfaceOptions(family) };
  }
  if (question.id === "workload") {
    return { ...question, options: getWorkloadOptions(family) };
  }
  if (question.id === "priority") {
    return { ...question, options: getPriorityOptions(family) };
  }
  return question;
}
