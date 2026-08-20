// app/api/aluno/register/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { student, invoice } = await request.json()
    if (!student || !student.id) {
      return NextResponse.json({ error: 'Dados do aluno inválidos.' }, { status: 400 })
    }

    // Insert student
    const { error: stdError } = await supabaseAdmin
      .from('students')
      .insert(student)

    if (stdError) {
      console.error('Erro ao registrar aluno no Supabase:', stdError)
      return NextResponse.json({ error: stdError.message }, { status: 500 })
    }

    // Insert invoice
    if (invoice) {
      const { error: invError } = await supabaseAdmin
        .from('invoices')
        .insert(invoice)

      if (invError) {
        console.error('Erro ao criar fatura inicial no Supabase:', invError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
