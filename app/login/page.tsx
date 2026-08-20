// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 1. Tenta buscar o usuário direto no banco Supabase (para clientes reais pós-Stripe)
      const { data: user, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (dbError || !user) {
        // Fallback: busca no LocalStorage (para as contas modelo de demonstração)
        const localUsers = db.getUsers()
        const localUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase())

        if (localUser) {
          document.cookie = `jiupro_session=${localUser.id}; path=/; max-age=86400; SameSite=Strict;`
          setIsLoading(false)
          router.push('/dashboard')
          return
        }

        setIsLoading(false)
        setError('E-mail não cadastrado. Cadastre sua academia na página inicial!')
        return
      }

      // 2. Valida a senha do usuário
      if (user.password !== password) {
        setIsLoading(false)
        setError('Senha incorreta para o e-mail informado!')
        return
      }

      // 3. Salva no LocalStorage local para sincronização de cache do resto do app
      const localUsers = db.getUsers()
      if (!localUsers.some(u => u.id === user.id)) {
        localUsers.push({
          id: user.id,
          academyId: user.academy_id,
          name: user.name,
          email: user.email,
          role: user.role as any,
          grade: user.grade || 'Faixa Preta'
        })
        localStorage.setItem('jiupro_users', JSON.stringify(localUsers))
      }

      // 4. Cria o cookie de sessão e envia ao dashboard
      document.cookie = `jiupro_session=${user.id}; path=/; max-age=86400; SameSite=Strict;`
      setIsLoading(false)
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setError('Erro ao conectar com o banco de dados. Verifique a conexão.')
    }
  }

  const handleQuickLogin = (emailStr: string) => {
    setEmail(emailStr)
    setPassword('••••••••')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Header JiuPro */}
        <div className="flex flex-col items-center">
          {/* Logo JiuPro inspirada em uma ponta de faixa preta */}
          <div className="h-11 w-11 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">
            Jiu<span className="text-red-600 font-extrabold">Pro</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Gestão inteligente para sua academia
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              E-mail de acesso
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="professor@jiupro.com"
              className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Senha
              </label>
              <a href="/login/recuperar-senha" className="text-[10px] font-medium text-slate-400 hover:text-slate-900 transition-colors">
                Esqueceu a senha?
              </a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 focus:outline-none transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Autenticando tatame...' : 'Entrar no JiuPro'}
          </button>
        </form>



        <p className="text-center text-[10px] text-slate-400">
          Sua academia ainda não usa o JiuPro?{' '}
          <a href="/" className="font-semibold text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors">
            Conheça nossos planos
          </a>
        </p>

      </div>
    </main>
  )
}
