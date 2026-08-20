import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'

export async function POST(request: Request) {
  try {
    const { academyId } = await request.json()
    if (!academyId) {
      return NextResponse.json({ error: 'ID da academia obrigatório' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // 1. Criar a conta Express Connect na Stripe
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // 2. Criar o link de Onboarding para a academia
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/dashboard/configuracoes?connect=refresh&academyId=${academyId}`,
      return_url: `${origin}/dashboard/configuracoes?connect=success&accountId=${account.id}&academyId=${academyId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Erro no onboarding do Stripe Connect:', error)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}
