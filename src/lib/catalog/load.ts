import { readFile } from "fs/promises";
import { join } from "path";
import type { Machine } from "../../types/catalog";

const CATALOG_PATH = join(process.cwd(), "data", "catalog.internal.json");

export interface CatalogLoadError {
  code: "catalog-missing" | "catalog-invalid";
  message: string;
}

export async function loadCatalog(): Promise<{
  machines: Machine[];
  source: string;
}> {
  let raw: string;
  try {
    raw = await readFile(CATALOG_PATH, "utf8");
  } catch {
    throw {
      code: "catalog-missing" as const,
      message: "Catálogo interno não disponível no servidor.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw {
      code: "catalog-invalid" as const,
      message: "Catálogo interno com formato inválido.",
    };
  }

  if (!Array.isArray(parsed)) {
    throw {
      code: "catalog-invalid" as const,
      message: "Catálogo interno deve ser uma lista de máquinas.",
    };
  }

  return { machines: parsed as Machine[], source: CATALOG_PATH };
}
