import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const { studentId, plano, academyId, email } = await request.json()
    if (!studentId || !plano || !academyId || !email) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 })
    }

    // 1. Buscar a academia no Supabase para obter o stripe_connect_id
    const { data: academy, error: acError } = await supabase
      .from('academies')
      .select('stripe_connect_id, name')
      .eq('id', academyId)
      .single()

    if (acError || !academy || !academy.stripe_connect_id) {
      return NextResponse.json({ error: 'Academia não configurada para pagamentos com cartão' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const origin = request.headers.get('origin')
    const redirectBase = appUrl || origin || 'http://localhost:3000'

    // Determinar valor em centavos da mensalidade
    let amount = 19900
    if (plano === 'Prata') amount = 9900
    if (plano === 'BlackBelt') amount = 34900

    // 2. Criar a sessão de Checkout na Stripe como cobrança direta (Direct Charge)
    // na conta da academia conectada, retendo 5% de taxa de serviço para a plataforma
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Mensalidade Jiu-Jitsu - Plano ${plano}`,
              description: `Assinatura mensal recorrente para a academia ${academy.name}`,
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${redirectBase}/aluno?status=success_payment`,
      cancel_url: `${redirectBase}/aluno?status=cancel_payment`,
      subscription_data: {
        application_fee_percent: 5, // 5% de comissão para a plataforma JiuPro!
      },
      metadata: {
        studentId,
        academyId,
        plano,
      },
    }, {
      stripeAccount: academy.stripe_connect_id, // Executa a cobrança diretamente sob a conta da academia
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar checkout Stripe Connect:', error)
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 })
  }
}
