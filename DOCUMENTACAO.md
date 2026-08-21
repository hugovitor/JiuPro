# 🥋 JiuPro - Documentação Oficial do Sistema

Esta é a documentação completa do **JiuPro**, uma plataforma B2B SaaS desenvolvida para gestão de academias de Jiu-Jitsu, controle de atletas, graduações oficiais (IBJJF), frequências automatizadas via QR Code e fluxo de faturamento recorrente integrado com Stripe.

---

## 🗂️ Índice
1. [Requisitos e Regras de Negócio](#1-requisitos-e-regras-de-negócio)
2. [Arquitetura e Decisões Técnicas](#2-arquitetura-e-decisões-técnicas)
3. [Estrutura do Banco de Dados](#3-estrutura-do-banco-de-dados)
4. [Documentação de APIs & Rotas](#4-documentação-de-apis--rotas)
5. [Guia de Operação (Manual do Usuário)](#5-guia-de-operação-manual-do-usuário)
6. [Qualidade, Testes e Manutenção](#6-qualidade-testes-e-manutenção)

---

## 1. Requisitos e Regras de Negócio

### 1.1. Requisitos Funcionais
* **Gestão de Atletas:** Cadastro completo de alunos, dados de contato, foto de perfil, métricas físicas (peso/altura) e prontuário médico.
* **Portal do Aluno:** Visualização de progresso de aulas para graduação, agendamento de treinos e histórico financeiro com checkout PIX.
* **Validação de Frequência:** Chamada manual de presença (basta o professor clicar em "Confirmar" na fila de agendamentos) ou **chamada rápida/direta** via lista de busca (ideal para crianças e atletas sem celular).
* **Módulo de Exames e Graduações:** Controle de graus e faixas seguindo as regras oficiais de idades e tempos de carência da IBJJF.
* **Mural de Avisos:** Publicação de alertas e eventos fixados no topo do painel da academia.
* **Fluxo Financeiro:** Dashboard com controle de inadimplência, faturamento mensal, adimplência geral e estimativas futuras de faturamento (projeção de caixa).
* **Loja/Cantina:** Controle de estoque de produtos (kimonos, faixas, suplementos, bebidas) com venda rápida integrada e baixa automática.

### 1.2. Requisitos Não Funcionais
* **Offline-First:** O sistema funciona localmente salvando o estado no `localStorage` via invólucro do `db.ts`, sincronizando silenciosamente em segundo plano com o Supabase quando há conexão.
* **PWA (Progressive Web App):** Suporte a service workers para instalação no celular e funcionamento offline rápido.
* **UI Clean & Acessível:** Layout responsivo otimizado para dispositivos móveis (uso de SVGs vetoriais nativos, sem emojis ou gráficos pesados).

### 1.3. Regras de Negócio Críticas
1. **Limites de Planos de Assinatura (Bloqueios Atletas):**
   * **Plano Prata:** Limite máximo de **50 atletas** matriculados. Bloqueia a inserção de novos alunos acima do limite.
   * **Plano Ouro:** Limite máximo de **150 atletas** matriculados.
   * **Plano BlackBelt:** Atletas ilimitados.
2. **Tempo Limite de Reserva/Cancelamento de Aula:**
   * O aluno só pode reservar presença no treino se faltarem mais de **15 minutos para o início do treino**. Após esse prazo, a reserva é bloqueada e exibe o estado "Expirado".
   * O aluno pode cancelar a presença reservada a qualquer momento antes do início do treino.
3. **Validação Financeira na Entrada (Frequência):**
   * Ao marcar presença para um aluno (seja aceitando o check-in do app ou fazendo chamada direta na lista de atletas):
     * O sistema verifica se o aluno possui faturas com status **"Atrasado"**.
     * Se houver pendências, exibe um alerta de inadimplência exigindo que o professor confirme explicitamente a autorização de entrada (cortesia) para prosseguir.
4. **Isolamento de Turmas no Mesmo Horário:**
   * Para permitir múltiplos treinos simultâneos na academia (ex: Jiu-Jitsu Infantil e Treino Avançado ocorrendo ambos às 14:00h), os agendamentos e presenças são controlados através do `classId` único da turma, impedindo que o agendamento em um treino marque a presença no outro.
5. **Reavaliação Dinâmica de Conquistas (Medalhas):**
   * Caso o aluno desista de uma aula agendada e sua contagem de presenças diminua, as conquistas do atleta são reavaliadas na hora, removendo as medalhas correspondentes caso ele não atinja mais os critérios exigidos (ex: "Frequência de Ferro" exige 3 presenças).

---

## 2. Arquitetura e Decisões Técnicas

O sistema é construído sobre a seguinte pilha tecnológica moderna:

* **Framework:** Next.js (App Router) com TypeScript e React.
* **CSS/Design:** Tailwind CSS.
* **Banco de Dados Relacional:** Supabase (PostgreSQL) com migrações em SQL puro.
* **Geração de PDF:** Biblioteca `jspdf` para exportação rápida de contratos de prestação de serviços.
* **Gráficos Financeiros:** Desenhados inteiramente em SVG dinâmico nativo em React para performance e compatibilidade móvel.

### 2.1. Arquitetura Offline-First (`db.ts`)
Toda a interação com os dados passa pelo wrapper do banco de dados `app/lib/db.ts`. Quando o usuário faz alterações:
1. Os dados são salvos localmente e de forma síncrona no `localStorage`.
2. Uma promessa assíncrona (`db.syncWithSupabase()`) é disparada para persistir as modificações nas tabelas do Supabase.
3. Em caso de falha de conexão, as alterações continuam seguras no dispositivo local até a próxima sincronização.
4. **Sincronização em Tempo Real (Grade e Lançamentos):** Modificações na grade de treinos (adições/remocões), faturas lançadas manualmente pelo professor (`addManualInvoice`) e presenças creditadas manualmente pelo painel (`addManualPresence`) realizam chamadas diretas ao banco de dados Supabase em tempo de execução, garantindo que os dados sejam imediatamente salvos na nuvem e fiquem visíveis para os alunos em múltiplos dispositivos.

---

## 3. Estrutura do Banco de Dados

O modelo de dados relacional é estruturado com as seguintes tabelas no PostgreSQL do Supabase (descrito no arquivo `supabase_schema.sql`):

### 3.1. Dicionário de Tabelas

#### Tabela `academies` (Configurações da Academia)
* `id` (UUID, PK): Identificador único.
* `name` (TEXT): Nome da academia.
* `plan` (TEXT): Plano contratado (Prata, Ouro, BlackBelt).
* `stripe_connect_id` (TEXT): Identificador da conta Stripe Connect para processamento de pagamentos.
* `whatsapp_template` (TEXT): Modelo dinâmico de cobrança via WhatsApp.
* `pix_key` (TEXT): Chave PIX oficial para faturamento.

#### Tabela `students` (Perfil dos Atletas)
* `id` (UUID, PK): Identificador do atleta.
* `academy_id` (UUID, FK -> academies.id): Academia de filiação.
* `nome` (TEXT): Nome completo.
* `email` (TEXT): Endereço de e-mail.
* `faixa` (TEXT): Faixa atual (Branca, Azul, Roxa, Marrom, Preta, etc.).
* `graus` (INTEGER): Número de graus na faixa atual.
* `data_nascimento` (TEXT): Data de nascimento do atleta.
* `data_matricula` (TEXT): Data em que entrou na academia.
* `status` (TEXT): "Ativo" ou "Inativo".
* `alergias` (TEXT): Alergias médicas cadastradas.
* `lesoes` (TEXT): Lesões ativas ou restrições de contato físico.
* `observacoes_medicas` (TEXT): Notas médicas adicionais escritas pelos professores.
* `mestre_original` (TEXT): Nome do mestre de linhagem original.
* `graduado_por` (TEXT): Nome do último graduador do atleta.
* `grupo_familiar` (TEXT): Parentesco ou vínculo familiar com outros membros (ex: "Filho de [Nome]").

#### Tabela `invoices` (Mensalidades dos Atletas)
* `id` (UUID, PK): Identificador único.
* `student_id` (UUID, FK -> students.id): Atleta vinculado.
* `mes` (TEXT): Mês de competência (ex: "Agosto/2026").
* `vencimento` (TEXT): Data limite de pagamento.
* `valor` (TEXT): Valor da fatura (ex: "99.00").
* `status` (TEXT): "Pago" ou "Atrasado".

#### Tabela `classes` (Horários de Treinos/Turmas)
* `id` (UUID, PK): Identificador único.
* `academy_id` (UUID, FK): Academia vinculada.
* `nome` (TEXT): Nome do treino (ex: "Treino Fundamental").
* `horario` (TEXT): Horário de início (ex: "19:00").
* `dias` (TEXT): Dias da semana (ex: "Seg, Qua, Sex").

#### Tabela `checkins` (Presenças Reservadas)
* `id` (UUID, PK): Identificador único.
* `academy_id` (UUID, FK): Academia vinculada.
* `student_id` (UUID, FK): Atleta vinculado.
* `nome` (TEXT): Nome do atleta no momento do check-in.
* `faixa` (TEXT): Faixa no momento do check-in.
* `graus` (INTEGER): Graus no momento do check-in.
* `horario` (TEXT): Horário da aula.
* `status` (TEXT): "Pendente", "Confirmado" ou "Faltou".
* `data` (TEXT): Data do check-in.

---

## 4. Documentação de APIs & Rotas

### 4.1. Endpoints de Integração (API Router)
* `/api/webhooks/stripe` (POST): Recebe eventos de checkout do Stripe e Stripe Connect, limpando faturas com status "Atrasado" automaticamente na confirmação do pagamento. Possui validação dual de chaves: utiliza `STRIPE_WEBHOOK_SECRET` para eventos da conta principal ("Sua conta") e realiza fallback para `STRIPE_CONNECT_WEBHOOK_SECRET` para os eventos de contas conectadas de academias ("Contas conectadas").
* `/api/stripe-connect/onboard` (GET): Redireciona a academia para o portal de Onboarding do Stripe Express.
* `/api/checkout/stripe` (POST): Cria a sessão de checkout de adesão do aluno à academia.
* `/api/cron/gerar-faturas` (GET): Executado mensalmente para gerar faturas automaticamente para os alunos ativos cadastrados.

### 4.2. Rotas Front-end
* `/aluno`: Portal do aluno (exibe Grade de Graus, Histórico Financeiro e Agenda de Treino).
* `/login`: Tela de autenticação unificada.
* `/dashboard`: Tela principal do professor com o faturamento, gráficos de adimplência e alertas.
* `/dashboard/alunos`: Listagem de atletas e gerenciamento de prontuário médico.
* `/dashboard/frequencia`: Frequência ativa e chamada manual direta/lista de alunos (Kids).

---

## 5. Guia de Operação (Manual do Usuário)

### 5.1. Como o Aluno realiza o Agendamento de Treino
1. Para reservar sua presença na aula, o aluno acessa o portal `/aluno`, vai na aba **Evolução** e clica em **"Agendar"** no horário desejado (respeitando o limite de até 15 minutos do início do treino).
2. Se precisar desistir ou não puder comparecer, basta clicar no botão vermelho **"Desistir"** para remover o check-in e limpar o dia do calendário automaticamente.

### 5.2. Como o Professor realiza a Chamada e Validação de Alunos (Manual / Kids)
1. O professor acessa `/dashboard/frequencia` em seu tablet, celular ou computador.
2. Ele visualiza a lista **"Fila de Chamada"** contendo os atletas que reservaram presença pelo aplicativo. Clicando em **"Confirmar Presença"**, a presença é registrada no histórico.
3. Para crianças e atletas sem celular: o professor usa a lista à direita **"Chamada Rápida (Lista de Atletas)"**, busca o nome do aluno no campo de busca e clica em **"Marcar"** para registrar a presença dele diretamente na turma selecionada.
4. O sistema valida na hora a adimplência de cada atleta. Caso possua mensalidades atrasadas, o sistema exibe um alerta de inadimplência exigindo confirmação de cortesia para liberar a entrada.

### 5.3. Como Desvincular ou Trocar a Conta Stripe Connect da Academia
1. O professor/administrador acessa `/dashboard/configuracoes`.
2. No card **Pagamento via Cartão de Crédito**, localiza a seção que exibe o ID da conta conectada ativa (ex: `acct_...`).
3. Clica no botão vermelho **"Desconectar / Trocar de Conta"** e confirma a ação no aviso do navegador.
4. O sistema limpa as configurações anteriores da nuvem e exibe novamente o botão de vínculo original. O professor pode então prosseguir clicando em **"Vincular Conta Stripe"** para associar outra conta da Stripe.

---

## 6. Qualidade, Testes e Manutenção

### 6.1. Comando de Verificação de Compilação
Sempre que fizer alterações no código, garanta a integridade executando a compilação de produção local:
```bash
npm run build
```

### 6.2. Estratégia de Deploy
O projeto está integrado à **Vercel** com deploy contínuo (CI/CD) vinculado à branch `main` do GitHub.
