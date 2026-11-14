# Requisitos

## Requisitos

Quiz de máquinas — Kärcher Center Dikmaq
Especificação funcional e técnica para implementação em Next.js. Versão 1.0 · 13/11/2026.

1. Objetivo e limites da entrega
   Criar uma experiência em português do Brasil que faça de 8 a 10 perguntas e indique uma máquina do catálogo da Dikmaq, acompanhada dos motivos da indicação, de até duas alternativas compatíveis e de um link para o produto. Atender uso residencial e profissional, com perguntas em linguagem simples.

Este documento define o sistema a ser desenvolvido; não é um aplicativo já implementado. O CSV fornecido é a base inicial. Não usar o HTML de referência como página pronta: aproveitar apenas sua identidade visual.

Escopo: máquinas completas. Excluir peças, acessórios, químicos, detergentes e kits de reposição. Não oferecer esses itens nem como resultado secundário ou complemento. Kits comerciais só poderão entrar futuramente após revisão expressa que confirme uma máquina completa como item principal; nenhum kit será incluído automaticamente.

O MVP usa regras determinísticas e dados estruturados. Não exige IA, RAG, banco vetorial ou geração de respostas livres. Uma mesma combinação de respostas, catálogo e regras deve produzir o mesmo resultado. 2. Catálogo recebido e achados
Fonte: produtos_1276888_78fdd05c-055b-403a-bebb-92cb877d5450.csv.

- 215 registros, separados por ponto e vírgula, codificação Windows-1252 nesta exportação.
- 71 máquinas candidatas após a classificação inicial por produto.
- 143 itens excluídos por serem peças, acessórios ou químicos.
- 1 gerador de água quente complementar, ID 205, separado para revisão e excluído dos resultados do MVP. Não deve ser confundido com uma lavadora completa.
- Das 71 máquinas, 70 estão marcadas para exibição e uma está oculta: bomba SP 11.000 Dirt, ID 459.
- 21 máquinas têm preço de venda zero. Isso é uma pendência comercial: não comprova que a venda seja sob consulta.
- 14 máquinas têm estoque zero. Os grupos de preço zero e estoque zero podem se sobrepor.
- Todas as 71 estão com Disponível = Sim, portanto esse campo isolado não determina disponibilidade para compra.
- As 71 possuem descrição, imagem principal, referência e URL preenchidas; preenchimento não comprova qualidade ou validade do conteúdo.
- Não há coluna de variações/SKUs de voltagem nesta exportação. Existe somente uma característica de voltagem do carregador para alguns produtos.
  Problemas que a importação precisa tratar
  Caso real Tratamento obrigatório
  Deterjet Gel ID 353 e desengraxante RM 31 ID 355 em Lavadoras de Alta Pressão Excluir por identidade do produto, apesar da categoria
  Escova ID 603 em Varredeiras Excluir; é acessório
  Filtro ID 601 em Aspiradores e Extratoras Excluir; é peça/acessório
  Bomba ID 459 em Lavadoras de Alta Pressão Classificar como bomba de drenagem; manter fora por estar oculta
  Gerador HG 64 ID 205 Fora do quiz até avaliação de operação e dependência de outra máquina
  NT 40/1 IDs 579 e 583 Preservar separadamente: referências 14287310nt40 e 11489880; o segundo tem modelo NT 40/1 AP L
  Descrições com CSS, links e iframes Extrair texto útil; nunca executar ou reproduzir esse HTML
  Estoques recorrentes de 100 em itens de preço zero Confirmar com a operação antes de anunciar pronta entrega
  Números como 4/16, 4/20 e 4/30 Não converter automaticamente em capacidade ou produtividade

A classificação inicial do anexo é rastreável aos IDs do arquivo, mas a indicação técnica requer aprovação das aplicações e restrições. Não publicar todas as máquinas automaticamente só porque foram identificadas como máquinas. 3. Identidade visual
Usar os valores fornecidos pelo usuário como referência de projeto, sem presumir que este documento seja um manual oficial completo da marca.
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
Fonte de referência: https://fonts.cdnfonts.com/css/clan-pro. Carregar a folha globalmente, com fallback funcional caso o CDN falhe. Para hospedagem local, obter primeiro os arquivos e a autorização de uso correspondentes. Não presumir que o CDN entregue todos os pesos: verificar os disponíveis na implementação.

Diretrizes:

- Fundo branco; amarelo para ação principal, seleção e progresso; texto escuro sobre amarelo.
- Títulos com peso 900 e espaçamento de -1px, conforme referência; corpo 400/500; botões 700/800.
- Título principal responsivo entre 30 e 48px; perguntas entre 24 e 32px; corpo de 16px ou mais.
- Bordas de 1px, raios de 6–10px, sombra discreta e espaço generoso entre opções.
- Estado selecionado com borda escura, fundo amarelo suave e ícone de confirmação; não depender só da cor.
- Turquesa apenas em detalhes; verificar contraste antes de usá-lo para texto pequeno.
- Botões com área de toque mínima de 44px; foco visível escuro, inclusive sobre amarelo.
- Usar logo somente se fornecido ou aprovado pela empresa. Não reconstruir um logotipo com tipografia aproximada.
- Não incorporar os iframes, vídeos, alturas fixas ou estilos de descrição do exemplo enviado.

4. Experiência e telas
   Início
   Título: Encontre a máquina ideal para sua limpeza.

Texto: Responda algumas perguntas sobre sua rotina e conheça as opções que combinam com o que você precisa.

Botão: Encontrar minha máquina. Apoio: De 8 a 10 perguntas. Sem cadastro. Não prometer tempo exato antes de medir o uso real.
Perguntas
Uma pergunta por tela, com opções em cartões, botão Continuar e botão Voltar. Não avançar automaticamente ao selecionar. Exibir progresso calculado pelo caminho vigente e informar que perguntas adicionais podem aparecer. Voltar deve preservar respostas válidas; alterar uma resposta deve limpar as dependentes incompatíveis.
Resultado

- Resumo editável das respostas.
- Uma recomendação principal e no máximo duas alternativas compatíveis, sem repetir a mesma versão como outra máquina.
- Foto, nome, versão confirmada, preço vigente ou estado comercial, até três motivos concretos e observações relevantes.
- Ação Ver máquina na loja; para orçamento confirmado, Solicitar orçamento; para pendências, Confirmar com um especialista.
- Botões Alterar respostas e Refazer quiz.
- Não exibir “100% compatível”, porcentagem inventada de adequação, promessa de resultado ou garantia de rendimento.
- Não mostrar alternativa incompatível só para preencher três cartões.
  Sem resultado direto
  Texto: Precisamos confirmar alguns detalhes para indicar uma máquina adequada ao seu uso. Mostrar a razão concreta: ausência de versão confirmada, catálogo sem opção disponível, requisito industrial, orçamento insuficiente ou falta de informação técnica.

Oferecer Falar com um especialista, com resumo das respostas para copiar ou encaminhar. O telefone/WhatsApp deve vir de configuração aprovada; não inventar contatos nem usar números antigos extraídos de descrições. 5. Perguntas e respostas
As perguntas Q1–Q8 formam a base. Q4 e Q5 mudam o conteúdo conforme a família. Q9 e Q10 aparecem quando necessárias. O limite é de dez perguntas efetivamente exibidas por sessão, não dez por família.

Não solicitar nome, CPF, endereço ou telefone para revelar o resultado. Todas as respostas são de escolha única, exceto se explicitamente definido em evolução futura.
Q1 · Qual é a principal tarefa que você quer realizar?
ID: goal.
ID da resposta Texto exibido Família inicial
pressure Lavar veículos, calçadas ou áreas externas com jato de água Lavadoras de alta pressão
extraction Lavar sofás, colchões, carpetes ou estofados com extração Extratoras
vacuum Aspirar sujeira em casa, na empresa ou na oficina Aspiradores
steam Limpar superfícies com vapor Limpadoras a vapor
floor Esfregar e limpar pisos com máquina Limpadoras/secadoras de piso
sweep Recolher folhas, poeira e resíduos soltos do chão Varredeiras
drain Retirar água acumulada com uma bomba Bombas de drenagem
pet Aspirar pelos durante os cuidados com o pet Equipamento Pet Clean

Não listar modelos aqui. Piso externo com jato, piso com rolos/escovas e varrição são objetivos diferentes. A rota de drenagem existe, mas no arquivo atual termina em atendimento porque a única bomba está oculta. Não inventar uma alternativa de outra família.
Q2 · Onde e para quem a máquina será usada?
ID: context. Opções:

- home: Em casa, para uso próprio.
- business: Na limpeza da minha empresa ou condomínio.
- service: Para prestar serviços de limpeza.
- industrial: Em operação industrial, urbana ou de grande porte.
  Uso profissional não torna automaticamente uma máquina residencial apta. Contexto industrial exige tags de aplicação aprovadas ou encaminhamento técnico.
  Q3 · Com que frequência pretende usar a máquina?
  ID: frequency. Opções: occasional Algumas vezes por mês; weekly Algumas vezes por semana; daily Todos os dias; extended Por períodos prolongados ou em vários serviços por dia.

Frequência não equivale a ciclo de trabalho. Não inferir horas contínuas pela potência, pressão ou nome comercial. Uso prolongado requer validação documentada do regime de trabalho.
Q4 · Qual é o principal ambiente ou material da limpeza?
ID: surface. Exibir somente a linha correspondente à Q1.
Família Opções exibidas e IDs
pressure Veículos leves (cars); calçadas e quintais (outdoor); frota ou equipamentos (fleet); ambiente industrial (industrial)
extraction Sofás e poltronas (sofa); colchões (mattress); carpetes (carpet); estofados automotivos (car-seats)
vacuum Pisos e móveis de casa (home); escritórios e lojas (office); oficinas e manutenção (workshop); carpetes (carpet)
steam Pisos compatíveis com vapor (floor); cozinha (kitchen); banheiro e rejuntes (bathroom); superfícies variadas (mixed)
floor Piso interno residencial (home); loja ou escritório (commercial); condomínio (condominium); galpão ou grande área (warehouse)
sweep Quintal ou calçada (outdoor); estacionamento (parking); galpão (warehouse); ruas e áreas urbanas (urban)
drain Água acumulada em área alagada (flood); esvaziamento de reservatório (tank); outro local (other)
pet Cães (dog); gatos (cat); ambos (both)

As respostas expressam a necessidade, não certificam compatibilidade de qualquer modelo. Não afirmar que vapor serve para todos os pisos ou tecidos. Materiais delicados e aplicações não documentadas devem levar à confirmação.
Q5 · Qual é o volume aproximado da sua rotina?
ID: workload. Texto e opções por família:
Família Pergunta e opções
pressure Quanto pretende lavar por dia de uso? Uma tarefa pontual (light); vários veículos ou áreas (medium); frota ou operação extensa (high); ainda não sei (unknown)
extraction Quantos atendimentos pretende realizar por dia? Uso próprio, sem atendimentos (personal); 1 a 2 (one-two); 3 ou mais (three-plus); ainda não sei (unknown)
vacuum Qual é a área aproximada da rotina? Até 100 m² (small); de 101 a 500 m² (medium); acima de 500 m² (large); não sei (unknown)
steam Qual é a extensão da limpeza? Pontos específicos (spot); um ou poucos ambientes (rooms); vários ambientes na mesma rotina (many); não sei (unknown)
floor Qual é a área aproximada por limpeza? Até 100 m² (small); 101 a 500 m² (medium); 501 a 2.000 m² (large); mais de 2.000 m² (very-large); não sei (unknown)
sweep Qual é a área aproximada por limpeza? Até 200 m² (small); 201 a 1.000 m² (medium); mais de 1.000 m² (large); não sei (unknown)
drain Qual é o volume aproximado a retirar? Até 1.000 litros (small); acima de 1.000 litros (large); não sei (unknown)
pet Quantos animais fazem parte da rotina? Um (one); dois ou três (few); mais de três (many); uso em estabelecimento profissional (business)

Essas faixas são escolhas de interface para caracterizar demanda. Não são capacidade certificada ou limite técnico de nenhum produto. Os limites por máquina só entram após validação. Não converter produtividade teórica em produtividade real sem ressalvas e fonte.
Q6 · Qual alimentação você tem disponível no local?
ID: power. Opções: 127-single Tomada 127 V monofásica; 220-single Tomada 220 V monofásica; both-single Tenho 127 V e 220 V monofásicas; three-phase Rede trifásica, a confirmar; off-grid Não tenho energia no ponto de trabalho; unknown Não sei informar.

O cliente informa a infraestrutura, não escolhe automaticamente uma máquina a bateria ou gasolina. Bateria requer carregamento compatível; gasolina não deve ser indicada para ambiente fechado. Rede trifásica sem tensão confirmada exige atendimento para produtos dependentes desse requisito. Não apresentar 220 V monofásico e trifásico como equivalentes.
Q7 · O que é mais importante para você?
ID: priority. Mostrar apenas opções que podem existir na família, sem prometer disponibilidade.

- economy: Menor investimento entre as opções adequadas.
- mobility: Facilidade de transportar e guardar.
- capacity: Menos interrupções durante a rotina.
- quiet: Menor ruído, quando houver dados comparáveis.
- automation: Limpeza automática, disponível na rota de aspiradores.
- cordless: Liberdade para trabalhar sem cabo, quando aplicável.
  Se o cliente selecionar automação, restringir a seleção automática a robôs com função correspondente comprovada. Se não houver estoque/compatibilidade, informar essa ausência; não trocar silenciosamente por aspirador manual.
  Q8 · Qual é o seu limite de investimento?
  ID: budget. Opções: até R$ 500 (500); até R$ 1.000 (1000); até R$ 2.000 (2000); até R$ 3.500 (3500); até R$ 6.000 (6000); até R$ 15.000 (15000); sem limite definido / prefiro orçamento (open).

Cada faixa é um teto, não um intervalo exclusivo. Faixas podem ser reduzidas por família desde que a opção aberta permaneça. Nunca excluir definitivamente uma família porque o orçamento é baixo. Explicar quando não existe opção compatível no teto informado. Sem preço confirmado, não declarar que o produto cabe no orçamento.
Q9 e Q10 · Verificações por família
Família Q9 Q10
pressure Há abastecimento de água no local? Torneira/rede; reservatório; não sei A limpeza exige água quente ou envolve gordura pesada? Não; sim; não sei
extraction O material permite limpeza úmida com extração? Sim; não; não sei Há necessidade obrigatória de limpar carpetes/pisos com bocal específico? Não; sim; não sei
vacuum Qual sujeira será aspirada? Pó doméstico; pó e líquidos comuns; pó fino de obra; material perigoso ou não identificado Somente quando relevante: precisa obrigatoriamente de automação? Sim; não; não sei. Se Q7 já resolveu isso, não repetir
steam A superfície tem liberação para uso de vapor? Sim; não; não sei Precisa reabastecer durante a rotina, sem aguardar resfriamento? Sim; não; não sei
floor Qual o piso? Cerâmica/porcelanato; concreto; madeira/laminado; outro/não sei Qual condição afeta o trabalho? Área livre; corredores/obstáculos; desníveis/escadas; não sei
sweep Qual resíduo predomina? Folhas e resíduos soltos; poeira fina; misto comum; perigoso/não identificado Qual condição afeta o trabalho? Área plana; corredores/obstáculos; rampas/irregularidades; não sei
drain Como é a água? Limpa; com partículas; com químicos/resíduos desconhecidos; não sei Qual a altura aproximada de elevação? Até 2 m; acima de 2 m; não sei
pet A principal necessidade é recolher pelos durante escovação/tosa? Sim; não; não sei O equipamento será usado em casa ou em serviço profissional? Não repetir Q2: usar apenas se a resposta de Q2 não esclareceu essa condição

Na rota pet, normalmente serão nove perguntas; outras rotas terão nove ou dez. Na rota vacuum, oito perguntas base mais Q9, com Q10 apenas se ainda necessária. Não omitir pergunta técnica obrigatória para cumprir um número fixo. 6. Árvore de decisão e elegibilidade
Fluxo: objetivo → contexto e rotina → requisitos de aplicação e energia → disponibilidade comercial → pontuação de preferências → resultado explicado.
6.1 Filtros obrigatórios antes de pontuar

1. Produto classificado como máquina completa e aprovado para o quiz.
2. Família e aplicação compatíveis com as respostas.
3. Limitações, materiais, regime de trabalho e contexto atendidos com evidência.
4. Fonte de energia, tensão, fase e versão compatíveis e confirmadas.
5. Requisito obrigatório atendido: automação, bocal incluído, uso de água quente etc.
6. Visibilidade e situação comercial válidas.
7. Preço dentro do teto, se houver preço e teto definidos.
   Dados desconhecidos não contam como compatibilidade. Um candidato pendente pode ser mostrado em uma seção de avaliação com especialista, mas não como máquina confirmada para compra. Todos os dados essenciais precisam estar confirmados para direct.

Proibir seleção automática quando houver material perigoso, combustível/solvente a aspirar, poeira potencialmente nociva, requisito industrial não aprovado ou incompatibilidade de superfície. O quiz não classifica riscos de poeira nem comprova que um aspirador antiestático possa ser usado com materiais inflamáveis.

Para gasolina, exigir evidência de uso externo apropriado; sem confirmação, encaminhar. Requisito de água quente não pode ser atendido por uma HD de água fria ou por HG 64 isoladamente.
6.2 Estados comerciais
Estado Condição Exibição
buyable Publicado, habilitado, estoque vendável confirmado, preço válido e versão validada Link de produto com preço e data de atualização
quote Venda sob consulta confirmada pela equipe, independente de valor zero no CSV Solicitar orçamento; nunca R$ 0,00 ou grátis
unavailable Sem estoque vendável ou indisponível Não ser recomendação principal; opcionalmente mostrar como indisponível em seção separada
hidden Não exibido, inativo ou excluído do quiz Não expor no resultado público
review Dados comerciais contraditórios, preço zero sem validação ou versão desconhecida Encaminhar para confirmação; sem promessa de compra ou entrega

Não tratar a política “manter ativo” como autorização para vender sem estoque. Para MVP, estoque zero bloqueia compra direta; exceções de encomenda precisam de aprovação explícita. Reservas e estoque por variação deverão ser consultados quando houver integração real.
6.3 Pontuação das preferências
Somente produtos que passaram por todos os filtros participam. A pontuação ordena candidatos; não comprova capacidade.
Critério Pontos máximos Regra
Adequação à rotina declarada 35 Tags aprovadas para frequência e volume, com tabela versionada
Prioridade escolhida 30 Característica documentada, sem pontuar ausência de informação
Ambiente e mobilidade 20 Compatibilidade validada com o cenário e preferência
Investimento 15 Para economia, menor preço vigente entre elegíveis; demais prioridades usam a mesma regra documentada sem favorecer produto mais caro

Para economia: 15 \* (menorPrecoElegivel / precoProduto), com preços positivos em centavos; não aplicar a itens sob consulta. Não normalizar ruído medido em condições diferentes. Os demais pontos precisam de tabelas de tags aprovadas, sem inferência automática pelo nome do modelo. Não misturar métricas mbar e Pa ou produtividade prática e teórica sem conversão e contexto explícitos.

Desempate: maior aderência à prioridade, menor preço confirmado, ID do produto em ordem crescente. Preços desconhecidos vêm depois dos conhecidos apenas quando orçamento aberto e modalidade de orçamento aprovada. Não pontuar margem, comissão, quantidade vendida ou estoque excedente.

Retornar motivos com códigos estáveis e textos correspondentes. Exemplo: “Indicada para extração em estofados, conforme a aplicação cadastrada” e “Versão 220 V confirmada para a sua instalação”. Nunca gerar um motivo para um dado não validado. Se não houver explicação suficiente, não liberar resultado direto. 7. Tratamento dos modelos reais

- Alta pressão: K2/K3/K4/K5/K530/Portátil e HD/HDS entram em famílias técnicas próprias; residencial/profissional precisa vir de dado confiável. Não escolher somente por PSI nem presumir que todos os HD tenham o mesmo ciclo de trabalho.
- Extração: Puzzi 4/15, 4/16, 4/20 e 4/30 existem no arquivo. Validar capacidade, acessórios e aplicações de cada referência; não supor que maior número significa maior produtividade. A 4/15 está sem estoque no snapshot.
- Aspiração: separar aspirador seco, pó e líquidos, vertical, industrial e robô. Não indicar T 14/1 ou VCL para aspirar líquidos sem comprovação. Não atribuir função de lavagem a qualquer aspirador de líquidos.
- Vapor: SC 2 Premium e SC 4 Premium, sujeitos à compatibilidade da superfície e ao recurso real de abastecimento. Não apresentar como substitutos universais das extratoras.
- Pisos: separar FC 7 residencial das BD/BR e máquinas embarcadas profissionais. Área, manobrabilidade e tipo de piso precisam de limites aprovados.
- Varrição: S4/S6, KM e MC 600 têm cenários distintos. MC 600 é equipamento urbano para encaminhamento especializado, não alternativa automática a uma S4.
- Pet Clean: rota própria, não alternativa automática para todo caso de pelo no piso. Uso profissional e espécies dependem da aplicação documentada.
- Bombas: SP 11.000 é máquina de drenagem, não lavadora de pressão; permanece fora da vitrine enquanto oculta.

8. Contrato de dados e importação
   8.1 Fontes e precedência
1. CSV atual para identidade e snapshot comercial.
1. Características estruturadas para extração inicial, sem dispensar revisão.
1. Descrição limpa para localizar informações complementares e URLs de manuais.
1. Manuais/fichas oficiais da referência exata para validar restrições e especificações.
1. Aprovação comercial para visibilidade, consulta, estoque e variações.
   Conflitos são pendências. Não substituir automaticamente um valor divergente. Registrar campo, fontes, valores conflitantes, decisão e responsável. Não usar o HTML ilustrativo como dado de todos os modelos.
   8.2 Mapeamento do CSV
   Coluna de origem Campo interno Tratamento
   Código produto id String estável, sem gerar pelo título
   Referência reference Preservar literalmente
   Nome produto / Modelo / Marca name / model / brand Texto limpo, sem fundir referências
   Nome categoria sourceCategory Contexto; não é classificador suficiente
   Descrição grande descriptionText Parser HTML; remover scripts, estilos, iframes e navegação
   Imagem principal imageUrl URL HTTPS válida; placeholder em caso de falha
   Endereço do Produto (URL Tray) productUrl Preservar a URL, validar domínio permitido
   Preço venda regularPriceCents Converter formato pt-BR para inteiro em centavos
   Preço promoção / Inicio promoção / Fim promoção promotion Validar preço e intervalo no fuso America/Sao_Paulo
   Estoque atual stockSnapshot Número finito; não equivale a estoque por variante
   Disponível / Exibir na loja enabled / visible Mapear Sim/Não explicitamente
   Quando acabar o estoque outOfStockPolicy Preservar; sem sobrepor bloqueio de venda
   Itens inclusos includedItems Texto limpo; acessórios só como informação da máquina
   Característica: ... specifications Manter unidade, fonte e pendências

Não exportar ao navegador preço de custo, custo em dólar, métricas internas de vendas ou o CSV original. A aplicação pública recebe apenas campos necessários para recomendar e exibir produtos.
8.3 Tipos de referência
type Family = 'pressure' | 'extraction' | 'vacuum' | 'steam'
| 'floor' | 'sweep' | 'drain' | 'pet';
type ReviewState = 'pending' | 'approved' | 'rejected';
type CommercialState = 'buyable' | 'quote' | 'unavailable' | 'hidden' | 'review';
type Evidence<T> = {
value: T | null;
source: { kind: 'csv' | 'manual' | 'review'; locator: string; field?: string };
state: ReviewState;
reviewedAt?: string;
};
type Machine = {
id: string;
reference: string;
name: string;
model: string;
family: Family;
subtype: string;
isCompleteMachine: boolean;
quizStatus: ReviewState;
imageUrl: string;
productUrl: string;
descriptionText: string;
contexts: Evidence<string[]>;
applications: Evidence<string[]>;
limitations: Evidence<string[]>;
dutyProfile: Evidence<string[]>;
workloadBands: Evidence<string[]>;
priorityTags: Evidence<string[]>;
specifications: Record<string, Evidence<string | number | boolean>>;
variants: {
id: string;
voltage: Evidence<'127' | '220' | 'bivolt' | 'other' | 'none'>;
phase: Evidence<'single' | 'three' | 'none'>;
powerSource: Evidence<'mains' | 'battery' | 'gasoline' | 'manual'>;
stock: number | null;
priceCents: number | null;
commercialState: CommercialState;
}[];
commercial: {
regularPriceCents: number | null;
promotion: { priceCents: number; startsOn: string; endsOn: string } | null;
state: CommercialState;
stockSnapshot: number | null;
enabled: boolean;
visible: boolean;
quoteApproved: boolean;
};
source: { fileName: string; productId: string; importedAt: string; hash: string };
};
type QuizAnswers = {
goal: Family;
context: 'home' | 'business' | 'service' | 'industrial';
frequency: 'occasional' | 'weekly' | 'daily' | 'extended';
surface: string;
workload: string;
power: string;
priority: string;
budget: number | 'open'; // número em centavos; converter IDs da interface
checks: Record<string, string>; // união validada por família no schema
};
type RecommendationResult = {
status: 'direct' | 'quote' | 'needs-review' | 'no-match';
catalogVersion: string;
rulesVersion: string;
evaluatedAt: string;
recommendations: {
productId: string;
variantId: string | null;
reasonCodes: string[];
reasons: string[];
caveats: string[];
priceCents: number | null;
commercialState: CommercialState;
}[];
reviewReasons: string[];
};
Esses tipos orientam a implementação. Completar schemas em runtime com uniões por família, opções permitidas e obrigatoriedade das perguntas condicionais. Uma variante não pode receber ID de SKU inventado: se o CSV não a trouxer, manter a confirmação pendente até obter a exportação ou consulta correta. Especificação do carregador bivolt não torna a máquina equivalente a qualquer alimentação.
8.4 Processo de atualização

- Importação inicial por script de linha de comando, sem tela administrativa pública.
- Detectar BOM/UTF-8 quando presente; aceitar Windows-1252 com conversão explícita. Usar parser CSV com suporte a aspas e campos multilinha; não fazer split(';').
- Validar headers obrigatórios, IDs únicos e valores monetários. Quarentenar linhas inválidas; relatório com motivos, sem silenciosamente descartá-las.
- Classificador inicial + arquivo de decisões por ID. Reimportação preserva revisão manual enquanto referência e conteúdo técnico relevante não mudarem. Alteração técnica invalida a aprovação afetada.
- Gerar catálogo interno, catálogo público reduzido, relatório de excluídos e relatório de pendências. Versionar hash do arquivo e regras.
- Promoção só vale quando preço positivo e inferior ao regular, com datas válidas. Final do período inclusivo no fuso da loja. Sem intervalo válido, usar preço regular e registrar pendência.
- No MVP sem integração, identificar preço como referência da atualização e informar Confirme preço e disponibilidade na loja. Definir validade comercial de 24 horas como parâmetro inicial; passado o prazo, ocultar preço e promessa de estoque, mantendo apenas consulta/encaminhamento. Não converter catálogo antigo em recomendação confirmada para compra.
- Evolução: sincronizar catálogo e variantes pela integração autorizada da Tray, com credenciais apenas no servidor. A disponibilidade desses endpoints deverá ser verificada na documentação vigente durante a implementação.

9. Arquitetura proposta em Next.js
   Usar Next.js com App Router e TypeScript em versão estável suportada no início da implementação, com versões fixadas no lockfile. CSS global e CSS Modules são suficientes; não depender de um kit visual que substitua a identidade definida.

Página inicial e estrutura renderizadas no servidor; componente cliente apenas para navegação e seleção. Motor de regras como função pura no servidor, independente de React. Validação compartilhada para perguntas e respostas; servidor sempre valida novamente.
app/
layout.tsx
page.tsx
globals.css
quiz/page.tsx
api/recommendations/route.ts
components/
quiz/Quiz.tsx
quiz/QuestionCard.tsx
quiz/Progress.tsx
results/RecommendationCard.tsx
results/ReviewState.tsx
lib/
quiz/questions.ts
quiz/schema.ts
quiz/flow.ts
recommendations/eligibility.ts
recommendations/scoring.ts
recommendations/reasons.ts
recommendations/engine.ts
catalog/load.ts
catalog/pricing.ts
catalog/schema.ts
data/
catalog.internal.json
quiz-overrides.json
rules.json
scripts/
import-catalog.ts
tests/
recommendations.test.ts
import-catalog.test.ts
quiz.spec.ts
Os caminhos acima descrevem módulos planejados, não arquivos já entregues. data não fica em public. A fonte CSV com custos deve permanecer em diretório privado/fora do repositório público.
Endpoint de recomendação
POST /api/recommendations recebe { answers, questionnaireVersion }. Valida formato, família, consistência entre respostas, número de perguntas e versão. Recalcula elegibilidade com dados do servidor; não aceitar preço, score ou IDs de produto fornecidos pelo cliente como autoridade.

Retornar 200 com um dos quatro estados do contrato; 400 para respostas inválidas; 409 para versão incompatível do questionário; 503 quando catálogo não puder ser carregado. Nunca devolver erro interno, custo ou credencial. Resultado sem correspondência não é erro HTTP.

Usar validação de corpo, limite de tamanho, proteção contra abuso compatível com a hospedagem e comparação de origem em fluxos do navegador. Configurar cache e invalidação por versão de catálogo; não compartilhar resposta personalizada indevidamente. Um controle apenas em memória não deve ser a única proteção em ambiente serverless.
Estado do quiz
Manter respostas em estado local; usar sessionStorage opcional para recuperar a sessão. Não colocar respostas pessoais ou conteúdo livre na URL. Sem login, cadastro ou captura obrigatória de lead. Ao mudar Q1, limpar Q4/Q5/Q7 incompatíveis e todas as verificações; ao mudar Q7, recalcular necessidade da pergunta de automação. 10. Hospedagem e integração com a loja
MVP independente, com deploy previsto em Vercel ou hospedagem compatível com Next.js. Criar o link Encontre sua máquina ideal na loja após a aplicação estar validada. O domínio/subdomínio depende da configuração aprovada pela empresa; não presumir endereço já existente.

A incorporação na Tray é uma etapa opcional posterior: verificar suporte e restrições do tema antes de usar iframe. Caso incorporado, implementar altura responsiva com origem validada no postMessage, navegação acessível e teste em celular. Não usar alturas fixas de milhares de pixels.

Configurações previstas: URL pública da loja, canal de atendimento aprovado, versão do catálogo, validade comercial e integrações opcionais. Credenciais ficam em variáveis do servidor; somente valores realmente públicos podem usar prefixo NEXT*PUBLIC*.

Não publicar nem alterar a loja durante a elaboração desta especificação. O MVP não realiza checkout nem pagamento: encaminha para a página correta da máquina. 11. Conteúdo, acessibilidade e medições

- Português claro; explicar termos como extração e trifásico em ajuda contextual curta.
- fieldset, legend, inputs de rádio reais e labels associados; teclado e leitor de tela funcionais.
- Ao avançar, foco no título da nova pergunta; ao retornar, manter seleção e posição coerentes.
- Mensagem de erro ligada ao grupo, progresso anunciado sem interrupções excessivas e suporte a redução de movimento.
- Layout verificado a 360, 768 e 1440px, zoom de 200%, sem rolagem horizontal.
- Imagens proporcionais em object-fit: contain, com dimensões reservadas e texto alternativo. Validar hosts externos; não usar configuração irrestrita de imagens.
- Eventos opcionais: quiz_started, question_answered, quiz_completed, recommendation_viewed, product_clicked, specialist_clicked, quiz_no_match.
- Registrar IDs de opções, versão das regras e IDs de produto; não coletar dados pessoais nem respostas de texto livre. Só ativar analytics conforme a configuração e preferências de consentimento da loja.
- Não persistir histórico individual de respostas no servidor no MVP. Logs técnicos mínimos sem payload completo. Nada de enviar mensagens automaticamente ao vendedor.

12. Validação e critérios de aceite
    Catálogo e motor
1. O arquivo atual resulta em 71 máquinas candidatas, 143 itens excluídos e um complementar em revisão. IDs do anexo conferem com o CSV.
1. IDs 353, 355, 601 e 603 nunca aparecem como máquinas. ID 205 não entra como lavadora autônoma. ID 459 não é exposto enquanto oculto.
1. IDs 579 e 583 continuam distintos; nenhuma normalização por nome une os dois.
1. Estoque zero não gera compra imediata; preço zero não gera oferta gratuita ou “sob consulta” sem aprovação.
1. Voltagem desconhecida, fase incompatível ou ausência de SKU impede recomendação confirmada para compra daquela versão.
1. O motor impede aspiração de líquidos por produto aprovado apenas para pó seco, extração em material não compatível e equipamentos sem validação para resíduos perigosos.
1. Automação obrigatória não retorna aspirador manual. Robôs sem estoque conduzem a indisponibilidade/atendimento.
1. Orçamento inferior ao menor elegível gera ausência de opção no teto; não relaxa requisitos técnicos nem aumenta o teto silenciosamente.
1. Promoção respeita início/fim em São Paulo; snapshots vencidos deixam de apresentar preço e estoque como atuais.
1. Respostas idênticas com mesmas versões produzem a mesma ordem e motivos. Cada motivo possui evidência aprovada.
   Interface e fluxo
1. Caminhos completos exibem entre oito e dez perguntas, sem perguntas irrelevantes ou repetidas.
1. Alterar o objetivo não preserva respostas incompatíveis; Voltar preserva as válidas.
1. Todas as famílias têm caminho completo, inclusive sem correspondência ou com necessidade técnica.
1. Resultado apresenta no máximo três máquinas compatíveis, sem variantes duplicadas e com link correto da referência.
1. Teclado, foco, toque, contraste e responsividade verificados; falha no CDN de fonte ou imagem não bloqueia o quiz.
1. Testes de integração cobrem corpo inválido, versão incompatível e falha de catálogo. Custos e CSV bruto não aparecem em bundles, HTML ou respostas da API.
   Executar testes unitários do parser, elegibilidade e preço; testes de jornada com Playwright ou equivalente; lint, verificação de tipos e build de produção. Dados sintéticos de teste devem ser identificados e nunca usados como especificação real de uma máquina.
1. Ordem de implementação e condições para lançamento
1. Importar e classificar o CSV; gerar pendências e aprovar uma seleção inicial de máquinas com evidência suficiente.
1. Obter variantes/voltagem e validar aplicações, limitações, demanda e acessórios inclusos necessários.
1. Implementar schemas, árvore de perguntas e regras com testes antes da interface de resultado.
1. Construir telas com a identidade visual definida e o mesmo motor em todas as jornadas.
1. Conferir preço, estoque, URLs, imagens e canal de contato da seleção inicial.
1. Validar resultados com a equipe comercial/técnica para cenários reais de compra.
1. Publicar a aplicação validada e só então disponibilizar o acesso na loja.
   O catálogo integral pode ser importado, mas o lançamento deve liberar somente referências aprovadas. Até obter dados por variação e atualização comercial, o resultado opera como orientação para consulta na loja, sem afirmar que uma versão está pronta para compra. O escopo desta entrega é a especificação Markdown; desenvolvimento, deploy e alteração do site ficam para a etapa de implementação.
   Anexo A · Inventário de máquinas candidatas
   A classificação abaixo usa o produto e sua referência, não somente a categoria de origem. Todos começam com aprovação técnica pendente. As observações comerciais são do snapshot recebido, não disponibilidade atual.
   ID Tray Máquina Referência Família Observação no snapshot
   7 Lavadora De Alta Pressão HD 6/15 Compacta (220V) 11506170 Alta pressão Validar versão, dados técnicos e disponibilidade
   9 Lavadora de Alta Pressão HD 7/13 Maxi Motor a Indução (220V) 19448840 Alta pressão Preço zero — validar comercial
   11 Limpadora de Piso BD 50/50 C Elétrica 19943610 Pisos Validar versão, dados técnicos e disponibilidade
   21 Varredeira Manual S6 Twin 93984040 Varrição Validar versão, dados técnicos e disponibilidade
   23 Varredeira S4 Twin 93984030 Varrição Sem estoque
   49 Lavadora de Alta Pressão G 2900 E (Gasolina) 93989990 Alta pressão Preço zero — validar comercial
   51 Varredeira Manual Karcher 70/15 KM 93011580 Varrição Validar versão, dados técnicos e disponibilidade
   133 Lavadora De Alta Pressão HD 6/15 Cage Plus (220V) 11506180 Alta pressão Validar versão, dados técnicos e disponibilidade
   207 Limpadora de Piso BD 50/50 Bateria AGM Sem Fio 93983370 Pisos Preço zero — validar comercial
   209 Limpadoras de Pisos BR 45/22 C Bateria 93983640 Pisos Preço zero — validar comercial
   213 Limpadora de Piso Compacta BD 30/4 C 93983320 Pisos Preço zero — validar comercial
   215 Limpadora de Pisos BR 35/12 C Facelift 93988510 Pisos Preço zero — validar comercial
   217 Limpadora e Secadora de Pisos BD Flex 93984010 Pisos Preço zero — validar comercial
   219 Limpadora de Pisos BD MAX Bateria 93983720 Pisos Preço zero — validar comercial
   221 Lavadora De Alta Pressão HD 10/18 MAXI 19948850HD Alta pressão Preço zero — validar comercial
   223 Lavadora de Alta Pressão HD 12/15 Maxi- Motor a Indução 19449750HD Alta pressão Preço zero — validar comercial
   225 Lavadora de Alta Pressão HD 7/16 Maxi 19449030 Alta pressão Validar versão, dados técnicos e disponibilidade
   229 Lavadora de Alta Pressão HD 10/25-4 Super - Motor a Indução 19742740HD Alta pressão Preço zero — validar comercial
   231 Lavadora de Alta Pressão HDS 12/15 102890802HDS Alta pressão Preço zero — validar comercial
   233 Limpadora de Piso Compacta BR 30/4 C 93982720 Pisos Validar versão, dados técnicos e disponibilidade
   235 Lavadora De Alta Pressão HDS 8/15 10259950 Alta pressão Preço zero — validar comercial
   245 Aspirador de Pó Silencioso T 14/1 15271730t14 Aspiração Validar versão, dados técnicos e disponibilidade
   247 Lavadora de Alta Pressão K4 19945520k4 Alta pressão Validar versão, dados técnicos e disponibilidade
   249 Lavadora de Alta Pressão K5 19945920k5 Alta pressão Validar versão, dados técnicos e disponibilidade
   253 Aspirador de Pó e Líquidos NT 2000 14287100nt2000 Aspiração Validar versão, dados técnicos e disponibilidade
   257 Aspirador de Pó e Líquidos NT 3000 14287150nt3000 Aspiração Validar versão, dados técnicos e disponibilidade
   259 Aspirador de Pó e Líquidos NT 90/2 ME (Anti-Estático) 93983510nt90 Aspiração Validar versão, dados técnicos e disponibilidade
   261 Lavadora de Alta Pressão HD 4/13 19741980hd413 Alta pressão Validar versão, dados técnicos e disponibilidade
   265 Aspirador De Pó E Líquido NT 65/2 Eco 16673370nt Aspiração Validar versão, dados técnicos e disponibilidade
   269 Limpadora de Estofados Puzzi 4/20 11002600pz Extração Validar versão, dados técnicos e disponibilidade
   271 Limpadora de Estofados Puzzi 4/30 11002650pz Extração Validar versão, dados técnicos e disponibilidade
   273 Limpadora de Estofados Puzzi 4/15 11002550pz Extração Sem estoque
   281 Lavadora De Alta Pressão K2 Plus Turbo 19943740K2 Alta pressão Validar versão, dados técnicos e disponibilidade
   285 Lavadora De Alta Pressão K3 Force Turbo 19941920k3 Alta pressão Validar versão, dados técnicos e disponibilidade
   287 Aspirador de Pó e Líquidos NT 90/2 ME Classic 16677050nt90 Aspiração Validar versão, dados técnicos e disponibilidade
   295 Limpadora a Vapor SC 4 Premium 93984160SC Vapor Validar versão, dados técnicos e disponibilidade
   297 Limpadora a Vapor SC 2 Premium 93984140SC Vapor Validar versão, dados técnicos e disponibilidade
   301 Lavadora de Alta Pressão HD 7/18 Maxi 119449040HD Alta pressão Preço zero — validar comercial; Sem estoque
   307 Aspirador Vertical VCL 1 93984490VCL Aspiração Validar versão, dados técnicos e disponibilidade
   341 Lavadora de Alta Pressão HD 4/10 X Classic 15208090HD Alta pressão Sem estoque
   367 Lavadora de Alta Pressão HD 6/11 Classic 15200240 Alta pressão Validar versão, dados técnicos e disponibilidade
   387 Lavadora De Alta Pressão HD 6/15 Gasolina 11870100 Alta pressão Sem estoque
   403 Aspirador de Pó e Água WDL 1 10983400wdl Aspiração Validar versão, dados técnicos e disponibilidade
   417 Aspirador de Pó e Água WDL 1S 10983500wdl Aspiração Validar versão, dados técnicos e disponibilidade
   419 Lavadora de Alta Pressão HD 585 Profi 19742400HD Alta pressão Validar versão, dados técnicos e disponibilidade
   421 Aspirador Vertical VCL 2 93984620VCL Aspiração Validar versão, dados técnicos e disponibilidade
   423 Lavadora De Alta Pressão K3 Force Car 19941960k3 Alta pressão Validar versão, dados técnicos e disponibilidade
   425 Lavadora De Alta Pressão K2 Plus Car 19943760K2 Alta pressão Validar versão, dados técnicos e disponibilidade
   427 Robô Aspirador Karcher RCV 1 - Bivolt 93010500 Aspiração Preço zero — validar comercial; Sem estoque
   429 Robô Aspirador Karcher RCV 3 - Bivolt 12696230 Aspiração Sem estoque
   435 Robô Aspirador Karcher RCV 5 - Bivolt 12696430 Aspiração Sem estoque
   457 Aspirador de Pó Vertical CV 30/1 93986430CV Aspiração Sem estoque
   459 Bomba Submersível SP 11.000 Dirt 16458240SP Drenagem Oculta — fora do resultado; Sem estoque
   461 Lavadora de Alta Pressão HD 585 Profi Black 19742600HD Alta pressão Validar versão, dados técnicos e disponibilidade
   495 Aspirador de Pó e Água WD 2 Car 93983160wd Aspiração Validar versão, dados técnicos e disponibilidade
   505 Limpadora de Piso FC 7 Bateria 93984980 Pisos Validar versão, dados técnicos e disponibilidade
   521 Lavadora de Alta Pressão Kärcher Portátil 19943810 Alta pressão Validar versão, dados técnicos e disponibilidade
   527 Limpadora e Secadora de Pisos Karcher BD Power 12460450 Pisos Preço zero — validar comercial
   529 Varredeira Automática Karcher KM 75/40 W 93986270 Varrição Preço zero — validar comercial
   531 Varredeira Automática Karcher KM 85/50 R - Bateria 93983850 Varrição Preço zero — validar comercial
   533 Aspirador Industrial Karcher IVM 40/24-2 93010120 Aspiração Preço zero — validar comercial
   535 Varredeira Urbana Karcher MC 600 93983280 Varrição Preço zero — validar comercial
   537 Limpadora de Piso BD 50/50 - Bateria Lítio 93010080 Pisos Preço zero — validar comercial
   545 Aspirador de Pó e Líquidos NT 3100 - Para pós Finos 14287200NT Aspiração Sem estoque
   577 Limpadora de Estofados Puzzi 4/16 11002700pz Extração Validar versão, dados técnicos e disponibilidade
   579 Aspirador de Pó e Líquidos NT 40/1 14287310nt40 Aspiração Validar versão, dados técnicos e disponibilidade
   581 Lavadora de Alta Pressão K 530 19945740K530 Alta pressão Validar versão, dados técnicos e disponibilidade
   583 Aspirador De Pó e Água Karcher NT 40/1 11489880 Aspiração Validar versão, dados técnicos e disponibilidade
   587 Aspirador de Pelos e Tosador Karcher Pet Clean 93011460PC Pet Sem estoque
   589 Lavadora Alta Pressão HD 585 Prof Plus 19742500HD Alta pressão Sem estoque
   591 Aspirador Vertical VCL 3 Bateria 93984460 Aspiração Sem estoque

Anexo B · Itens fora do quiz
IDs e motivos abaixo tornam a exclusão auditável. Permanecem fora de recomendações, alternativas e complementos.
ID Tray Produto Motivo
25 Kit Protetor de Respingos T-Racer T-150 Peça ou acessório
27 Kärcher Limpa Vidros (1 Litro) Químico/detergente
29 Detergente Alcalino Clorado Karcher - 1 Litro Químico/detergente
31 Karcher Limpa Porcelanato - 1 Litro Químico/detergente
33 Kärcher Limpa Pedras - 1 Litro Químico/detergente
37 Karcher Limpa Chapa e Grelhas - 1 Litro Químico/detergente
39 Karcher Limpador com Brilho - 1 Litro Químico/detergente
41 Detergente Em Pó RM 760 Kärcher - Ideal para Extratoras Químico/detergente
43 Deterjet Gel Detergente Desengraxante Kärcher - 5 Litros Químico/detergente
53 Bico Turbo Simples para Linha Profissional 040 Peça ou acessório
55 Disco Pad Vermelho 510mm - Lavagem Leve Peça ou acessório
57 Bico Turbo Simples para Linha Profissional 035 Peça ou acessório
59 Disco Pad Preto 510mm - Removedor Peça ou acessório
61 Disco Pad Verde 510mm - Lavagem Pesada (Kit 5 Unidades) Peça ou acessório
63 Disco Pad Verde 510mm - Lavagem Pesada Peça ou acessório
65 Disco Pad Branco 510mm - Lustrador Peça ou acessório
67 Disco Pad Preto 510mm - Removedor (Kit 5 Unidades) Peça ou acessório
69 Disco Pad Vermelho 440mm - Lavagem Leve Peça ou acessório
71 Mangueira de Alta Pressão 6 metros para Lavadoras Residenciais Peça ou acessório
73 Bico Turbo Simples para Linha Profissional 07/08 Peça ou acessório
75 Bico Turbo Simples TR 07/08 Peça ou acessório
77 Bico Turbo Simples para Linha Profissional 045 Peça ou acessório
79 Bico Turbo Simples para Linha Profissional 55/60 Peça ou acessório
81 Bico Turbo Simples para Linha Profissional 050 Peça ou acessório
83 Bocal de Piso Easyfix para Limpadoras a Vapor Peça ou acessório
85 Pistola Classic Profissional HD Peça ou acessório
87 Bico Turbo Simples TR 045 Peça ou acessório
93 Mangueira de Alta Pressão 4 metros para Lavadoras Residenciais Peça ou acessório
95 Mangueira com Trama de Aço 10M DN8 Peça ou acessório
97 Mangueira com Trama de Aço 20M DN8 Peça ou acessório
99 Mangueira com Trama de Aço 7,5M DN6 Peça ou acessório
101 Aplicador de Detergente Karcher Industrial Peça ou acessório
103 Escova Rotativa Profissional - Vazão até 800 L/H Peça ou acessório
105 Mangueira Desentupidora de Tubulação 10 Metros Peça ou acessório
107 Lança Telescópica TLA 4 Peça ou acessório
109 Pistola TR Easy! Force Peça ou acessório
111 Pistola Profissional Karcher para HD/HDS - Modelo Novo Peça ou acessório
113 Pistola Completa Hd Peça ou acessório
115 Protetor de Respingos FRV 30 com Sucção para Linha Profissional Peça ou acessório
119 Lança Dupla com Bocal de Espuma Peça ou acessório
121 Pistola Profissional Karcher para HD/HDS Peça ou acessório
123 Shampoo Automotivo - 5 Litros Químico/detergente
125 Mangueira Desentupidora de Tubulação 3m Karcher Peça ou acessório
127 Kit Pistola e Mangueira para Linha Residencial Karcher Peça ou acessório
129 Bico Turbo Profissional TR Easy Force 040 Peça ou acessório
135 Aplicador de Detergente Residencial Snow Foam Karcher Peça ou acessório
137 Filtro de Água Karcher para Lavadoras de Pressão Peça ou acessório
139 Filtro de Água 60 Micra (Linha Uso Intensivo) Peça ou acessório
141 Engate Rápido SEM Aqua Stop + Conector para Mangueira 1/2" Karcher Peça ou acessório
143 Kit Filtro de Papel Karcher para Aspiradores A 2003, A 2004 e A 2114 (3 Unidades) Peça ou acessório
145 Kit Filtro de Papel para Aspiradores Kärcher NT 14/1, 20/1, A2104 e A2214 (3 Unidades) Peça ou acessório
147 Tubo Prolongador 480mm para aspiradores NT Peça ou acessório
149 Kit Panos de Algodão (5 unidades) Peça ou acessório
151 Filtro de Espuma para Aspirador e Extratora Peça ou acessório
153 Bocal de Tecidos para Limpadoras a Vapor Peça ou acessório
157 Kit Auto (2 Escovas + 1 Esponja) Peça ou acessório
159 Pistola G 145 - Uso Residencial Peça ou acessório
161 Auto Escova para Lavadora Residencial Karcher Peça ou acessório
165 Lança de Jato Regulável Leque Peça ou acessório
167 Filtro de Tecido para Aspiradores NT WD Peça ou acessório
171 Mangueira de Alta Pressão 3 metros para Lavadoras Residenciais Peça ou acessório
173 Escova Turbo Vapor Karcher Peça ou acessório
175 Kit 4 escovas - 2 Amarelas + 2 Pretas para Limpadoras a Vapor Peça ou acessório
177 ADAPTADOR N° 1 - M22AG-TR22AG Peça ou acessório
179 Bocal de Solo para NT 65/2 ECO, NT 75/2 TACT, NT 90/2 ME Peça ou acessório
181 ADAPTADOR N° 2 - M22IG-TR22AG Peça ou acessório
183 Bocal de Estofados para Aspiradores e Extratoras Peça ou acessório
185 Kit Reparo Da Bomba + Stop Total + By-pass Karcher HD 585 / HD 555 / HD 600 / HD 6/11 Peça ou acessório
187 ADAPTADOR N° 9 TR Peça ou acessório
189 Kit de Reposição com O-Ring de Borracha para Máquinas de Limpeza a Vapor Peça ou acessório
193 Pano com Elástico para Bocal de Mão Peça ou acessório
195 Kit de Panos com Elástico para Bocal de Mão (5 unidades) Peça ou acessório
197 Kit 5 Panos de Algodão para Higienizadora a Vapor Peça ou acessório
199 Aplicador de Detergente Karcher TR Easy Force Peça ou acessório
201 Descalcificante para Limpadoras a Vapor Karcher Peça ou acessório
203 ANEL RANHURADO KARCHER - 12 x 20 x 5,3 Peça ou acessório
205 HDS GERADOR DE ÁGUA QUENTE - HG 64 (220V) Gerador de água quente complementar — revisão, fora do MVP
303 ADAPTADOR N° 8 - TR20IG-M18AG Peça ou acessório
311 Bocal de Solo 35mm para NT Peça ou acessório
313 Aplicador de Detergente Snow Foam Karcher 1 Litro Peça ou acessório
315 Aplicador de Detergente Snow Foam para Karcher Compacta Peça ou acessório
317 Aplicador de Detergente Snow Foam Karcher Profissional HD Peça ou acessório
319 Bico Articulado 360° para Lavadora de Alta Pressão Peça ou acessório
321 Tubo Prolongador 400mm Residencial Peça ou acessório
323 Tubeira Giratória 600mm Profissional Peça ou acessório
325 Bico de Alta Pressão Power 25038 Peça ou acessório
327 Bico de Baixa Pressão Profissional para Shampoo 25250 Peça ou acessório
329 Filtro de Proteção do Motor DS 5500 - 5600 Peça ou acessório
331 Filtro Sanfonado para Aspirador Karcher Peça ou acessório
333 Filtro Descartável Karcher WD e SE Peça ou acessório
335 Filtro Descartável para Aspirador VC 5100 Karcher (3 unidades) Peça ou acessório
337 Filtro Permanente com Trava e Vedação para Aspirador A e NT Karcher Peça ou acessório
339 Bico de Alta Pressão TR 25038 Peça ou acessório
343 Pistola para Karcher Compacta Peça ou acessório
345 Mangueira de Alta Pressão de 3m para Karcher Compacta Peça ou acessório
347 Lança para Karcher Compacta Peça ou acessório
351 Conexão para 2 Mangueiras Profissionais Karcher M22X1,5 Peça ou acessório
353 Deterjet Gel Detergente Desengraxante Kärcher 500 ml Químico/detergente
355 Desengraxante RM 31 Detergente Karcher 5 litros Químico/detergente
357 Porca Capa M18 X 1,5 Karcher Peça ou acessório
359 Filtro de Tecido para Aspirador T 14/1 Karcher Peça ou acessório
361 Escova Rotativa Circular Karcher Peça ou acessório
377 Bico Ajustável Kärcher Compacta Peça ou acessório
379 Lança Baioneta Engate Rápido Karcher Profissional HD Peça ou acessório
381 Pistola Baioneta Engate Rápido Karcher Profissional HD Peça ou acessório
437 Filtro HEPA para Aspirador de Pó VCL 1 Peça ou acessório
441 Engate Preto Conector Rosca 3/4 Peça ou acessório
443 Engate Rápido COM Aqua Stop + Conector para Mangueira 1/2" Karcher Peça ou acessório
445 Desengraxante Karcher - 5 Litros Químico/detergente
447 Deterjet Gel Detergente Desengraxante Kärcher - 1 Litro Químico/detergente
449 Pós Obra Kärcher - 1 Litro Químico/detergente
455 Filtro HEPA para Aspirador de Pó VCL 2 ou VCL 3 Peça ou acessório
463 Kit Pano de Microfibra para Bocal de Piso Easyfix (5 unidades) Peça ou acessório
465 Bocal Com Cerdas para Limpadoras a Vapor Karcher Peça ou acessório
467 Bico de Jato Pontual para Limpadoras a Vapor Peça ou acessório
483 Pano de Microfibra para Bocal de Piso Easyfix Peça ou acessório
509 Kit Reparo Bico Turbo 040 Karcher Peça ou acessório
511 Kit Filtro Fino Curto Residencial Karcher Peça ou acessório
513 Deterget Car Pró Shampoo altomotivo Químico/detergente
515 Floor Care RM 755 Kärcher - 1 Litro Químico/detergente
539 Rolo de Microfibra Karcher FC 3 / FC 4 / FC 5 / FC 7 - Kit 2 Peças Peça ou acessório
541 Rolo de Microfibra Karcher FC 2 Peça ou acessório
549 Par de Calotas Cinzas - HD 585, HD 6/15, NT 65/2 Peça ou acessório
551 Kit com 10 unidades de Válvulas de Sucção + Press - HD 555, HD 585, HD 6/15 Cage Peça ou acessório
553 Gaxeta 14X22X5,3/2,8 - HD 555, HD 585 Peça ou acessório
555 Válvula de Sucção + Pressão Kärcher Peça ou acessório
557 Guia da Gaxeta - HD 555, HD 585 Peça ou acessório
561 Anel Raspador 14 x 22 x 7 Peça ou acessório
565 Gaxeta 12 x 20 x 5 Peça ou acessório
569 Anel Raspador 12 x 20 x 4/6 Peça ou acessório
573 Pistão Ø 14mm com Trava - Kit 3 Peças HD 585 Peça ou acessório
597 LANCA DE JATO TURBO 028 (EMB) Peça ou acessório
599 Lamina Do Rodo 1010mm Karcher Bd 50/50 Para Rodo Em V - Par Peça ou acessório
601 Filtro de Tecido Lavável para Aspirador Karcher WDL 1 e 1 S Peça ou acessório
603 ESCOVA CERDAS VERMELHAS - 510MM Peça ou acessório
605 DETERGENTE PARA HIGIENIZAÇÃO DE CARPETES E ESTOFADOS - CARPETPRO POWEREXTRACT RM 764(1L) - KÄRCHER Químico/detergente
607 CÓPIA - Lamina Do Rodo 1010mm Karcher Bd 50/50 Para Rodo Em V - Par Peça ou acessório
609 STOP TOTAL K1 HX - COMPLETO Peça ou acessório
611 VALVULA BY-PASS Peça ou acessório
613 Conjunto do Micro Switch Karcher HD 585 / HD 555 Peça ou acessório
615 CJTO STOP TOTAL CPL K4 HX Peça ou acessório
617 Kit Reparo C/ Pistao Hd585 Cpl - Karcher Peça ou acessório
619 KIT REPARO BOMBA K3-K5 Hx Peça ou acessório
621 KIT REPARO HD 5/12, HD 6/13, HD6/15 Peça ou acessório

Anexo C · Fontes e dados ainda necessários

- CSV fornecido pelo usuário em 13/11/2026: base das contagens, nomes, referências e situações comerciais deste documento.
- HTML fornecido pelo usuário: fonte das cores, tipografia e estilo visual; não representa dado técnico universal dos modelos.
- Pendente: exportação de variações/SKUs, estoque por variante, tensões/fases e preço efetivo por variante.
- Pendente: validação por referência de aplicações, materiais, ciclo de trabalho, consumo, alimentação, acessórios inclusos e limites operacionais.
- Pendente: confirmação de quais preços zero significam orçamento, quais estoques são comerciais e qual contato deve receber as consultas.
- Pendente: conferir documentação vigente da versão escolhida do Next.js e da integração Tray durante o desenvolvimento. Este documento propõe arquitetura; não atesta disponibilidade atual de endpoints de terceiros.
  Nenhum manual externo foi consultado nesta etapa. Características faltantes não foram inventadas: a regra de pendência existe para que o sistema possa ser desenvolvido sem transformá-las em recomendações indevidas.
