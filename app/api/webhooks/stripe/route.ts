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

        // CASO A: Cobrança de mensalidade de aluno via Stripe Connect (Connected Account ID presente)
        if (metadata && metadata.studentId) {
          const { studentId, academyId } = metadata
          const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())
          const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

          console.log(`Webhook Connect: Confirmando faturamento inicial do aluno ${studentId} (Academy: ${academyId})`)

          // 1. Atualizar a fatura do mês corrente para Pago
          await supabase
            .from('invoices')
            .update({ status: 'Pago' })
            .eq('student_id', studentId)
            .eq('mes', capitalizedMonth)

          // 2. Salvar os IDs do Stripe no cadastro do estudante
          await supabase
            .from('students')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId
            })
            .eq('id', studentId)

          break
        }

        // CASO B: Cobrança da mensalidade da própria academia tenant (Plataforma JiuPro)
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
            password: password,
            role: 'Dono',
            grade: 'Faixa Preta'
          })

          if (userError) throw userError
          console.log(`Academia e Usuário cadastrados com sucesso para o cliente ${email}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const customerId = invoice.customer
        const subscriptionId = invoice.subscription

        // Se o webhook vem de uma conta conectada (Stripe Connect)
        if (event.account) {
          const { data: student, error: stdError } = await supabase
            .from('students')
            .select('id')
            .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscriptionId}`)
            .single()

          if (!stdError && student) {
            const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())
            const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

            await supabase
              .from('invoices')
              .update({ status: 'Pago' })
              .eq('student_id', student.id)
              .eq('mes', capitalizedMonth)

            console.log(`Fatura do aluno ${student.id} marcada como PAGO por renovação Connect.`)
          }
          break
        }

        // Caso padrão: pagamento de assinatura de academia tenant
        const { error } = await supabase
          .from('academies')
          .update({ status: 'Ativo' })
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscriptionId}`)

        if (error) {
          console.error(`Erro ao ativar academia via webhook (payment succeeded):`, error)
        } else {
          console.log(`Academia reativada com sucesso via webhook. Customer: ${customerId}`)
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const payload = event.data.object as any
        const customerId = payload.customer
        const subscriptionId = payload.subscription

        // Se o webhook vem de uma conta conectada (Stripe Connect)
        if (event.account) {
          const { data: student, error: stdError } = await supabase
            .from('students')
            .select('id')
            .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscriptionId}`)
            .single()

          if (!stdError && student) {
            const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())
            const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

            // Suspende o aluno marcando a fatura como Atrasada
            await supabase
              .from('invoices')
              .update({ status: 'Atrasado' })
              .eq('student_id', student.id)
              .eq('mes', capitalizedMonth)

            console.log(`Fatura do aluno ${student.id} marcada como ATRASADA por falha no Connect.`)
          }
          break
        }

        // Caso padrão: faturamento de academia falhou
        const { error } = await supabase
          .from('academies')
          .update({ status: 'Suspenso' })
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscriptionId}`)

        if (error) {
          console.error(`Erro ao suspender academia via webhook (payment failed):`, error)
        } else {
          console.log(`Academia suspensa via webhook. Customer: ${customerId}`)
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
