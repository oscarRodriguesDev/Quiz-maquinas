/**
 * Corrige os acentos dos textos descritivos do catálogo.
 *
 * O importador original substituía entidades HTML (ex.: `&atilde;`) por espaço,
 * o que removia as letras acentuadas das descrições. Este script relê a
 * descrição oficial de cada produto na loja, valida que o conteúdo é o mesmo
 * (comparação sem acentos) e atualiza apenas `descriptionText`.
 *
 * Requer acesso à internet e que os produtos continuem publicados na loja.
 * Executar: node scripts/fix-description-accents.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CATALOG_PATH = join(process.cwd(), "data", "catalog.internal.json");
const REPORT_PATH = join(process.cwd(), "data", "report-descricoes.json");
const CONCURRENCY = 4;
const TIMEOUT_MS = 30000;

const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", agrave: "à", acirc: "â", atilde: "ã", auml: "ä",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë",
  iacute: "í", igrave: "ì", icirc: "î", iuml: "ï",
  oacute: "ó", ograve: "ò", ocirc: "ô", otilde: "õ", ouml: "ö",
  uacute: "ú", ugrave: "ù", ucirc: "û", uuml: "ü",
  ccedil: "ç", ntilde: "ñ",
  Aacute: "Á", Agrave: "À", Acirc: "Â", Atilde: "Ã", Auml: "Ä",
  Eacute: "É", Egrave: "È", Ecirc: "Ê", Euml: "Ë",
  Iacute: "Í", Igrave: "Ì", Icirc: "Î", Iuml: "Ï",
  Oacute: "Ó", Ograve: "Ò", Ocirc: "Ô", Otilde: "Õ", Ouml: "Ö",
  Uacute: "Ú", Ugrave: "Ù", Ucirc: "Û", Uuml: "Ü",
  Ccedil: "Ç", Ntilde: "Ñ",
  mdash: "—", ndash: "–", hellip: "…", ldquo: "“", rdquo: "”",
  lsquo: "‘", rsquo: "’", deg: "°", ordm: "º", ordf: "ª",
  times: "×", divide: "÷", reg: "®", copy: "©", trade: "™",
  euro: "€", pound: "£", cent: "¢", sect: "§", para: "¶",
  sup2: "²", sup3: "³", micro: "µ", bull: "•", rarr: "→",
  Oslash: "Ø", oslash: "ø", frac12: "½", frac14: "¼", frac34: "¾",
};

function decodeHtmlEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z0-9]+);/gi, (match, name) =>
      NAMED_ENTITIES[name] !== undefined ? NAMED_ENTITIES[name] : match,
    );
}

function stripHtml(text) {
  if (!text) return "";
  let s = text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  s = s.replace(/<[^>]*>/g, " ");
  s = decodeHtmlEntities(s);
  return s.replace(/\s+/g, " ").trim();
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizMaquinas/1.0)" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    // A loja Tray responde em Windows-1252 (charset=iso-8859-1).
    return new TextDecoder("windows-1252").decode(buffer);
  } finally {
    clearTimeout(timer);
  }
}

/** Extrai o bloco <div id="descricao"> contando as divs aninhadas. */
function extractDescription(html) {
  const open = html.search(/<div[^>]*id="descricao"/i);
  if (open < 0) return null;

  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = open;
  let depth = 0;
  let end = -1;
  let match;

  while ((match = tagRe.exec(html))) {
    if (match[0][1] === "/") depth--;
    else depth++;
    if (depth === 0) {
      end = match.index + match[0].length;
      break;
    }
  }

  if (end < 0) return null;
  return stripHtml(html.slice(open, end));
}

/** Remove acentos, pontuação e espaços para comparar o conteúdo. */
function squash(text) {
  return decodeHtmlEntities(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Fração do texto antigo encontrada, em ordem, no texto novo. */
function subsequenceCoverage(needle, haystack) {
  if (!needle.length) return 1;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i / needle.length;
}

function isValidDescription(stored, fetched) {
  if (!fetched || fetched.length < 20) {
    return { ok: false, reason: "descrição vazia" };
  }
  if (/Tecnologia Tray|CNPJ:|Load time:/i.test(fetched)) {
    return { ok: false, reason: "conteúdo de rodapé na descrição" };
  }

  const coverage = subsequenceCoverage(squash(stored), squash(fetched));
  if (coverage < 0.995) {
    return { ok: false, reason: `conteúdo divergente (cobertura ${coverage.toFixed(3)})` };
  }

  const ratio = fetched.length / Math.max(1, stored.length);
  if (ratio < 0.9 || ratio > 1.2) {
    return { ok: false, reason: `tamanho divergente (${ratio.toFixed(2)}x)` };
  }

  return { ok: true, coverage };
}

async function processMachine(machine) {
  if (!machine.productUrl) {
    return { id: machine.id, name: machine.name, status: "skipped", reason: "sem URL" };
  }

  try {
    const html = await fetchPage(machine.productUrl);
    const fetched = extractDescription(html);
    if (!fetched) {
      return { id: machine.id, name: machine.name, status: "skipped", reason: "sem bloco de descrição" };
    }

    const validation = isValidDescription(machine.descriptionText, fetched);
    if (!validation.ok) {
      return { id: machine.id, name: machine.name, status: "skipped", reason: validation.reason };
    }

    if (fetched === machine.descriptionText) {
      return { id: machine.id, name: machine.name, status: "unchanged" };
    }

    machine.descriptionText = fetched;
    return {
      id: machine.id,
      name: machine.name,
      status: "updated",
      coverage: Number(validation.coverage.toFixed(4)),
      previousLength: machine.descriptionText.length,
      newLength: fetched.length,
    };
  } catch (error) {
    return {
      id: machine.id,
      name: machine.name,
      status: "error",
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const raw = readFileSync(CATALOG_PATH, "utf8");
  const usesCrlf = raw.includes("\r\n");
  const catalog = JSON.parse(raw);

  const queue = [...catalog];
  const report = [];

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const machine = queue.shift();
      if (!machine) continue;
      const result = await processMachine(machine);
      report.push(result);
      const detail = result.reason ? ` (${result.reason})` : "";
      console.log(`[${result.status}] ${result.id} ${result.name}${detail}`);
    }
  });

  await Promise.all(workers);

  report.sort((a, b) => Number(a.id) - Number(b.id));
  const summary = report.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    { updated: 0, unchanged: 0, skipped: 0, error: 0 },
  );

  let json = JSON.stringify(catalog, null, 2);
  if (usesCrlf) json = json.replace(/\n/g, "\r\n");
  writeFileSync(CATALOG_PATH, json, "utf8");
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, items: report }, null, 2)}\n`,
    "utf8",
  );

  console.log("Resumo:", summary);
  console.log(`Relatório: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
