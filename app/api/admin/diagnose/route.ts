// app/api/admin/diagnose/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '../../../lib/stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const report: any[] = []

  // Helper to push test results
  const logTest = (name: string, status: 'success' | 'failed', details: string, error?: string) => {
    report.push({ name, status, details, error })
  }

  // 1. Test Supabase connection and read access on all tables
  try {
    const tables = ['academies', 'users', 'students', 'invoices', 'attendances', 'notifications', 'products']
    for (const table of tables) {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1)
      if (error) {
        logTest(`Supabase: Leitura Tabela [${table}]`, 'failed', `Erro ao consultar tabela ${table}`, error.message)
      } else {
        logTest(`Supabase: Leitura Tabela [${table}]`, 'success', `Tabela ${table} lida com sucesso (Linhas lidas: ${data.length})`)
      }
    }
  } catch (err: any) {
    logTest('Supabase: Conexão e Tabelas', 'failed', 'Erro catastrófico ao conectar ou ler tabelas', err.message)
  }

  // 2. Test Supabase write access (bypassing RLS check using admin client)
  try {
    const dummyId = 'dummy-diag-' + Date.now()
    const { error: insertError } = await supabaseAdmin.from('notifications').insert({
      id: dummyId,
      title: 'Diagnóstico do Sistema',
      content: 'Executando testes automatizados...',
      date: new Date().toISOString().split('T')[0]
    })

    if (insertError) {
      logTest('Supabase: Escrita e Persistência', 'failed', 'Erro ao inserir registro temporário', insertError.message)
    } else {
      // Cleanup immediate
      const { error: deleteError } = await supabaseAdmin.from('notifications').delete().eq('id', dummyId)
      if (deleteError) {
        logTest('Supabase: Escrita e Persistência', 'success', 'Inserção funcionou, mas houve erro na limpeza temporária', deleteError.message)
      } else {
        logTest('Supabase: Escrita e Persistência', 'success', 'Inserção e deleção temporária concluídas com sucesso!')
      }
    }
  } catch (err: any) {
    logTest('Supabase: Escrita e Persistência', 'failed', 'Erro catastrófico ao testar escrita', err.message)
  }

  // 3. Test Stripe API Keys and connection
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      logTest('Stripe: Conexão com API', 'failed', 'Chave secreta STRIPE_SECRET_KEY não configurada no ambiente')
    } else {
      const balance = await stripe.balance.retrieve()
      logTest('Stripe: Conexão com API', 'success', 'Conexão estabelecida com a Stripe. Saldo de teste consultado com sucesso!')
    }
  } catch (err: any) {
    logTest('Stripe: Conexão com API', 'failed', 'Falha ao autenticar com a API do Stripe', err.message)
  }

  // 4. Test Stripe Webhook configuration
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logTest('Stripe: Webhook Config', 'failed', 'Aviso: STRIPE_WEBHOOK_SECRET não está configurado. O aplicativo rodará em modo bypass de assinaturas.')
    } else {
      logTest('Stripe: Webhook Config', 'success', 'Webhook Secret detectado. Assinatura de webhooks configurada.')
    }
  } catch (err: any) {
    logTest('Stripe: Webhook Config', 'failed', 'Erro ao ler webhook secret', err.message)
  }

  const hasFailed = report.some(t => t.status === 'failed')
  
  return NextResponse.json({
    success: !hasFailed,
    timestamp: new Date().toISOString(),
    report
  })
}
