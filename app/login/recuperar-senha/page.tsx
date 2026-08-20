// app/login/recuperar-senha/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<'professor' | 'aluno'>('professor')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), tipo: userType })
      })

      // Sempre mostrar a tela de "enviado" por segurança (não revelar se email existe)
      setEmailSent(true)
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">

        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="h-11 w-11 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">
            Recuperar Senha
          </h1>
          <p className="mt-1 text-xs text-zinc-400 text-center">
            Enviaremos um link de redefinição para o seu e-mail
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Seleção do tipo de usuário */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => { setUserType('professor'); setError('') }}
                className={`flex-1 py-1.5 rounded-md transition-all ${userType === 'professor' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:text-zinc-800'}`}
              >
                Professor / Dono
              </button>
              <button
                type="button"
                onClick={() => { setUserType('aluno'); setError('') }}
                className={`flex-1 py-1.5 rounded-md transition-all ${userType === 'aluno' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:text-zinc-800'}`}
              >
                Atleta / Aluno
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  E-mail cadastrado
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Ex: atleta@provedor.com"
                  className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : '📧 Enviar Link de Redefinição'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <div className="text-4xl">📧</div>
              <p className="text-sm font-bold text-emerald-800">E-mail enviado!</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Se o e-mail <strong>{email}</strong> está cadastrado no sistema, você receberá um link de redefinição de senha em instantes.
              </p>
              <p className="text-[10px] text-emerald-600">O link expira em 1 hora. Verifique também a pasta de spam.</p>
            </div>
            <button
              onClick={() => setEmailSent(false)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Tentar com outro e-mail
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => router.push(userType === 'aluno' ? '/aluno/login' : '/login')}
            className="text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar para Login
          </button>
        </div>

      </div>
    </main>
  )
}
