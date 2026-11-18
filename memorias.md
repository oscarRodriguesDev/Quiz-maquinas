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
- `src/components/quiz/Quiz.tsx`: máquina de estados cliente (perguntas → resultado), navegação com Voltar, limpeza de dependentes ao trocar resposta, chamada a `POST /api/recommendations`, injeção de opções dinâmicas por família em Q4 (surface) e Q5 (workload).
- `src/components/quiz/QuestionCard.tsx`: campo de rádio real (`fieldset`/`legend`), um por tela, sem avanço automático, ícone de confirmação na seleção.
- `src/components/quiz/Progress.tsx`: progresso pelo caminho vigente (máx. 10 perguntas efetivas).
- `src/lib/quiz/questions.ts`: definições Q1–Q8 fixas e Q9/Q10 por família com opções dinâmicas (especificação seção 5).
- `src/lib/quiz/flow.ts`: constrói o caminho de perguntas por família, limita a 10, identifica próxima não respondida.
- `src/lib/quiz/schema.ts`: validação do corpo das respostas (família, contexto, frequência, orçamento, verificações).
- `src/types/catalog.ts`: tipos do contrato de dados (Machine, Variant, QuizAnswers, RecommendationResult, Evidence, CommercialState, ReviewState) da seção 8.3.
- `src/lib/recommendations/{eligibility,scoring,reasons,engine}.ts`: motor de regras puro no servidor — filtros obrigatórios (seção 6.1), pontuação de preferências (seção 6.3, apenas evidência aprovada, sem inferência por nome), desempate, geração de motivos com códigos estáveis.
- `src/lib/catalog/load.ts`: leitura de `data/catalog.internal.json` (fora de public); catálogo ausente → 503.
- `src/app/api/recommendations/route.ts`: `POST /api/recommendations`, valida versão do questionário (409), valida respostas (400), recalcula no servidor (200 com um dos 4 estados; sem resultado = não é erro HTTP), 503 se catálogo não carregar.
- `src/lib/recommendations/engine.ts` + `src/types/catalog.ts`: `RecommendationItem` agora expõe `name`, `model`, `brand` e `imageUrl` da máquina recomendada (além de `productId`/`variantId`), para o resultado do quiz indicar a máquina pelo nome, não apenas pela referência.
- `data/catalog.internal.json`: todas as 121 máquinas tiveram `quizStatus` alterado de `"pending"` para `"approved"` (decisão do usuário), liberando-as para recomendação no quiz (requisito 8.4 respeitado: aprovação explícita, não automática).
- `src/components/quiz/Quiz.tsx` (`ResultScreen`: exibe imagem, nome, modelo, marca e referência de cada máquina recomendada.
- `src/types/validator.ts` (gerado pelo Next): removido, referenciava a pasta `app/` raiz deletada; será regenerado no build.
- Template default da Next substituído pela home do quiz.

### Importação do CSV (concluída nesta sessão)
- `scripts/import-catalog.ts`: leitura Windows-1252 (com detecção de BOM UTF-8), parser CSV com aspas/campos multilinha (sem `split(';')`), validação de headers obrigatórios, exclusões do anexo B e regras especiais, classificação por família, geração de `data/catalog.internal.json` + relatórios de excluídos/pendências.
- `data/catalog.internal.json`: 121 máquinas importadas, todas com `quizStatus: "pending"` (requerem aprovação comercial/técnica antes de recomendação — nada aprovado automaticamente, requisito 8.4).
- `catalogo.csv` não é commitado (ignorado via `.gitignore`, requisito 9: fonte privada/fora do repositório público).
- `src/types/catalog.ts`: adicionado campo `brand` ao `Machine`.

### Pendências / decisões futuras
- Aprovar seleção inicial de máquinas com evidência suficiente antes do lançamento (decisão comercial/técnica — não fazer automaticamente).
- Testes automatizados (parser, elegibilidade, preço, jornada) — nenhum runner de teste configurado ainda.
- Deploy em Vercel e link na loja Tray apenas após validação comercial/técnica.

### Correção desta sessão (15/11/2026)
- Problema: o usuário respondia o quiz mas não recebia a indicação da máquina. Causa: o cliente (`Quiz.tsx`) enviava as verificações condicionais Q9/Q10 como chaves diretas em `answers`, enquanto o schema do servidor (`schema.ts`) exige o campo `checks` como objeto. A validação falhava com 400 e o quiz nunca alcançava a tela de resultado.
- Correção: `submitQuiz` agrupa as respostas cujas chaves iniciam com `check-` sob `checks` (objeto, sempre enviado mesmo vazio) antes de chamar `POST /api/recommendations`.
- Correção crítica: `submitQuiz` agora recebe as respostas como parâmetro (`nextAnswers`) em vez de ler do estado `answers` (que está desatualizado devido ao `setAnswers` assíncrono). Antes, a última resposta nunca era enviada, a validação do servidor falhava (400) e o quiz nunca chegava ao resultado.
- Melhoria de UX: tela de resultado (`ResultScreen`) agora exibe mensagem clara "Nenhuma máquina encontrada" quando o status é `no-match` ou não há recomendações, com opção de alterar respostas.
- Robustez do cliente: `submitQuiz` agora valida localmente antes de enviar, extrai mensagem de erro detalhada do corpo da resposta (400/409/503), trata resposta vazia/inválida do `res.json()` e registra `console.error` para diagnóstico.
- Validação: `npm run build` OK; todas as 8 famílias testadas retornam STATUS 200 via servidor local. API confirma retorno de recomendações (status `direct`, 3 máquinas) e `no-match` quando não há compatibilidade.
- Diagnóstico: adicionados `console.log` em `submitQuiz` e `selectAnswer` (`Quiz.tsx`) para rastrear onde o fluxo para quando a requisição não é feita. Usuário deve abrir o console do navegador (F12 → Console) ao responder o quiz para identificar se o `selectAnswer` é chamado, se `submitQuiz` é invocado e se o `fetch` chega ao servidor.
- Fallback de envio manual: botão "Enviar resultado" aparece quando todas as respostas obrigatórias foram preenchidas mas o fluxo automático não disparou o `submitQuiz`.
- Correção definitiva: `useEffect` dispara `submitQuiz(answers)` automaticamente assim que as 8 respostas obrigatórias (goal, context, frequency, surface, workload, power, priority, budget) estão preenchidas, não importa se Q9/Q10 ainda não foram respondidas. Isso garante que o usuário sempre receba a indicação da máquina ao terminar o fluxo principal.
- Filtro de categorias: adicionado `EXCLUDED_SUBTYPES` no `eligibility.ts` para excluir peças e acessórios ("Peças e Acessórios", "Acessórios"), químicos ("Detergente") e categorias que não são máquinas completas recomendáveis ("Varredeiras", "Aspiradores de Pó e Líquidos", "Lavadoras e Secadoras de Piso", "Extratoras", "Higienizadores a Vapor", "Lavadoras de Alta Pressão").
- Links da loja: adicionado campo `productUrl` ao tipo `RecommendationItem` e preenchido no `engine.ts`. Os botões de ação agora abrem o link da máquina na loja (target="_blank").
- Resultado do quiz: removido o preço da máquina. Agora exibe apenas nome, modelo, marca, versão, descrição persuasiva (combina descrição do catálogo + motivo da recomendação) e botão para acessar a máquina na loja.
- Aviso importante: após aplicar todos os filtros de exclusão solicitados (peças, acessórios, detergentes, varredeiras, aspiradores, limpadoras de piso, estratoras, higienizadores a vapor, lavadoras de alta pressão), NÃO RESTA nenhuma máquina no catálogo disponível (121 itens → 0 após todos os filtros combinados com família específica). O usuário precisa revisar quais categorias realmente deseja excluir.

### Identidade corporativa da Kärcher (nesta sessão)
- `src/app/globals.css`: fonte proprietária Klean registrada via @font-face (com fallback Clan Pro → stack geometrico); token --color-brand-yellow-dark (#E6DE00) adicionado para estados hover.
- `src/components/layout/Header.tsx`: header com logo Kärcher (fundo transparente do portal mktkarcher), assinatura "Kärcher Center Dikmaq", navegação (Início / Quiz de máquinas) e CTA "Encontrar minha máquina".
- `src/app/layout.tsx`: inclui Header; mantém lang="pt-BR", fonte Clan Pro via CDN e tema claro.
- `src/app/page.tsx` (home): hero com logo Kärcher + assinatura "Kärcher Center Dikmaq", CTA amarelo da marca.
- `src/components/quiz/QuestionCard.tsx`: número da etapa em badge, legend em tinta da marca, opções selecionadas em amarelo da marca.
- `src/components/quiz/Quiz.tsx`: assinatura Kärcher nas telas de carregamento, perguntas e resultado; cores da marca nos botões.
- `src/components/layout/Footer.tsx`: footer com logo Kärcher Center Dikmaq, contatos ((27) 3066-7638, (31) 3565-5099, WhatsApp (27) 3066-7638, ecommerce@karcherdikmaq.com.br) e redes sociais (Facebook, Instagram, YouTube, TikTok, LinkedIn). Sem rodapé inferior nem termo Tecnologia Tray.
