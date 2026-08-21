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
* **Portal do Aluno:** Visualização de progresso de aulas para graduação, agendamento de treinos, histórico financeiro com checkout PIX e **Carteirinha Digital** com QR Code.
* **Validação de Frequência:** Chamada manual de presença ou **validação automatizada** via leitura de QR Code (câmera frontal ou leitor USB).
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
3. **Validação Financeira na Entrada (Check-in QR Code):**
   * Ao ler o QR Code da carteirinha digital do aluno (`jiupro:checkin:studentId:academyId`) na recepção:
     * Se o aluno possuir faturas com status **"Atrasado"**, a entrada é **recusada automaticamente** no painel de controle, exigindo liberação manual do professor (cortesia).
     * Se estiver em dia, a entrada é **liberada na hora** e o check-in é computado como "Confirmado".

---

## 2. Arquitetura e Decisões Técnicas

O sistema é construído sobre a seguinte pilha tecnológica moderna:

* **Framework:** Next.js (App Router) com TypeScript e React.
* **CSS/Design:** Tailwind CSS.
* **Banco de Dados Relacional:** Supabase (PostgreSQL) com migrações em SQL puro.
* **Geração de PDF:** Biblioteca `jspdf` para exportação rápida de contratos de prestação de serviços.
* **Geração de QR Code:** Renderização de URLs seguras através da API do Google Charts.
* **Leitura de QR Code:** Biblioteca `html5-qrcode` para ativação direta da câmera do dispositivo do usuário.
* **Gráficos Financeiros:** Desenhados inteiramente em SVG dinâmico nativo em React para performance e compatibilidade móvel.

### 2.1. Arquitetura Offline-First (`db.ts`)
Toda a interação com os dados passa pelo wrapper do banco de dados `app/lib/db.ts`. Quando o usuário faz alterações:
1. Os dados são salvos localmente e de forma síncrona no `localStorage`.
2. Uma promessa assíncrona (`db.syncWithSupabase()`) é disparada para persistir as modificações nas tabelas do Supabase.
3. Em caso de falha de conexão, as alterações continuam seguras no dispositivo local até a próxima sincronização.

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
* `/api/webhooks/stripe` (POST): Recebe eventos de checkout do Stripe e Stripe Connect, limpando faturas com status "Atrasado" automaticamente na confirmação do pagamento.
* `/api/stripe-connect/onboard` (GET): Redireciona a academia para o portal de Onboarding do Stripe Express.
* `/api/checkout/stripe` (POST): Cria a sessão de checkout de adesão do aluno à academia.
* `/api/cron/gerar-faturas` (GET): Executado mensalmente para gerar faturas automaticamente para os alunos ativos cadastrados.

### 4.2. Rotas Front-end
* `/aluno`: Portal do aluno (exibe Carteirinha, Grade de Graus, Histórico Financeiro e Agenda de Treino).
* `/login`: Tela de autenticação unificada.
* `/dashboard`: Tela principal do professor com o faturamento, gráficos de adimplência e alertas.
* `/dashboard/alunos`: Listagem de atletas e gerenciamento de prontuário médico.
* `/dashboard/frequencia`: Scanner de QR Code e chamada eletrônica do tatame.

---

## 5. Guia de Operação (Manual do Usuário)

### 5.1. Como o Aluno realiza o Check-in e visualiza a Carteirinha
1. O aluno acessa `/aluno` e entra na aba **"Carteirinha"**.
2. Ele visualiza seu documento digital com o design premium e o QR Code.
3. Para reservar aula, ele entra na aba **"Agenda"** e clica em **"Agendar Presença"** (respeitando o limite de até 15 minutos do treino).

### 5.2. Como o Professor valida a entrada via Receptor de QR Code
1. O professor acessa `/dashboard/frequencia` em um computador, tablet ou celular.
2. Ele escolhe a aba de leitura:
   * **Leitor USB:** Basta conectar um leitor USB no computador, clicar no campo de texto e bipar o celular do aluno.
   * **Webcam:** Clicar em "Usar Webcam" e apontar o celular do aluno para a câmera.
3. O sistema valida automaticamente se a mensalidade está em dia e registra a presença. Em caso de atraso, o sistema alerta em vermelho para controle do mestre.

---

## 6. Qualidade, Testes e Manutenção

### 6.1. Comando de Verificação de Compilação
Sempre que fizer alterações no código, garanta a integridade executando a compilação de produção local:
```bash
npm run build
```

### 6.2. Estratégia de Deploy
O projeto está integrado à **Vercel** com deploy contínuo (CI/CD) vinculado à branch `main` do GitHub.
