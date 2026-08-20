// app/api/cron/notificacoes-vencimento/route.ts
// Roda todo dia às 9h via Vercel Cron
// Envia e-mail para alunos com faturas vencendo em até 3 dias
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_builds')

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hoje = new Date()
  const em3Dias = new Date()
  em3Dias.setDate(hoje.getDate() + 3)

  const formatarData = (d: Date) => 
    `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`

  let enviados = 0
  let erros = 0

  try {
    // Busca faturas com status Atrasado
    const { data: faturas, error } = await supabaseAdmin
      .from('invoices')
      .select('*, students(nome, email, academy_id, academies(name))')
      .eq('status', 'Atrasado')

    if (error) throw error

    for (const fatura of faturas || []) {
      const aluno = (fatura as any).students
      if (!aluno?.email) continue

      // Verifica se a data de vencimento é dentro de 3 dias
      const [dia, mes, ano] = fatura.vencimento.split('/')
      const dataVenc = new Date(`${ano}-${mes}-${dia}`)
      const diffDias = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDias < 0 || diffDias > 3) continue // Só avisa se vence em até 3 dias

      const academyName = aluno.academies?.name || 'sua academia'

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: aluno.email,
          subject: `⚠️ Mensalidade vencendo em ${diffDias === 0 ? 'hoje' : `${diffDias} dia(s)`} — ${academyName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px;">
              <h2 style="color: #dc2626;">⚠️ Lembrete de Mensalidade</h2>
              <p>Olá, <strong>${aluno.nome}</strong>!</p>
              <p>Sua mensalidade de <strong>${fatura.mes}</strong> no valor de <strong>R$ ${fatura.valor}</strong> 
              vence em <strong>${diffDias === 0 ? 'HOJE' : `${diffDias} dia(s)`}</strong> (${fatura.vencimento}).</p>
              <p>Acesse o app JiuPro para efetuar o pagamento via cartão de crédito ou PIX.</p>
              <br/>
              <p style="color: #666; font-size: 12px;">JiuPro — Gestão de Academia de Jiu-Jitsu</p>
            </div>
          `
        })
        enviados++
      } catch (emailErr) {
        console.error(`Erro ao enviar e-mail para ${aluno.email}:`, emailErr)
        erros++
      }
    }

    return NextResponse.json({ success: true, enviados, erros })
  } catch (err: any) {
    console.error('Erro no cron de notificações:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
