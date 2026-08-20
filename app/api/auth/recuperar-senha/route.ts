// app/api/auth/recuperar-senha/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_builds')

export async function POST(request: Request) {
  try {
    const { email, tipo } = await request.json() // tipo: 'aluno' | 'professor'
    if (!email) return NextResponse.json({ error: 'E-mail obrigatório.' }, { status: 400 })

    const emailNorm = email.trim().toLowerCase()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jiu-pro-beta.vercel.app'

    // Verificar se o usuário existe (aluno ou professor)
    let userFound = false
    let userName = ''

    if (tipo === 'aluno') {
      const { data } = await supabaseAdmin.from('students').select('nome').eq('email', emailNorm).single()
      if (data) { userFound = true; userName = data.nome }
    } else {
      const { data } = await supabaseAdmin.from('users').select('name').eq('email', emailNorm).single()
      if (data) { userFound = true; userName = data.name }
    }

    if (!userFound) {
      // Por segurança, retornamos sucesso mesmo se o e-mail não existir
      return NextResponse.json({ success: true })
    }

    // Gerar token único de 32 bytes
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora

    // Salvar token na tabela password_resets
    await supabaseAdmin.from('password_resets').upsert({
      id: `reset-${Date.now()}`,
      email: emailNorm,
      token,
      tipo: tipo || 'professor',
      expires_at: expiresAt,
      used: false
    })

    const resetUrl = `${appUrl}/${tipo === 'aluno' ? 'aluno' : ''}/login/nova-senha?token=${token}&email=${encodeURIComponent(emailNorm)}&tipo=${tipo || 'professor'}`

    // Enviar e-mail com o link
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: emailNorm,
      subject: '🔑 Redefinição de Senha — JiuPro',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #09090b; color: white; font-weight: 900; font-size: 20px; font-style: italic; padding: 8px 16px; border-radius: 8px; border-right: 4px solid #dc2626;">JP</div>
          </div>
          <h2 style="color: #0f172a; text-align: center;">Redefinição de Senha</h2>
          <p>Olá, <strong>${userName}</strong>!</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta JiuPro.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #09090b; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
              🔑 Redefinir minha senha
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.</p>
          <p style="color: #94a3b8; font-size: 12px;">JiuPro — Gestão Inteligente para sua Academia de Jiu-Jitsu</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erro ao enviar e-mail de recuperação:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
