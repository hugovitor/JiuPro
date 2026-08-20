// app/api/cron/gerar-faturas/route.ts
// Roda todo dia 1º do mês via Vercel Cron
// Protegida por CRON_SECRET no header Authorization
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export async function GET(request: Request) {
  // Verifica o CRON_SECRET para evitar execuções não autorizadas
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hoje = new Date()
  const mesAtual = MESES[hoje.getMonth()]
  const anoAtual = hoje.getFullYear()
  const vencimentoPadrao = `10/${String(hoje.getMonth() + 1).padStart(2, '0')}/${anoAtual}`

  let geradas = 0
  let erros = 0

  try {
    // Busca todos os alunos ativos
    const { data: alunos, error: alunosError } = await supabaseAdmin
      .from('students')
      .select('id, mensalidade, dia_vencimento, academy_id')
      .eq('status', 'Ativo')

    if (alunosError) throw alunosError

    for (const aluno of alunos || []) {
      // Verifica se já existe fatura para o mês atual
      const { data: faturaExistente } = await supabaseAdmin
        .from('invoices')
        .select('id')
        .eq('student_id', aluno.id)
        .eq('mes', mesAtual)
        .single()

      if (faturaExistente) continue // Fatura já existe, pula

      // Calcula a data de vencimento com o dia configurado
      const diaVenc = aluno.dia_vencimento || '10'
      const vencimento = `${diaVenc.padStart(2,'0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${anoAtual}`

      // Cria a fatura do mês
      const { error: insertError } = await supabaseAdmin
        .from('invoices')
        .insert({
          student_id: aluno.id,
          mes: mesAtual,
          vencimento,
          valor: aluno.mensalidade || '150,00',
          status: 'Atrasado'
        })

      if (insertError) {
        console.error(`Erro ao criar fatura para aluno ${aluno.id}:`, insertError)
        erros++
      } else {
        geradas++
      }
    }

    console.log(`Cron faturas: ${geradas} geradas, ${erros} erros — ${mesAtual}/${anoAtual}`)
    return NextResponse.json({
      success: true,
      mes: mesAtual,
      ano: anoAtual,
      geradas,
      erros,
      total_alunos: alunos?.length || 0
    })
  } catch (err: any) {
    console.error('Erro no cron de faturas:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
