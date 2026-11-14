# Memórias — decisões e alterações
Autoria: VIBECODE

## Sessão atual (14/11/2026)

### Contexto
Repositório Next.js 16 (App Router, TypeScript, Tailwind v4) vazio do create-next-app, com layout `src/`. Requisitos em `.opencode/requisitos.md` (Quiz de máquinas — Kärcher Center Dikmaq, v1.0, 13/11/2026). Não há CSV de catálogo (privado, fora do repositório) e não há arquivos de controle prévios.

### Decisões técnicas
- Layout `src/app` mantido (Next.js com src dir); `tsconfig.json` ajustado: `baseUrl: "."` e `paths {"@/*": ["src/*"]}` para resolver o alias `@/` corretamente com o layout `src/`.
- `src/app/globals.css`: tokens da identidade visual do requisito (#FFED00, #161922, #F0F1F3, #D5D8DD, #E8EAED, #555555, #626262, #238C96) registrados no tema do Tailwind v4.
- `src/app/layout.tsx`: `lang="pt-BR"`, fonte Clan Pro via CDN (fonts.cdnfonts.com) com fallback tipográfico (`Century Gothic`, `Futura`, `Segoe UI`, Arial, sans-serif); sem tema escuro por enquanto (fundo branco da identidade).
- `src/app/page.tsx`: home com título "Encontre a máquina ideal para sua limpeza.", texto de apoio e botão "Encontrar minha máquina" para `/quiz`.
- `src/app/quiz/page.tsx`: página servidor que renderiza o componente cliente `Quiz`.
- `src/components/quiz/Quiz.tsx`: máquina de estados cliente (perguntas → resultado), navegação com Voltar, limpeza de dependentes ao trocar resposta, chamada a `POST /api/recommendations`.
- `src/components/quiz/QuestionCard.tsx`: campo de rádio real (`fieldset`/`legend`), um por tela, sem avanço automático, ícone de confirmação na seleção.
- `src/components/quiz/Progress.tsx`: progresso pelo caminho vigente (máx. 10 perguntas efetivas).
- `src/lib/quiz/questions.ts`: definições Q1–Q8 fixas e Q9/Q10 por família com opções dinâmicas (especificação seção 5).
- `src/lib/quiz/flow.ts`: constrói o caminho de perguntas por família, limita a 10, identifica próxima não respondida.
- `src/lib/quiz/schema.ts`: validação do corpo das respostas (família, contexto, frequência, orçamento, verificações).
- `src/types/catalog.ts`: tipos do contrato de dados (Machine, Variant, QuizAnswers, RecommendationResult, Evidence, CommercialState, ReviewState) da seção 8.3.
- `src/lib/recommendations/{eligibility,scoring,reasons,engine}.ts`: motor de regras puro no servidor — filtros obrigatórios (seção 6.1), pontuação de preferências (seção 6.3, apenas evidência aprovada, sem inferência por nome), desempate, geração de motivos com códigos estáveis.
- `src/lib/catalog/load.ts`: leitura de `data/catalog.internal.json` (fora de public); catálogo ausente → 503.
- `src/app/api/recommendations/route.ts`: `POST /api/recommendations`, valida versão do questionário (409), valida respostas (400), recalcula no servidor (200 com um dos 4 estados; sem resultado = não é erro HTTP), 503 se catálogo não carregar.
- `src/types/validator.ts` (gerado pelo Next): removido, referenciava a pasta `app/` raiz deletada; será regenerado no build.
- Template default da Next substituído pela home do quiz.

### Pendências / decisões futuras
- Importar e classificar o CSV real (`produtos_1276888_*.csv`) em `data/catalog.internal.json` via script de importação (seção 8.4) — CSV não está no repositório.
- Aprovar seleção inicial de máquinas com evidência suficiente antes do lançamento.
- Testes automatizados (parser, elegibilidade, preço, jornada) — nenhum runner de teste configurado ainda.
- Deploy em Vercel e link na loja Tray apenas após validação comercial/técnica.
