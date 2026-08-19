import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'

export async function POST(request: Request) {
  try {
    const { plano, academyName, ownerName, email, password } = await request.json()

    if (!plano || !academyName || !ownerName || !email) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Determinar valor em centavos
    let amount = 19900
    if (plano === 'Prata') amount = 9900
    if (plano === 'BlackBelt') amount = 34900

    // Criar Sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `JiuPro - Plano ${plano}`,
              description: `Assinatura mensal para a academia ${academyName}`,
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
      success_url: `${appUrl}/login?status=success_payment`,
      cancel_url: `${appUrl}/?status=cancel_payment`,
      metadata: {
        plano,
        academyName,
        ownerName,
        email,
        password,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar Checkout Stripe:', error)
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 })
  }
}
