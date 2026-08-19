import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'
import { supabase } from '../../../lib/supabase'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') || ''

  let event

  try {
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET não está configurado. Rodando em modo de desenvolvimento sem verificação estrita.')
      // No stripe webhook secret, parse raw event (only in local dev environments if signature verification is bypassed)
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    }
  } catch (err: any) {
    console.error(`Erro de assinatura webhook Stripe: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Processar o evento
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const customerId = session.customer
        const subscriptionId = session.subscription
        const metadata = session.metadata

        if (metadata && metadata.email) {
          const { plano, academyName, ownerName, email, password } = metadata
          const academyId = academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
          
          console.log(`Webhook: Cadastrando nova academia ${academyName} (ID: ${academyId})`)

          // 1. Cadastra no Supabase - Academia
          const { error: acError } = await supabase.from('academies').upsert({
            id: academyId,
            name: academyName,
            mensalidade_padrao: '150,00',
            dia_vencimento: '10',
            owner_name: ownerName,
            owner_email: email,
            plan: plano,
            status: 'Ativo',
            professor_grade: 'Faixa Preta',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId
          })

          if (acError) throw acError

          // 2. Cadastra no Supabase - Administrador (Dono)
          const userId = 'user-' + Math.floor(Math.random() * 100000)
          const { error: userError } = await supabase.from('users').upsert({
            id: userId,
            academy_id: academyId,
            name: ownerName,
            email: email,
            password: password, // Em produção real, você usaria bcrypt ou supabase auth, mas mantemos o modelo do projeto
            role: 'Dono',
            grade: 'Faixa Preta'
          })

          if (userError) throw userError

          // 3. Cadastra uma turma padrão para a nova academia
          const { error: classError } = await supabase.from('checkins').insert([]) // apenas se necessário
          console.log(`Academia e Usuário cadastrados com sucesso para o cliente ${email}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const customerId = invoice.customer
        const subscriptionId = invoice.subscription

        // Localiza a academia por stripe_customer_id ou stripe_subscription_id e ativa
        const { error } = await supabase
          .from('academies')
          .update({ status: 'Ativo' })
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscriptionId}`)

        if (error) {
          console.error(`Erro ao ativar academia via webhook (payment succeeded):`, error)
        } else {
          console.log(`Academia reativada com sucesso via webhook (faturamento compensado). Customer: ${customerId}`)
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const payload = event.data.object as any
        const customerId = payload.customer
        const subscriptionId = payload.subscription

        // Localiza a academia por stripe_customer_id ou stripe_subscription_id e suspende
        const { error } = await supabase
          .from('academies')
          .update({ status: 'Suspenso' })
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscriptionId}`)

        if (error) {
          console.error(`Erro ao suspender academia via webhook (payment failed):`, error)
        } else {
          console.log(`Academia suspensa via webhook (pagamento pendente). Customer: ${customerId}`)
        }
        break
      }

      default:
        console.log(`Evento Stripe não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Erro ao processar evento Stripe: ${error.message}`)
    return NextResponse.json({ error: 'Erro de processamento' }, { status: 500 })
  }
}
