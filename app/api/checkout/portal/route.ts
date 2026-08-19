import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const { academyId } = await request.json()

    if (!academyId) {
      return NextResponse.json({ error: 'Academy ID é obrigatório' }, { status: 400 })
    }

    // Busca o stripe_customer_id no Supabase
    const { data: academyData, error: dbError } = await supabase
      .from('academies')
      .select('stripe_customer_id')
      .eq('id', academyId)
      .single()

    if (dbError || !academyData?.stripe_customer_id) {
      return NextResponse.json({ error: 'Academia não encontrada ou sem registro de cliente no Stripe' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Criar a sessão do portal do cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: academyData.stripe_customer_id,
      return_url: `${appUrl}/dashboard/configuracoes`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar Billing Portal Stripe:', error)
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 })
  }
}
