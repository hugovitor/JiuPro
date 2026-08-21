# Walkthrough - Botão Desconectar Stripe Connect

Adicionamos a funcionalidade de desconectar a conta da Stripe Connect diretamente pelo painel de configurações do professor, permitindo desvincular contas de teste antigas e realizar o onboarding de produção de forma simples.

---

## 🛠️ O que foi corrigido e implementado:

### 🔌 1. Botão "Desconectar / Trocar de Conta"
* **O Problema:** Como a academia "Teste" já havia sido vinculada com um ID de testes da Stripe Connect (`acct_1U0Wtwa7fHasHVzU`), o painel de configurações exibia o status ativo e ocultava o botão de vinculação. O professor não conseguia desconectar o ID antigo para vincular sua conta Stripe real em produção.
* **A Solução:** Adicionamos um botão vermelho **"Desconectar / Trocar de Conta"** na seção "Pagamento via Cartão de Crédito" em `/dashboard/configuracoes`:
  * Ao clicar, o professor confirma a ação em um pop-up de segurança.
  * O sistema limpa o `stripeConnectId` da academia no banco de dados Supabase e no cache local.
  * O painel é recarregado exibindo o botão preto **"Vincular Conta Stripe"** novamente para fazer o onboarding em produção.

---

## 🧪 Verificação do Build
* O build final passou com sucesso (código `0`) e as alterações já estão publicadas em produção no GitHub no commit `f1a80cf`.
