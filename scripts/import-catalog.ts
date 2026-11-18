/**
 * Importação inicial do catálogo (requisito 8.4).
 * Lê catalogo.csv (Windows-1252, ponto e vírgula, com aspas e campos multilinha),
 * classifica máquinas candidatas, aplica exclusões do anexo A/B e gera:
 *  - data/catalog.internal.json  (catálogo interno para o servidor)
 *  - data/report-excluidos.json   (itens excluídos, auditável)
 *  - data/report-pendencias.json  (pendências de classificação/comercial)
 *
 * Executar: npx tsx scripts/import-catalog.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";
import type { Machine, CommercialState, Evidence, Family } from "../src/types/catalog";

const CSV_PATH = join(process.cwd(), "catalogo.csv");
const DATA_DIR = join(process.cwd(), "data");
const CATALOG_OUT = join(DATA_DIR, "catalog.internal.json");
const EXCLUIDOS_OUT = join(DATA_DIR, "report-excluidos.json");
const PENDENCIAS_OUT = join(DATA_DIR, "report-pendencias.json");

const HEADER_OBRIGATORIOS = [
  "Código produto",
  "Nome produto",
  "Referência",
  "Marca",
  "Modelo",
  "Nome categoria",
  "Descrição grande",
  "Imagem principal",
  "Endereço do Produto (URL Tray)",
  "Preço venda",
  "Estoque atual",
  "Disponível",
  "Exibir na loja",
];

/** IDs que nunca aparecem como máquinas (anexo B + regras especiais). */
const EXCLUIDOS_FORÇADOS = new Set([
  25, 27, 29, 31, 33, 37, 39, 41, 43, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71,
  73, 75, 77, 79, 81, 83, 85, 87, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111,
  113, 115, 119, 121, 123, 125, 127, 129, 135, 137, 139, 141, 143, 145, 147, 149,
  151, 153, 157, 159, 161, 165, 167, 171, 173, 175, 177, 179, 181, 183, 185, 187,
  189, 193, 195, 197, 199, 201, 203, 303, 311, 313, 315, 317, 319, 321, 323, 325,
  327, 329, 331, 333,
]);

/** IDs com tratamento especial (requisito 2). */
const ID_205_HG64 = 205; // gerador de água quente — fora do MVP
const ID_459_BOMBA = 459; // bomba SP 11.000 — oculta
const IDS_579_583 = new Set([579, 583]); // NT 40/1 — preservar separadamente
const IDS_353_355_601_603 = new Set([353, 355, 601, 603]); // nunca aparecem

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    const row: string[] = [];
    while (true) {
      let field = "";
      if (i < n && text[i] === '"') {
        i++; // pular aspas de abertura
        while (i < n) {
          if (text[i] === '"') {
            if (i + 1 < n && text[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // fechar aspas
              break;
            }
          } else {
            field += text[i];
            i++;
          }
        }
      } else {
        while (i < n && text[i] !== ";" && text[i] !== "\n" && text[i] !== "\r") {
          field += text[i];
          i++;
        }
      }
      row.push(field);
      if (i < n && text[i] === ";") {
        i++;
        continue;
      }
      break;
    }
    rows.push(row);
    // pular quebra de linha
    if (i < n && text[i] === "\r") i++;
    if (i < n && text[i] === "\n") i++;
  }
  return rows;
}

function toCents(ptBr: string | undefined | null): number | null {
  if (ptBr === undefined || ptBr === null) return null;
  const s = ptBr.trim().replace(/\./g, "").replace(",", ".");
  const v = Number(s);
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 100);
}

function limparTexto(t: string | undefined | null): string {
  if (t === undefined || t === null) return "";
  return t.trim();
}

function removerHtml(texto: string): string {
  if (!texto) return "";
  let s = texto
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  s = s.replace(/<[^>]*>/g, " ");
  s = s.replace(/&[a-z]+;/gi, " ");
  return s.replace(/\s+/g, " ").trim();
}

function classificarFamilia(
  nomeCategoria: string,
  nomeProduto: string,
  referencia: string,
): { family: Family; motivo: string } {
  const cat = (nomeCategoria || "").toLowerCase();
  const nome = (nomeProduto || "").toLowerCase();

  if (
    cat.includes("alta press") ||
    nome.includes("lavadora de alta press") ||
    nome.includes("hd ") ||
    nome.includes("hds ") ||
    nome.includes("k2") ||
    nome.includes("k3") ||
    nome.includes("k4") ||
    nome.includes("k5") ||
    nome.includes("k 530") ||
    nome.includes("portátil") ||
    nome.includes("portatil") ||
    nome.includes("g 2900")
  ) {
    return { family: "pressure", motivo: "Categoria/nome: Lavadoras de alta pressão" };
  }
  if (
    cat.includes("extrator") ||
    nome.includes("puzzi") ||
    nome.includes("extratora") ||
    nome.includes("limpadora de estofados")
  ) {
    return { family: "extraction", motivo: "Categoria/nome: Extratoras" };
  }
  if (
    cat.includes("aspira") ||
    nome.includes("aspirador") ||
    nome.includes("aspirador de pó") ||
    nome.includes("nt ") ||
    nome.includes("wdl") ||
    nome.includes("vcl") ||
    nome.includes("cv 30/1") ||
    nome.includes("ivm") ||
    nome.includes("pet clean") ||
    nome.includes("tosador")
  ) {
    return { family: "vacuum", motivo: "Categoria/nome: Aspiração" };
  }
  if (cat.includes("vapor") || nome.includes("sc ") || nome.includes("limpadora a vapor")) {
    return { family: "steam", motivo: "Categoria/nome: Limpadoras a vapor" };
  }
  if (
    cat.includes("piso") ||
    nome.includes("bd ") ||
    nome.includes("br ") ||
    nome.includes("fc 7") ||
    nome.includes("limpadora de piso") ||
    nome.includes("limpadora e secadora")
  ) {
    return { family: "floor", motivo: "Categoria/nome: Limpadoras/secadoras de piso" };
  }
  if (
    cat.includes("varred") ||
    nome.includes("varredeira") ||
    nome.includes("s6") ||
    nome.includes("s4") ||
    nome.includes("km ") ||
    nome.includes("mc 600")
  ) {
    return { family: "sweep", motivo: "Categoria/nome: Varrição" };
  }
  if (cat.includes("drenagem") || nome.includes("bomba") || nome.includes("sp 11")) {
    return { family: "drain", motivo: "Categoria/nome: Bombas de drenagem" };
  }
  if (cat.includes("pet") || nome.includes("pet clean")) {
    return { family: "pet", motivo: "Categoria/nome: Equipamento Pet Clean" };
  }
  return { family: "pressure", motivo: "Não classificado — padrão pression (pendência)" };
}

function estadoComercial(
  precoCents: number | null,
  estoque: number | null,
  enabled: boolean,
  visible: boolean,
  outOfStockPolicy: string | undefined | null,
): CommercialState {
  if (!enabled || !visible) return "hidden";
  if (precoCents === null || precoCents <= 0) {
    return "review"; // preço zero / sem preço → pendência comercial
  }
  if (estoque === null || estoque <= 0) {
    return "unavailable";
  }
  return "buyable";
}

function main() {
  if (!existsSync(CSV_PATH)) {
    console.error("❌ catalogo.csv não encontrado na raiz do projeto.");
    process.exit(1);
  }

  const rawBuffer = readFileSync(CSV_PATH);
  // Detectar BOM UTF-8; senão, tratar como Windows-1252 (conforme requisito 8.4)
  const texto =
    rawBuffer[0] === 0xef && rawBuffer[1] === 0xbb && rawBuffer[2] === 0xbf
      ? new TextDecoder("utf-8").decode(rawBuffer.slice(3))
      : new TextDecoder("windows-1252").decode(rawBuffer);

  const hash = createHash("sha256").update(texto).digest("hex");
  const rows = parseCsv(texto);
  if (rows.length < 2) {
    console.error("❌ CSV sem dados.");
    process.exit(1);
  }

  const headers = rows[0].map((h) => h.trim());
  const faltando = HEADER_OBRIGATORIOS.filter((h) => !headers.includes(h));
  if (faltando.length > 0) {
    console.error("❌ Headers obrigatórios ausentes:", faltando);
    process.exit(1);
  }

  const idx = (nome: string) => headers.indexOf(nome);

  const maquinas: Machine[] = [];
  const excluidos: Array<{ id: string; produto: string; motivo: string }> = [];
  const pendencias: Array<{ id: string; produto: string; campo: string; motivo: string }> = [];
  const idsVistos = new Set<string>();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || row.every((c) => c.trim() === "")) continue;

    const get = (nome: string) => row[idx(nome)] ?? "";
    const idRaw = get("Código produto").trim();
    const id = idRaw;
    const produto = limparTexto(get("Nome produto"));
    const referencia = limparTexto(get("Referência"));
    const marca = limparTexto(get("Marca"));
    const modelo = limparTexto(get("Modelo"));
    const nomeCategoria = limparTexto(get("Nome categoria"));
    const descricaoHtml = get("Descrição grande");
    const imageUrl = limparTexto(get("Imagem principal"));
    const productUrl = limparTexto(get("Endereço do Produto (URL Tray)"));
    const precoCents = toCents(get("Preço venda"));
    const estoqueRaw = get("Estoque atual").trim();
    const estoque = estoqueRaw === "" ? null : Number(estoqueRaw);
    const disponivel = get("Disponível").trim().toLowerCase();
    const exibirNaLoja = get("Exibir na loja").trim().toLowerCase();
    const outOfStockPolicy = limparTexto(get("Quando acabar o estoque"));
    const itensInclusos = limparTexto(get("Itens inclusos"));

    // ID único
    if (idsVistos.has(id)) {
      excluidos.push({ id, produto, motivo: "ID duplicado no CSV" });
      continue;
    }
    idsVistos.add(id);

    const idNum = Number(id);

    // Regras especiais / anexo B
    if (EXCLUIDOS_FORÇADOS.has(idNum)) {
      excluidos.push({ id, produto, motivo: "Item fora do quiz (anexo B: peça/acessório/químico)" });
      continue;
    }
    if (IDS_353_355_601_603.has(idNum)) {
      excluidos.push({ id, produto, motivo: "Excluir por identidade do produto (peça/acessório/químico apesar da categoria)" });
      continue;
    }
    if (idNum === ID_205_HG64) {
      excluidos.push({ id, produto, motivo: "Gerador de água quente HG 64 — fora do MVP até avaliação de operação" });
      continue;
    }
    if (idNum === ID_459_BOMBA) {
      // Mantido como máquina oculta (não exposta no resultado público)
      pendencias.push({
        id, produto, campo: "quizStatus", motivo: "Bomba SP 11.000 Dirt — oculta, fora do resultado público",
      });
    }

    const { family, motivo } = classificarFamilia(nomeCategoria, produto, referencia);

    const descricaoTexto = removerHtml(descricaoHtml);

    const ev = <T>(value: T | null, field?: string): Evidence<T> => ({
      value,
      source: { kind: "csv", locator: "catalogo.csv", field },
      state: value === null || value === undefined ? "pending" : "approved",
      reviewedAt: undefined,
    });

    const varianteId = `v-${id}`;
    const powerSource: "mains" | "battery" | "gasoline" | "manual" =
      produto.toLowerCase().includes("gasolina") ? "gasoline" :
      produto.toLowerCase().includes("bateria") ? "battery" :
      produto.toLowerCase().includes("manual") ? "manual" : "mains";

    const tensaoEv: Evidence<"127" | "220" | "bivolt" | "other" | "none"> = ev<string>("none", "Característica: Voltagem do Carregador (V)") as unknown as Evidence<"127" | "220" | "bivolt" | "other" | "none">;
    // Mapeia característica de voltagem quando houver
    const voltagemRaw = limparTexto(get("Característica: Voltagem do Carregador (V):"));
    if (voltagemRaw) {
      const v = voltagemRaw.toLowerCase();
      if (v.includes("127") && v.includes("220")) tensaoEv.value = "bivolt";
      else if (v.includes("220")) tensaoEv.value = "220";
      else if (v.includes("127")) tensaoEv.value = "127";
      else tensaoEv.value = "other";
    }

    const estado = estadoComercial(precoCents, estoque, disponivel === "sim", exibirNaLoja === "sim", outOfStockPolicy);

    // IDs 579 e 583 preservados separadamente (não unidos por nome)
    if (IDS_579_583.has(idNum)) {
      pendencias.push({ id, produto, campo: "variantes", motivo: "NT 40/1 — referências distintas 14287310nt40 e 11489880; manter como produtos separados" });
    }

    if (idNum === ID_459_BOMBA) {
      // oculta: não entra no resultado público, mas permanece no catálogo interno
    }

    if (precoCents === null || precoCents <= 0) {
      pendencias.push({ id, produto, campo: "preço", motivo: "Preço de venda zero — pendência comercial, não comprova venda sob consulta" });
    }
    if (estoque === null || estoque <= 0) {
      pendencias.push({ id, produto, campo: "estoque", motivo: "Estoque zero — bloqueia compra direta no MVP" });
    }
    if (!descricaoTexto) {
      pendencias.push({ id, produto, campo: "descrição", motivo: "Descrição não utilizável após remoção de HTML" });
    }

    const machine: Machine = {
      id,
      reference: referencia || id,
      name: produto || `Produto ${id}`,
      model: modelo || "",
      brand: marca || "Kärcher",
      family,
      subtype: nomeCategoria,
      isCompleteMachine: !EXCLUIDOS_FORÇADOS.has(idNum) && !IDS_353_355_601_603.has(idNum),
      quizStatus: "approved", // aprovado por padrão — qualquer combinação retorna máquina
      imageUrl: imageUrl || "https://via.placeholder.com/400x400?text=Sem+imagem",
      productUrl: productUrl || "#",
      descriptionText: descricaoTexto,
      contexts: ev<string[]>(null),
      applications: ev<string[]>(null),
      limitations: ev<string[]>(null),
      dutyProfile: ev<string[]>(null),
      workloadBands: ev<string[]>(null),
      priorityTags: ev<string[]>(null),
      specifications: {
        "Preço venda": ev(precoCents, "Preço venda"),
        "Estoque atual": ev(estoque, "Estoque atual"),
        "Disponível": ev(disponivel, "Disponível"),
        "Exibir na loja": ev(exibirNaLoja, "Exibir na loja"),
        ...(voltagemRaw ? { "Voltagem do carregador": ev(voltagemRaw, "Característica: Voltagem do Carregador (V):") } : {}),
        ...(itensInclusos ? { "Itens inclusos": ev(itensInclusos, "Itens inclusos") } : {}),
      },
      variants: [
        {
          id: varianteId,
          voltage: tensaoEv,
          phase: ev<string>("none", "não informado no CSV") as unknown as Evidence<"single" | "three" | "none">,
          powerSource: ev<string>(powerSource, "inferido do nome do produto") as unknown as Evidence<"mains" | "battery" | "gasoline" | "manual">,
          stock: estoque,
          priceCents: precoCents,
          commercialState: estado,
        },
      ],
      commercial: {
        regularPriceCents: precoCents,
        promotion: null,
        state: estado,
        stockSnapshot: estoque,
        enabled: disponivel === "sim",
        visible: exibirNaLoja === "sim",
        quoteApproved: false,
      },
      source: {
        fileName: "catalogo.csv",
        productId: id,
        importedAt: new Date().toISOString(),
        hash,
      },
    };

    maquinas.push(machine);
  }

  maquinas.sort((a, b) => Number(a.id) - Number(b.id));

  const maquinasCandidatas = maquinas.filter((m) => m.isCompleteMachine);
  const maquinasExibicao = maquinasCandidatas.filter((m) => m.id !== String(ID_459_BOMBA));
  const ocultas = maquinasCandidatas.filter((m) => m.id === String(ID_459_BOMBA));

  mkdirSync(DATA_DIR, { recursive: true });

  const catalogPublico = maquinasExibicao.map((m) => ({
    id: m.id,
    reference: m.reference,
    name: m.name,
    model: m.model,
    brand: m.brand,
    family: m.family,
    subtype: m.subtype,
    imageUrl: m.imageUrl,
    productUrl: m.productUrl,
    descriptionText: m.descriptionText,
    variants: m.variants.map((v: any) => ({
      id: v.id,
      priceCents: v.priceCents,
      stock: v.stock,
      commercialState: v.commercialState,
    })),
    commercial: m.commercial,
  }));

  writeFileSync(CATALOG_OUT, JSON.stringify(maquinas, null, 2), "utf8");
  writeFileSync(EXCLUIDOS_OUT, JSON.stringify(excluidos, null, 2), "utf8");
  writeFileSync(PENDENCIAS_OUT, JSON.stringify(pendencias, null, 2), "utf8");

  console.log("✅ Importação concluída");
  console.log(`   Total de linhas processadas: ${rows.length - 1}`);
  console.log(`   Máquinas no catálogo interno: ${maquinas.length}`);
  console.log(`   Candidatas (máquinas completas): ${maquinasCandidatas.length}`);
  console.log(`   Exibição pública (sem ocultas): ${maquinasExibicao.length}`);
  console.log(`   Ocultas (ID 459): ${ocultas.length}`);
  console.log(`   Excluídos: ${excluidos.length}`);
  console.log(`   Pendências: ${pendencias.length}`);
  console.log(`   Hash do arquivo: ${hash}`);
  console.log(`   Saída: ${CATALOG_OUT}`);
  console.log(`   Relatório excluídos: ${EXCLUIDOS_OUT}`);
  console.log(`   Relatório pendências: ${PENDENCIAS_OUT}`);
}

main();
