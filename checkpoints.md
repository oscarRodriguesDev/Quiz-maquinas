# Checkpoint — estado final da sessão (14/11/2026)
Autoria: VIBECODE

## Estado
Build de produção OK (`npm run build`): rotas `/`, `/quiz` (estáticas) e `/api/recommendations` (dinâmica). TypeScript sem erros no build.
Lint: todos os arquivos novos/alterados limpos. Restante 1 erro em `src/types/routes.d.ts` (arquivo gerado pelo Next.js, pré-existente à sessão — não editado manualmente).

## Commits na branch vibecode
- ef7405e — Início do quiz: home, fluxo de perguntas, motor de regras, endpoint /api/recommendations, arquivos de controle.
- 319ef03 — Correções de lint e tipos após revisão do build.

## O que foi entregue nesta sessão
- Home do quiz com identidade visual (amarelo #FFED00, tinta #161922, fonte Clan Pro + fallback).
- Tela do quiz: uma pergunta por tela, cartões de opção (fieldset/legend + rádio real), Continuar/Voltar, progresso pelo caminho vigente, limpeza de respostas dependentes ao trocar resposta, sem avanço automático.
- Lib de perguntas Q1–Q10 por família (especificação seção 5) e fluxo com limite de 10 perguntas efetivas.
- Validação de respostas (`src/lib/quiz/schema.ts`).
- Motor de regras puro no servidor: filtros obrigatórios (seção 6.1), pontuação de preferências (seção 6.3, apenas evidência aprovada, sem inferência por nome de modelo), desempate, motivos com códigos estáveis (seção 6.3).
- Endpoint `POST /api/recommendations` com contrato de estados (200 / 400 / 409 / 503), leitura de catálogo server-side em `data/catalog.internal.json` (503 se ausente).
- Tipos de domínio (`src/types/catalog.ts`) conforme seção 8.3.
- Arquivos de controle: `memorias.md`, `checkpoints.md`, `pedidos.md`.

## O que ainda não está feito
- Importação do CSV real e geração de `data/catalog.internal.json` (catálogo privado, fora do repo). Enquanto vazio, o endpoint retorna 503.
- Aprovar seleção inicial de máquinas com evidência suficiente antes do lançamento.
- Testes automatizados (nenhum runner de teste configurado no package.json).
- Deploy em Vercel e divulgação na loja Tray (após validação comercial/técnica).
