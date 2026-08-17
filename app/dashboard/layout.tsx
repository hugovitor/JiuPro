// app/dashboard/layout.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { db, User, Academy } from '../lib/db'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReactivating, setIsReactivating] = useState(false)

  const loadSession = () => {
    const loggedUser = db.getLoggedInUser()
    if (!loggedUser) {
      router.push('/login')
      return
    }
    setUser(loggedUser)
    const currentAcademy = db.getAcademy(loggedUser.academyId)
    if (currentAcademy) {
      setAcademy(currentAcademy)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSession()
  }, [])

  const handleLogout = () => {
    document.cookie = "jiupro_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    router.push('/login')
  }

  const handleSimulatePayment = () => {
    if (!academy) return
    setIsReactivating(true)
    setTimeout(() => {
      db.reactivateAcademy(academy.id)
      setIsReactivating(false)
      // Reload session
      loadSession()
    }, 1000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 bg-zinc-950 rounded-xl flex items-center justify-center border-r-[3px] border-red-600 animate-pulse">
            <span className="text-white font-black text-xs italic tracking-tighter">JP</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">Verificando credenciais...</span>
        </div>
      </div>
    )
  }

  // Multi-tenant Billing Lock: Account Suspended
  if (academy && academy.status === 'Suspenso') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans px-4 antialiased">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-rose-100">
            ⚠️
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Acesso Suspenso</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              O acesso à conta administrativa da **{academy.name}** está suspenso devido a pendências no pagamento da assinatura do plano **JiuPro {academy.plan}**.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-left text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Fatura pendente:</span>
              <span className="text-rose-600">R$ {academy.plan === 'BlackBelt' ? '349,00' : academy.plan === 'Ouro' ? '199,00' : '99,00'}</span>
            </div>
            <p className="text-[10px] text-slate-400">Vencimento original: 10 dias atrás</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSimulatePayment}
              disabled={isReactivating}
              className="w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-colors disabled:opacity-50"
            >
              {isReactivating ? 'Confirmando PIX...' : '⚡ Simular Pagamento da Fatura'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Fazer Logout / Alternar Conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Itens do menu com os caminhos e os ícones em formato SVG (traços finos de 1.5px)
  const menuItems = [
    { 
      name: 'Painel Geral', 
      path: '/dashboard', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      )
    },
    { 
      name: 'Atletas Matriculados', 
      path: '/dashboard/alunos', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      )
    },
    { 
      name: 'Fazer Chamada', 
      path: '/dashboard/frequencia', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3m0 0c2.917 0 5.747.294 8.5.862m-8.5-.862A48.394 48.394 0 0 0 3.402 3.862m0 0c.115-.033.23-.065.346-.096m0 0A48.556 48.556 0 0 1 12 3M3.402 3.862c-1.13.094-1.975 1.057-1.975 2.192V16.5A2.25 2.25 0 0 0 3.69 18.75h3.12" />
        </svg>
      )
    },
    { 
      name: 'Alunos Sumidos', 
      path: '/dashboard/relatorios', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      )
    },
    { 
      name: 'Graduações', 
      path: '/dashboard/promocoes', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.75a1.125 1.125 0 0 1-1.125-1.125V3.375c0-.621-.503-1.125-1.125-1.125h-1.5a1.125 1.125 0 0 0-1.125 1.125v3.375M16.5 18.75V15.75M12 3v1.5m0 3v1.5m0 3v1.5m-3-6h6m-6 3h6" />
        </svg>
      )
    },
    { 
      name: 'Fichas de Exame', 
      path: '/dashboard/exames', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      )
    },
    { 
      name: 'Configurações', 
      path: '/dashboard/configuracoes', 
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.305.233-.45.631-.39 1.012.006.038.01.077.01.115v.002c0 .037-.004.075-.01.114-.06.38.085.778.39 1.011l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.304-.233.449-.63.39-1.011a4.832 4.832 0 0 1-.01-.115V12c0-.038.004-.077.01-.115.06-.38-.085-.778-.39-1.011l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )
    },
  ]

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'JP'

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* 1. SIDEBAR ULTRA CLEAN (Fundo Branco + Tons de Cinza) */}
      <aside className="w-64 bg-white text-slate-500 flex flex-col justify-between border-r border-slate-200/80 sticky top-0 h-screen hidden md:flex">
        <div>
          {/* Logo Minimalista da Academia */}
          <div className="p-6 h-16 flex items-center gap-2.5 border-b border-slate-100">
            <div className="h-6 w-6 bg-slate-950 rounded flex items-center justify-center border-r-[3px] border-red-600 shadow-sm">
              <span className="text-white font-black text-[10px] italic tracking-tighter">
                {academy?.name ? academy.name[0] : 'J'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-tight text-slate-900 truncate block">
                {academy?.name || 'JiuPro'}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block leading-none">
                Plano {academy?.plan || 'Ouro'}
              </span>
            </div>
          </div>

          {/* Links de Navegação Suaves */}
          <nav className="p-3 space-y-0.5 mt-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}>
                    {item.icon}
                  </span>
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Rodapé do Menu (Perfil e Logout) */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="h-7 w-7 bg-slate-900 text-white font-bold rounded-full flex items-center justify-center text-[10px] shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-none">{user?.name || 'Professor'}</p>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{user?.grade || 'Faixa Preta'}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-md transition-all mt-1"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTEÚDO DA PÁGINA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Responsivo para Celular (Mobile Only) */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-950 rounded flex items-center justify-center border-r-2 border-red-600">
              <span className="text-white font-black text-[10px] italic tracking-tighter">
                {academy?.name ? academy.name[0] : 'J'}
              </span>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-950">
              {academy?.name || 'JiuPro'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 bg-red-50/60 px-3 py-1.5 rounded"
          >
            Sair
          </button>
        </header>

        {/* Injeção dinâmica das telas individuais */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>

    </div>
  )
}
