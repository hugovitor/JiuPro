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

  // Diagnostics states
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [diagnoseResult, setDiagnoseResult] = useState<any>(null)

  const handleRunDiagnostics = async () => {
    setIsDiagnosing(true)
    setDiagnoseResult(null)
    try {
      const response = await fetch('/api/admin/diagnose')
      const data = await response.json()
      setDiagnoseResult(data)
    } catch (err) {
      console.error(err)
      alert('Erro ao rodar diagnóstico. Verifique a conexão.')
    } finally {
      setIsDiagnosing(false)
    }
  }

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
      document.cookie = 'jiupro_superadmin=true; path=/; max-age=86400; SameSite=Lax;'
      setIsAuthenticated(true)
      setAcademies(db.superadminGetAcademies())
    } else {
      setLoginError('Credenciais administrativas inválidas. Acesso restrito ao proprietário.')
    }
  }

  // Handle logout
  const handleLogout = () => {
    document.cookie = 'jiupro_superadmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;'
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

  // 1. Superadmin Login Screen - Clean White Layout
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
        <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
              <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
            </div>
            <h1 className="mt-5 text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-1.5">
              Controle Geral <span className="text-red-600 font-extrabold">JiuPro</span>
            </h1>
            <p className="mt-1 text-[11px] text-zinc-400">
              Acesso exclusivo do proprietário
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 text-red-750 text-xs p-3 rounded-lg border border-red-200/50 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                E-mail Administrativo
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@jiupro.com.br"
                className="w-full px-3.5 py-2.5 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Chave Secreta
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Senha mestra superadmin"
                className="w-full px-3.5 py-2.5 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 py-3 text-xs font-black text-white bg-slate-950 hover:bg-slate-850 rounded-xl shadow transition-colors cursor-pointer"
            >
              Autenticar Acesso
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-450 leading-relaxed">
            Apenas o proprietário autorizado do JiuPro possui chaves de acesso a esta área.
          </p>

        </div>
      </main>
    )
  }

  // 2. Superadmin Control Panel - Clean White Theme
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-zinc-950 rounded-xl flex items-center justify-center border-r-[3.5px] border-red-600 shadow-lg">
              <span className="text-white font-black text-xs italic tracking-tighter">JP</span>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-950 flex items-center gap-2">
              JiuPro <span className="text-red-600 font-extrabold">Painel do Proprietário</span>
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gerenciamento Geral</h1>
            <p className="text-xs text-slate-500 mt-1 font-light">Controle comercial e status de todas as filiais cadastradas no JiuPro.</p>
          </div>
          <div>
            <button
              onClick={handleRunDiagnostics}
              disabled={isDiagnosing}
              className="text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
            >
              {isDiagnosing ? '🩺 Rodando Diagnóstico...' : '🩺 Rodar Diagnóstico Geral'}
            </button>
          </div>
        </div>

        {/* Diagnostics Report Card */}
        {diagnoseResult && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                🩺 Relatório de Diagnóstico do Sistema
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${diagnoseResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {diagnoseResult.success ? 'Sistema Saudável' : 'Problemas Encontrados'}
                </span>
              </h2>
              <button 
                onClick={() => setDiagnoseResult(null)}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {diagnoseResult.report.map((t: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-start gap-2.5">
                  <span className="text-base">
                    {t.status === 'success' ? '✅' : '❌'}
                  </span>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-800">{t.name}</h3>
                    <p className="text-[10px] text-slate-500 font-light leading-relaxed">{t.details}</p>
                    {t.error && (
                      <pre className="text-[9px] text-rose-600 bg-rose-50/50 p-1.5 rounded border border-rose-100 mt-1.5 overflow-x-auto max-w-full font-mono">
                        {t.error}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MRR Estimado</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-emerald-600">R$ {mrr.toFixed(2).replace('.', ',')}</span>
              <p className="text-[9px] text-slate-400 mt-1 font-light">Faturamento mensal recorrente de filiais ativas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filiais Cadastradas</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-slate-900">{totalAcademies}</span>
              <p className="text-[9px] text-slate-400 mt-1">Total de contas registradas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contas Ativas</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-emerald-600">{activeAcademies}</span>
              <p className="text-[9px] text-slate-400 mt-1">Academias com acesso liberado</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contas Suspensas</span>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-rose-600">{suspendedAcademies}</span>
              <p className="text-[9px] text-slate-400 mt-1">Contas bloqueadas ou com pendências</p>
            </div>
          </div>

        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por academia, professor ou email..."
              className="w-full md:max-w-md px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Plano:</span>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-800 cursor-pointer shadow-sm"
              >
                <option value="Todos">Todos</option>
                <option value="Prata">Prata</option>
                <option value="Ouro">Ouro</option>
                <option value="BlackBelt">BlackBelt</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-800 cursor-pointer shadow-sm"
              >
                <option value="Todos">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academies Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Academia</th>
                  <th className="p-4">Mestre Responsável</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Plano Contratado</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAcademies.length > 0 ? (
                  filteredAcademies.map((ac) => {
                    const statusClass = ac.status === 'Ativo' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                    return (
                      <tr key={ac.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{ac.name}</td>
                        <td className="p-4 text-slate-600">{ac.ownerName}</td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">{ac.ownerEmail}</td>
                        <td className="p-4">
                          <select
                            value={ac.plan}
                            onChange={(e) => handleChangePlan(ac.id, e.target.value as any)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-semibold cursor-pointer text-[11px] shadow-sm"
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
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
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
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-light">
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
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-450">
        <p>© 2026 Painel Administrativo JiuPro. Todos os direitos reservados.</p>
      </footer>

    </div>
  )
}
