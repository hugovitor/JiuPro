// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '../lib/db'

export default function SuperadminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // State for administrative data
  const [academies, setAcademies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')

  // Check auth cookie on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      const adminCookie = cookies.find(c => c.trim().startsWith('jiupro_superadmin='))
      if (adminCookie && adminCookie.split('=')[1] === 'true') {
        setIsAuthenticated(true)
        setAcademies(db.superadminGetAcademies())
      }
    }
  }, [])

  // Handle superadmin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (email === 'admin@jiupro.com.br' && password === 'admin') {
      document.cookie = 'jiupro_superadmin=true; path=/; max-age=86400; SameSite=Strict;'
      setIsAuthenticated(true)
      setAcademies(db.superadminGetAcademies())
    } else {
      setLoginError('Credenciais administrativas inválidas. Acesso restrito ao dono da plataforma.')
    }
  }

  // Handle logout
  const handleLogout = () => {
    document.cookie = 'jiupro_superadmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;'
    setIsAuthenticated(false)
  }

  // Administrative mutations
  const handleToggleStatus = (academyId: string, currentStatus: 'Ativo' | 'Suspenso') => {
    const nextStatus = currentStatus === 'Ativo' ? 'Suspenso' : 'Ativo'
    db.superadminSetAcademyStatus(academyId, nextStatus)
    setAcademies(db.superadminGetAcademies())
  }

  const handleChangePlan = (academyId: string, plan: 'Prata' | 'Ouro' | 'BlackBelt') => {
    db.superadminSetAcademyPlan(academyId, plan)
    setAcademies(db.superadminGetAcademies())
  }

  // Computations
  const totalAcademies = academies.length
  const activeAcademies = academies.filter(a => a.status === 'Ativo').length
  const suspendedAcademies = academies.filter(a => a.status === 'Suspenso').length

  const mrr = academies.reduce((acc, curr) => {
    if (curr.status !== 'Ativo') return acc
    let price = 199
    if (curr.plan === 'Prata') price = 99
    if (curr.plan === 'BlackBelt') price = 349
    return acc + price
  }, 0)

  // Filtered list
  const filteredAcademies = academies.filter((ac) => {
    const matchesSearch = 
      ac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlan = filterPlan === 'Todos' || ac.plan === filterPlan
    const matchesStatus = filterStatus === 'Todos' || ac.status === filterStatus

    return matchesSearch && matchesPlan && matchesStatus
  })

  // 1. Superadmin Login Screen
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 sm:px-6 lg:px-8 font-sans antialiased text-zinc-150">
        <div className="w-full max-w-sm space-y-6 bg-zinc-950 p-8 rounded-2xl border border-zinc-800 shadow-xl">
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
              <span className="text-black font-black text-xl italic tracking-tighter">JP</span>
            </div>
            <h1 className="mt-5 text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Superadmin <span className="text-red-500 font-extrabold">JiuPro</span>
            </h1>
            <p className="mt-1 text-[11px] text-zinc-500">
              Gerenciamento central do SaaS JiuPro
            </p>
          </div>

          {loginError && (
            <div className="bg-red-950/50 text-red-400 text-xs p-3 rounded-lg border border-red-900/40 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                E-mail Administrativo
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@jiupro.com.br"
                className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Chave Secreta
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Senha mestra superadmin"
                className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 py-3 text-xs font-black text-black bg-white rounded-xl shadow hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Autenticar Proprietário
            </button>
          </form>

          <p className="text-center text-[10px] text-zinc-650">
            Apenas o dono da plataforma JiuPro possui credenciais de acesso ao superadmin.
          </p>

        </div>
      </main>
    )
  }

  // 2. Superadmin Control Panel
  return (
    <div className="min-h-screen bg-[#09090b] font-sans antialiased text-zinc-100 flex flex-col justify-between selection:bg-red-650 selection:text-white">
      
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-900 py-4 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center border-r-[3.5px] border-red-600 shadow-lg">
              <span className="text-black font-black text-xs italic tracking-tighter">JP</span>
            </div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              JiuPro <span className="text-red-500 font-extrabold">Painel Geral</span>
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Sair do Admin
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administração do Sistema</h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">Controle de faturamento, planos comerciais e status de filiais do JiuPro.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">SaaS MRR Estimado</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-emerald-400">R$ {mrr.toFixed(2).replace('.', ',')}</span>
              <p className="text-[9px] text-zinc-550 mt-1 font-light">Receita Recorrente Mensal de filiais ativas</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Filiais Cadastradas</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-white">{totalAcademies}</span>
              <p className="text-[9px] text-zinc-550 mt-1">Total de inquilinos (Tenants)</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Assinaturas Ativas</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-emerald-500">{activeAcademies}</span>
              <p className="text-[9px] text-zinc-550 mt-1">Academias com acesso liberado</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Filiais Suspensas</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-red-500">{suspendedAcademies}</span>
              <p className="text-[9px] text-zinc-550 mt-1">Inadimplentes ou expiradas</p>
            </div>
          </div>

        </div>

        {/* Filter Toolbar */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por academia, professor ou email..."
              className="w-full md:max-w-md px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Plano:</span>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2.5 text-xs text-white cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Prata">Prata</option>
                <option value="Ouro">Ouro</option>
                <option value="BlackBelt">BlackBelt</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2.5 text-xs text-white cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academies Table */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Academia</th>
                  <th className="p-4">Mestre Responsável</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredAcademies.length > 0 ? (
                  filteredAcademies.map((ac) => {
                    const statusClass = ac.status === 'Ativo' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                      : 'bg-rose-950/60 text-rose-400 border border-rose-900/40'
                    return (
                      <tr key={ac.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-4 font-bold text-white">{ac.name}</td>
                        <td className="p-4 text-zinc-300">{ac.ownerName}</td>
                        <td className="p-4 text-zinc-450 font-mono text-[11px]">{ac.ownerEmail}</td>
                        <td className="p-4">
                          <select
                            value={ac.plan}
                            onChange={(e) => handleChangePlan(ac.id, e.target.value as any)}
                            className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 font-semibold cursor-pointer text-[11px]"
                          >
                            <option value="Prata">Prata</option>
                            <option value="Ouro">Ouro</option>
                            <option value="BlackBelt">BlackBelt</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}`}>
                            {ac.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(ac.id, ac.status)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer ${
                              ac.status === 'Ativo' 
                                ? 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/30' 
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/30'
                            }`}
                          >
                            {ac.status === 'Ativo' ? 'Suspender Acesso' : 'Ativar Acesso'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-light">
                      Nenhuma filial encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>© 2526 JiuPro Admin Core. Todos os direitos reservados. Proprietário Autorizado.</p>
      </footer>

    </div>
  )
}
