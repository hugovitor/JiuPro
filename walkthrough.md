# Walkthrough - Webhook Duplo Stripe (Produção)

Corrigimos a validação de assinatura de webhooks do Stripe para suportar múltiplos endpoints simultâneos no mesmo backend, permitindo transações de alunos (Connect) e assinaturas de academias (Plataforma SaaS) no ar.

---

## 🛠️ O que foi corrigido e implementado:

### ⚙️ 1. Validação Dual de Webhook no Backend (`/api/webhooks/stripe`)
* **O Problema:** Como a Stripe Connect possui canais separados para a conta principal ("Sua conta" - assinaturas das academias) e subcontas ("Contas conectadas" - mensalidade de alunos), são geradas duas chaves de assinatura Webhook (`whsec_...`) diferentes. O backend do Next.js possuía apenas um leitor de chave (`STRIPE_WEBHOOK_SECRET`), o que causaria falha de assinatura (HTTP 400) em um dos dois fluxos.
* **A Solução:** Ajustamos o construtor do webhook para realizar uma validação inteligente:
  1. Ele tenta validar a assinatura usando a chave padrão da plataforma (`STRIPE_WEBHOOK_SECRET`).
  2. Se falhar, ele faz um fallback e tenta validar com a chave de conexão dos alunos (`STRIPE_CONNECT_WEBHOOK_SECRET`).
  3. Caso ambas falhem ou não existam, o erro de autenticação é lançado de forma segura.
* **O Resultado:** Ambos os webhooks da Stripe agora podem bater no mesmo arquivo de rota e serão devidamente validados e processados!

---

## 🧪 Verificação do Build
* O build final passou com sucesso (código `0`) e as alterações já estão publicadas em produção no GitHub no commit `d16a9a9`.
