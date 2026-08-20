// app/api/auth/nova-senha/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { token, email, novaSenha, tipo } = await request.json()
    if (!token || !email || !novaSenha) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    // Verificar token
    const { data: resetRecord, error } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .single()

    if (error || !resetRecord) {
      return NextResponse.json({ error: 'Link inválido ou já utilizado.' }, { status: 400 })
    }

    // Verificar se não expirou
    if (new Date(resetRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expirado. Solicite um novo.' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedSenha = await bcrypt.hash(novaSenha, 10)

    // Atualizar senha na tabela correta
    const tabela = tipo === 'aluno' ? 'students' : 'users'
    const { error: updateError } = await supabaseAdmin
      .from(tabela)
      .update({ password: hashedSenha })
      .eq('email', email.toLowerCase())

    if (updateError) throw updateError

    // Marcar token como usado
    await supabaseAdmin
      .from('password_resets')
      .update({ used: true })
      .eq('token', token)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erro ao redefinir senha:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
