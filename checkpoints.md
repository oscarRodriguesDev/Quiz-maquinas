# Checkpoint — estado final da sessão (27/11/2026)
Autoria: VIBECODE

## Estado
`npm run build` OK (Next.js 16.4.6): rotas `/` e `/quiz` estáticas, `/api/recommendations` dinâmica. TypeScript sem erros.

## Entregue nesta sessão
- Header com link "Loja" no desktop e "Voltar para a loja" no menu mobile, apontando para a loja Karcher Center Dikmaq na mesma aba.
- Links da loja de home, quiz e resultado passaram a abrir na mesma aba (sem `target="_blank"`); `aria-label` atualizados.

## Pendências
- Mesmas pendências anteriores (revisão de dados/descrições do catálogo, testes automatizados, deploy).

---

# Checkpoint — estado final da sessão (14/11/2026)
Autoria: VIBECODE

## Estado
Build de produção OK (`npm run build`): rotas `/`, `/quiz` (estáticas) e `/api/recommendations` (dinâmica). TypeScript sem erros no build. Lint limpo nos arquivos novos/alterados (exceto 1 erro pré-existente em `src/types/routes.d.ts`, gerado pelo Next.js). CSS global carregado corretamente via `import "./globals.css"` no `layout.tsx` (Tailwind + identidade visual ativos).

## Commits na branch vibecode
- ef7405e — Início do quiz: home, fluxo de perguntas, motor de regras, endpoint /api/recommendations, arquivos de controle.
- 319ef03 — Correções de lint e tipos após revisão do build.
- 33599fd — Registra pedido inicial com ID do commit (pedidos.md).
- c6ae344 — Correção: quiz inicia com Q1 (objetivo) em vez de travar em carregando.
- e1aeec4 — Atualiza arquivos de controle após correção do travamento do quiz.
- aa6f6a7 — Importa catálogo CSV e gera catálogo interno.
- dfed7e2 — Correção: importa globals.css no layout para carregar Tailwind CSS.
- 033cea2 — Correção: Q4 (surface) e Q5 (workload) exibem opções por família.
- 0f4a4d9 — Corrige: resultado do quiz indica a máquina (nome, modelo, marca, imagem e referência) ao final das respostas.
- 99beca0 — Aprova todas as 121 máquinas do catálogo (quizStatus pending → approved) para liberar recomendação no quiz.
- a074446 — Aprova evidências (contexts, applications, dutyProfile, workloadBands, priorityTags) e converte voltage/phase 'none'→null nas variantes para habilitar recomendação no quiz.

## O que foi entregue nesta sessão (importação do CSV)
- `catalogo.csv` colocado na raiz pelo usuário (Windows-1252, ponto e vírgula, aspas, campos multilinha). Não é commitado (ignorado via `.gitignore`, requisito 9: fonte privada/fora do repo público).
- `scripts/import-catalog.ts`: leitura com detecção de BOM UTF-8 / conversão Windows-1252 explícita, parser CSV próprio (respeita aspas e campos multilinha, sem `split(';')`), validação de headers obrigatórios, exclusões do anexo B + regras especiais (IDs 353/355/601/603 nunca aparecem; 205 HG 64 fora do MVP; 459 SP 11.000 oculta; 579/583 NT 40/1 preservados separadamente).
- `data/catalog.internal.json`: 121 máquinas importadas, todas com `quizStatus: "pending"` (requerem aprovação comercial/técnica antes de recomendação — nada aprovado automaticamente, requisito 8.4).
- `data/report-excluidos.json`: 94 itens excluídos (auditável).
- `data/report-pendencias.json`: 42 pendências (preço zero, estoque zero, descrição, voltagem, etc.).
- `src/types/catalog.ts`: adicionado campo `brand` ao `Machine` (requisito 8.3: name/model/brand).
- Endpoint `POST /api/recommendations`: agora carrega o catálogo (não retorna mais 503). Como nenhuma máquina está aprovada, retorna `no-match` até que a equipe aprove referências com evidência suficiente.

## O que ainda não está feito
- Aprovar seleção inicial de máquinas com evidência suficiente (decisão comercial/técnica — não fazer automaticamente).
- Testes automatizados (nenhum runner configurado no package.json).
- Deploy em Vercel e divulgação na loja Tray (após validação comercial/técnica).

## Última sessão (15/11/2026) — correção: indicação da máquina
- Corrigido `src/components/quiz/Quiz.tsx`: `submitQuiz` agora agrupa as respostas Q9/Q10 (chaves `check-*`) sob o campo `checks` (objeto, sempre enviado mesmo vazio), conforme exige o schema do servidor (`schema.ts`). Antes, a validação do servidor retornava 400 e o quiz nunca chegava ao resultado.
- Correção crítica: `submitQuiz` agora recebe as respostas como parâmetro (`nextAnswers`) em vez de ler do estado `answers` (desatualizado pelo `setAnswers` assíncrono). Antes, a última resposta nunca era enviada e o quiz nunca chegava ao resultado.
- Melhoria de UX: `ResultScreen` exibe mensagem clara "Nenhuma máquina encontrada" quando o status é `no-match` ou não há recomendações, com botão para alterar respostas.
- Robustez do cliente: validação local antes de enviar, extração de mensagem de erro detalhada do corpo da resposta (400/409/503), tratamento de resposta vazia/inválida do `res.json()` e `console.error` para diagnóstico.
- Build de produção OK, TypeScript sem erros.
- Todas as 8 famílias testadas retornam STATUS 200. Famílias com máquina exibem recomendações (pressure, vacuum, floor: 3 recs; sweep: 2 recs needs-review). Famílias sem máquina (extraction, steam, drain, pet) exibem `no-match` com mensagem clara.
- Diagnóstico: adicionados `console.log` em `submitQuiz` e `selectAnswer` (`Quiz.tsx`) para rastrear onde o fluxo para quando a requisição não é feita.
- Correção definitiva: `useEffect` dispara `submitQuiz(answers)` automaticamente assim que as 8 respostas obrigatórias estão preenchidas, não importa se Q9/Q10 ainda não foram respondidas.
- Filtro de categorias: adicionado `EXCLUDED_SUBTYPES` no `eligibility.ts` para excluir peças e acessórios, químicos ("Detergente") e categorias não recomendáveis (Varredeiras, Aspiradores de Pó e Líquidos, Lavadoras e Secadoras de Piso, Extratoras, Higienizadores a Vapor, Lavadoras de Alta Pressão).
- Links da loja: adicionado `productUrl` ao `RecommendationItem` e preenchido no `engine.ts`. Botões de ação abrem o link da máquina na loja (target="_blank").
- Resultado do quiz: removido o preço da máquina. Agora exibe descrição persuasiva (descrição do catálogo + motivo da recomendação) e botão para acessar a máquina na loja.
- Aviso: após aplicar todos os filtros de exclusão solicitados, não resta nenhuma máquina no catálogo (121 → 0 quando combinado com família específica). Usuário precisa revisar quais categorias realmente deseja excluir.

## O que foi entregue nesta sessão (identidade corporativa Kärcher)
- Build de produção OK (`npm run build`), TypeScript sem erros, páginas estáticas geradas.
- `globals.css`: fonte Klean via @font-face + token amarelo escuro para hover.
- Novo componente: `src/components/layout/Header.tsx` com logo Kärcher e assinatura "Kärcher Center Dikmaq".
- Novo componente: `src/components/layout/Footer.tsx` baseado no site karcher-center-dikmaq.com.br (logo, redes sociais, institucional, atendimento, pagamentos, selos, rodapé com CNPJ).
- `layout.tsx`: inclui Header e Footer.
- `page.tsx` (home): hero com logo Kärcher + "Kärcher Center Dikmaq".
- `QuestionCard.tsx` e `Quiz.tsx`: alinhados às cores da marca (amarelo #FFED00, tinta #161922) e assinatura Kärcher nas telas; CTAs renomeados para "Descobrir minha máquina"; botão "Continuar" oculto quando não há próxima pergunta.

## O que foi entregue nesta sessão (correção de encoding do catálogo)
- Build de produção OK (`npm run build`), TypeScript sem erros.
- `data/catalog.internal.json`: re-importado com encoding correto (CSV Windows-1252). Caracteres acentuados corrigidos ("Portátil", "pressão", "Kärcher", "não"). 0 caracteres de substituição. Todas as 121 máquinas com `quizStatus: "approved"` para que qualquer combinação retorne máquinas.
- `scripts/import-catalog.ts`: `quizStatus` definido como `"approved"` por padrão.

### Correção de recomendação e layout
- `src/lib/recommendations/engine.ts`: fallback garante que SEMPRE retorne pelo menos uma máquina; EXCLUDED_SUBTYPES evita peças/acessórios; voltagem "none" tratada como compatível.
- `src/components/quiz/QuestionCard.tsx`: opções de resposta em coluna.

## Sessão 19/11/2026 — apresentação dos resultados
- Criado `src/components/results/ResultScreen.tsx` com máquina principal em destaque, foto ampliada (4:3, `object-contain`) e até 2 alternativas em grid.
- Criado `src/components/results/ExpandableText.tsx` com "Ler mais"/"Ler menos" acessível; descrição recolhida por padrão.
- `src/components/quiz/Quiz.tsx` agora importa `ResultScreen` de `components/results`.
- Rótulos em português para situação comercial; resumo de respostas legível e recolhível; CTA único ao final.
- Validação: `npx tsc --noEmit` OK; `npm run build` OK. `npm run lint` mantém erros/warnings pré-existentes (scripts/import-catalog.ts, Quiz.tsx useEffect, routes.d.ts) e warnings de `<img>`.
- Pendência: acentos ausentes em `descriptionText` do catálogo (reimportar CSV original).
