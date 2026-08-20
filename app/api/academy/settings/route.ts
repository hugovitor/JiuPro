// app/api/academy/settings/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { academyId, settings } = await request.json()
    if (!academyId) {
      return NextResponse.json({ error: 'ID da academia obrigatório.' }, { status: 400 })
    }

    const updatePayload: any = {}
    if (settings.mensalidadePadrao !== undefined) {
      updatePayload.mensalidade_padrao = settings.mensalidadePadrao
    }
    if (settings.diaVencimento !== undefined) {
      updatePayload.dia_vencimento = settings.diaVencimento
    }
    if (settings.whatsappTemplate !== undefined) {
      updatePayload.whatsapp_template = settings.whatsappTemplate
    }
    if (settings.stripeConnectId !== undefined) {
      updatePayload.stripe_connect_id = settings.stripeConnectId
    }

    const { error } = await supabaseAdmin
      .from('academies')
      .update(updatePayload)
      .eq('id', academyId)

    if (error) {
      console.error('Erro ao atualizar configurações no Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
