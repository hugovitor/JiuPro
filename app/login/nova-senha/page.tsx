// app/login/nova-senha/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function NovaSenhaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  const tipo = searchParams.get('tipo') || 'professor'

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      setError('Link inválido. Solicite um novo link de redefinição.')
    }
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/nova-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, novaSenha, tipo })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir senha.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(tipo === 'aluno' ? '/aluno/login' : '/login')
      }, 2000)
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans antialiased text-slate-900">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="h-11 w-11 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">Nova Senha</h1>
          <p className="mt-1 text-xs text-zinc-400 text-center">Defina uma nova senha segura para sua conta</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-2">
            <div className="text-3xl">✅</div>
            <p className="text-sm font-bold text-emerald-800">Senha redefinida com sucesso!</p>
            <p className="text-xs text-emerald-600">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2.5 mt-1 text-xs bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmar Senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 mt-1 text-xs bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-3 text-xs font-black text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : '🔒 Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-slate-400 text-sm">Carregando...</p></div>}>
      <NovaSenhaContent />
    </Suspense>
  )
}
