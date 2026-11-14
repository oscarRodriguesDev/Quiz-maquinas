export type ReasonCode =
  | "family-match"
  | "application-match"
  | "power-confirmed"
  | "version-confirmed"
  | "within-budget"
  | "buyable"
  | "quote-required"
  | "stock-unavailable"
  | "voltage-pending"
  | "no-evidence"
  | "no-match";

export interface Reason {
  code: ReasonCode;
  text: string;
}

export const REASONS: Record<ReasonCode, string> = {
  "family-match": "Indicada para a aplicação cadastrada, conforme a sua necessidade informada.",
  "application-match": "Aplicação compatível com o ambiente e material informados.",
  "power-confirmed": "Alimentação e versão confirmadas para a sua instalação.",
  "version-confirmed": "Versão validada com os dados técnicos da referência.",
  "within-budget": "Preço vigente dentro do teto de investimento informado.",
  "buyable": "Disponível para compra direta com preço e estoque confirmados.",
  "quote-required": "Venda sob consulta: solicite orçamento à equipe comercial.",
  "stock-unavailable": "Sem estoque vendável confirmado no momento.",
  "voltage-pending": "Voltagem/fase a confirmar antes da recomendação de compra.",
  "no-evidence": "Não há evidência aprovada suficiente para confirmar esta indicação.",
  "no-match": "Não foi encontrada máquina compatível com as respostas informadas.",
};

export function reasonText(code: ReasonCode): string {
  return REASONS[code];
}
