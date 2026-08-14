// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Trecho a ser atualizado dentro de app/login/page.tsx

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  
  console.log('JiuPro Login:', email, password)
  
  // Simulação de criação de Cookie de Sessão no navegador
  document.cookie = "jiupro_session=true; path=/; max-age=86400; SameSite=Strict;"
  
  setTimeout(() => {
    setIsLoading(false)
    router.push('/dashboard')
  }, 1000)
}


  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Header JiuPro */}
        <div className="flex flex-col items-center">
          {/* Logo JiuPro inspirada em uma ponta de faixa preta */}
          <div className="h-11 w-11 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">
            Jiu<span className="text-red-600 font-extrabold">Pro</span>
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Gestão inteligente para sua academia
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                E-mail de acesso
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="professor@jiupro.com"
                className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Senha
                </label>
                <a href="#" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Autenticando tatame...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 text-zinc-400">Área Restrita</span>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Sua academia ainda não usa o JiuPro?{' '}
          <a href="#" className="font-semibold text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors">
            Conheça nossos planos
          </a>
        </p>

      </div>
    </main>
  )
}
