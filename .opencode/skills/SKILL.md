---
name: quiz-maquinas-dikmaq
description: Implementar, revisar e manter o quiz de recomendação de máquinas da Kärcher Center Dikmaq em Next.js com TypeScript e App Router. Usar para interface, perguntas condicionais, importação Tray, elegibilidade, pontuação, preços e testes deste projeto. Não aplicar a outros projetos ou descrições avulsas de produtos.
---

# Quiz de máquinas — Kärcher Center Dikmaq

## Referência e escopo

Ler [a especificação funcional e técnica](references/quiz-maquinas-nextjs.md) antes de implementar ou alterar comportamento. Consultar seções 3–5 para visual e perguntas; 6–8 para elegibilidade, pontuação e dados; 9–12 para arquitetura e testes; anexos A/B para decisões por ID.

Tratar o documento como especificação, não como código existente. Inspecionar o repositório antes de afirmar implementação. Tratar contagens, preços e estoques como snapshot de 13/11/2026, não dados atuais. O CSV citado não acompanha esta skill: usar o arquivo real fornecido.

Cumprir instruções atuais do usuário e regras aplicáveis do repositório. Documentar mudanças de escopo; não completar lacunas com suposições.

Construir uma experiência em português do Brasil com oito a dez perguntas, uma máquina principal, até duas alternativas compatíveis, motivos verificáveis e link para a referência correta na loja.

Incluir somente máquinas completas e aprovadas. Excluir peças, acessórios, químicos, detergentes e kits de reposição. Não incluir kits comerciais automaticamente. Não oferecer acessórios como resultados secundários.

Usar regras determinísticas no MVP. Não acrescentar IA generativa, RAG, banco vetorial, login, cadastro, checkout ou captura obrigatória de leads sem mudança expressa de escopo.

## Método de implementação

1. Inspecionar estrutura, dependências, scripts, Git e instruções locais.
2. Ler requisitos da etapa e identificar dados disponíveis e pendentes.
3. Implementar a menor etapa funcional coerente com o pedido, preservando as regras do projeto.
4. Separar apresentação, perguntas, validação, catálogo, elegibilidade, pontuação e motivos.
5. Executar verificações adequadas e relatar mudanças, resultados e limitações reais.

Prosseguir no trabalho independente quando faltarem dados técnicos ou comerciais. Marcar pendências e encaminhar para avaliação, sem inventar SKU, contato, capacidade ou disponibilidade. Manter fixtures sintéticas identificadas e fora do catálogo de produção.

## Stack e arquitetura

- Usar Next.js, TypeScript e App Router. Ao criar, escolher versão estável atual e fixar resolução no lockfile. Não atualizar projeto existente sem necessidade.
- Usar Server Components para estrutura e carregamento; limitar Client Components à interação e estado do quiz.
- Manter motor como função pura no servidor, independente de React; fornecer relógio explicitamente para avaliar promoções e validade comercial.
- Usar CSS global para tokens e CSS Modules para componentes. Preservar ferramentas existentes compatíveis; não substituir a identidade por kit visual.
- Validar em runtime com schemas e revalidar no servidor; TypeScript não valida entradas externas.
- Seguir módulos da seção 9: `app`, `components/quiz`, `components/results`, `lib/quiz`, `lib/recommendations`, `lib/catalog`, `data`, `scripts`, `tests`. Adaptar à presença de `src/` sem duplicar estruturas.
- Manter catálogo interno e CSV fora de `public`. Não enviar custos, métricas internas ou CSV bruto ao navegador, nem importá-los por dependência de componente cliente.
- Manter credenciais no servidor; reservar `NEXT_PUBLIC_` para valores públicos.

## Identidade visual

Aplicar estes valores fornecidos pelo usuário:

```css
:root {
  --brand-yellow: #FFED00;
  --brand-ink: #161922;
  --surface: #FFFFFF;
  --surface-muted: #F0F1F3;
  --border: #D5D8DD;
  --border-soft: #E8EAED;
  --text-muted: #555555;
  --text-secondary: #626262;
  --accent: #238C96;
  --font-brand: 'Clan Pro', 'Century Gothic', 'Futura', 'Segoe UI', Arial, sans-serif;
}
```

Carregar globalmente `https://fonts.cdnfonts.com/css/clan-pro` com fallback funcional. Verificar pesos disponíveis; não presumir licença para baixar ou redistribuir fontes.

Usar fundo branco, texto escuro, amarelo nas ações/progresso, bordas finas, raios de 6–10px e espaço generoso. Reservar turquesa para detalhes com contraste verificado. Usar logo somente quando fornecido ou aprovado; não reconstruí-lo.

Usar título principal de 30–48px, perguntas de 24–32px e corpo mínimo de 16px. Combinar cor com marca visual de seleção. Garantir foco visível e alvos de toque de pelo menos 44px.

## Perguntas e navegação

- Implementar textos, IDs e opções da seção 5, sem trocar sua semântica por perguntas genéricas.
- Preservar famílias `pressure`, `extraction`, `vacuum`, `steam`, `floor`, `sweep`, `drain`, `pet`.
- Mostrar uma pergunta por tela, seleção única e botão Continuar; não avançar automaticamente.
- Usar Q1–Q8 como base e Q9/Q10 conforme necessidade. Não repetir informação resolvida ou omitir verificação técnica para fechar contagem.
- Recalcular progresso pelo caminho vigente e avisar sobre perguntas adicionais.
- Preservar respostas válidas ao voltar; limpar dependências incompatíveis ao alterar respostas. Alteração de Q1 exige revisar Q4/Q5/Q7 e limpar verificações específicas. Alteração de Q7 exige recalcular pergunta de automação.
- Manter estado local; permitir `sessionStorage` versionado opcional. Não persistir histórico individual no servidor ou dados pessoais na URL.
- Não pedir nome, CPF, endereço ou telefone para revelar resultado.

## Catálogo e importação

Importar inicialmente por CLI. Usar parser CSV com `;`, aspas e campos multilinha; detectar UTF-8/BOM e converter Windows-1252 explicitamente. Não usar `split(';')`.

Validar headers, IDs únicos, números e valores em centavos. Preservar referência literalmente. Limpar HTML com parser, removendo scripts, estilos e iframes. Validar domínio dos produtos e imagens HTTPS.

Gerar catálogo interno, projeção pública mínima, exclusões e pendências por ID. Quarentenar linhas inválidas com motivo. Registrar fonte, hash, versão, importação e revisão manual. Invalidar aprovação afetada quando mudar conteúdo técnico relevante.

Preservar regressões do catálogo inicial:

- Excluir químicos IDs 353/355 e acessórios IDs 601/603.
- Excluir HG 64 ID 205 dos resultados: equipamento complementar, não lavadora autônoma.
- Classificar ID 459 como bomba e ocultá-lo enquanto não exibido na loja.
- Manter IDs 579/583 separados, mesmo com nomes parecidos.

Conferir 71 candidatas, 143 exclusões e um complementar somente ao importar o CSV original. Não impor essas contagens a exportações futuras.

## Elegibilidade e pontuação

Aplicar filtros antes de pontuar, nesta ordem:

1. Máquina completa aprovada para o quiz.
2. Família e aplicação compatíveis.
3. Material, limitações, contexto e regime documentados.
4. Alimentação, tensão, fase e variante confirmadas.
5. Requisitos obrigatórios atendidos, inclusive automação e acessórios necessários inclusos.
6. Visibilidade e situação comercial válidas.
7. Preço confirmado dentro do teto, quando informado.

Tratar desconhecido como pendência, nunca como compatibilidade. Não inventar SKU, voltagem ou capacidade pelo nome. Não equiparar potência/PSI a ciclo de trabalho, carregador bivolt à alimentação da máquina, vapor à extração ou aspiração de líquidos à lavagem.

Encaminhar materiais perigosos, combustíveis, solventes, poeira potencialmente nociva e usos industriais sem aprovação. Para gasolina, exigir evidência de uso externo apropriado. Não atender água quente com HD de água fria ou HG 64 isolado.

Pontuar somente elegíveis usando tabelas aprovadas da seção 6: rotina até 35, prioridade até 30, ambiente/mobilidade até 20, investimento até 15. Para economia, usar `15 * (menorPrecoElegivel / precoProduto)` com preços positivos em centavos. Não derivar tags aprovadas pelo nome ou pontuar margem, comissão ou excesso de estoque.

Desempatar por aderência à prioridade, menor preço confirmado e ID crescente. Retornar códigos estáveis e até três motivos com evidência. Garantir mesma ordem e motivos para mesmas respostas, versões e instante efetivo de avaliação.

## Preço, estoque e resultado

Implementar `buyable`, `quote`, `unavailable`, `hidden`, `review` conforme seção 6.2. Preço zero não significa grátis ou orçamento aprovado. Estoque zero bloqueia compra direta no MVP. Política de manter ativo não comprova estoque vendável.

Validar promoção com preço positivo, inferior ao regular e intervalo válido, com término inclusivo em `America/Sao_Paulo`. Registrar inconsistências.

Usar validade comercial configurável, inicialmente 24 horas. No modo snapshot, identificar preço como referência da atualização e informar “Confirme preço e disponibilidade na loja”. Ao vencer, ocultar preço e promessa de estoque; encaminhar para confirmação.

Retornar `direct`, `quote`, `needs-review`, `no-match`. Exibir uma principal e até duas alternativas compatíveis, sem repetir variantes. Não preencher cartões com incompatíveis nem inventar porcentagens de adequação. Orçamento baixo não autoriza relaxar requisitos ou aumentar o teto.

Usar “Ver máquina na loja”, “Solicitar orçamento” ou “Confirmar com um especialista” conforme estado. Se faltar contato aprovado, registrar configuração pendente; não inventar número. Permitir alterar respostas e refazer quiz.

## API, integrações e privacidade

Implementar `POST /api/recommendations` com `{ answers, questionnaireVersion }`. Validar versão, família, opções e perguntas condicionais. Recalcular com catálogo do servidor; não confiar em preço, score ou produto enviados pelo cliente.

Retornar 200 para os quatro estados de negócio, 400 para respostas inválidas, 409 para versão incompatível e 503 para falha no carregamento do catálogo. Não expor erro interno, custo ou credencial.

Limitar corpo, aplicar controle de abuso apropriado à hospedagem e comparar origem nos fluxos do navegador. Não usar memória local como única proteção serverless. Versionar cache e evitar compartilhar respostas individuais indevidamente.

Verificar documentação vigente antes de integrar endpoints Tray. Manter publicação, domínio e alterações da loja no escopo autorizado. Verificar suporte antes de iframe; usar altura responsiva e origem validada em `postMessage`.

Ativar analytics segundo consentimento/configuração da loja. Registrar somente IDs de opções, versões e produtos. Não registrar payload completo, dados pessoais ou enviar mensagens automáticas ao vendedor.

## Verificação e entrega

Usar testes unitários para parser, elegibilidade, preço e determinismo; integração para contratos da API; Playwright ou equivalente para jornadas. Reaproveitar ferramentas existentes.

Cobrir preço/estoque zero, snapshot vencido, promoções, referências distintas com nome parecido, tensão/fase/SKU pendentes, orçamento insuficiente, automação obrigatória, material incompatível e IDs excluídos.

Verificar todas as famílias e caminhos sem correspondência; retorno e alteração de respostas. Usar `fieldset`, `legend`, rádios e labels reais. Conferir teclado, foco no título ao avançar, erros associados, leitor de tela e redução de movimento.

Conferir 360, 768 e 1440px, zoom de 200%, ausência de rolagem horizontal e fallback de fonte/imagem. Reservar dimensões de imagens e restringir hosts externos.

Executar lint, checagem de tipos e build pelos scripts reais. Não declarar teste sem execução, integração sem conexão ou publicação com apenas arquivos locais. Relatar o que mudou, validações e pendências que bloqueiam resultado direto ou lançamento.
