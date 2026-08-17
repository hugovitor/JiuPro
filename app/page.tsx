// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from './lib/db'

export default function SaaSLandingPage() {
  const router = useRouter()
  const [academias, setAcademias] = useState<any[]>([])
  
  // Form states for creating a new tenant
  const [academyName, setAcademyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'Prata' | 'Ouro' | 'BlackBelt'>('Ouro')
  const [isRegistering, setIsRegistering] = useState(false)

  // Load academies on mount to show in simulator
  useEffect(() => {
    setAcademias(db.getAcademies())
  }, [])

  // Fast login helper for demo accounts
  const handleQuickLogin = (academyId: string) => {
    const users = db.getUsers()
    const user = users.find(u => u.academyId === academyId)
    if (user) {
      document.cookie = `jiupro_session=${user.id}; path=/; max-age=86400; SameSite=Strict;`
      router.push('/dashboard')
    }
  }

  // Handle registration (SaaS Subscription simulation)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!academyName || !ownerName || !email) return

    setIsRegistering(true)
    setTimeout(() => {
      db.registerAcademy(academyName, ownerName, email, selectedPlan)
      setIsRegistering(false)
      router.push('/dashboard')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      
      {/* 1. Header (Navbar) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 py-4 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-zinc-950 rounded-xl flex items-center justify-center border-r-[3.5px] border-red-600 shadow-md">
              <span className="text-white font-black text-xs italic tracking-tighter">JP</span>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Jiu<span className="text-red-600 font-extrabold">Pro</span>
              <span className="ml-1.5 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">SaaS Platform</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="#precos" 
              className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors"
            >
              Planos
            </a>
            <a 
              href="#simulador" 
              className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors"
            >
              Simulador Demo
            </a>
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-bold text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Acessar Painel
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 sm:px-8 bg-white border-b border-slate-200/50">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
              ⚡ GESTÃO DE ACADEMIAS DE JIU-JITSU B2B
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1]">
              A Solução Definitiva para Gerenciar e <br />
              <span className="text-red-600">Escalar sua Academia de Jiu-Jitsu</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-500 leading-relaxed">
              Controle mensalidades, automatize cobranças de PIX por WhatsApp, acompanhe check-ins em tempo real e gerencie folhas de exames e trocas de faixas. Tudo isolado por filial ou conta.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#assinar"
                className="w-full sm:w-auto text-center px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
              >
                Criar Minha Academia (Simulação)
              </a>
              <a
                href="#simulador"
                className="w-full sm:w-auto text-center px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Acessar Demonstrações
              </a>
            </div>
          </div>
        </section>

        {/* 3. Recursos Principais */}
        <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">💰</div>
            <h3 className="font-bold text-sm text-slate-950">Mensalidades e PIX</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Envie lembretes inteligentes via WhatsApp com chave PIX e texto dinâmico. Dê baixa e acompanhe a adimplência geral.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">📅</div>
            <h3 className="font-bold text-sm text-slate-950">Chamada Inteligente</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Alunos agendam treinos via app do aluno. Professores confirmam ou registram faltas direto no painel principal.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">🥋</div>
            <h3 className="font-bold text-sm text-slate-950">Evolução Técnica</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gamificação baseada em frequência. Controle de graus e faixas com históricos completos de linhagem marcial.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">📄</div>
            <h3 className="font-bold text-sm text-slate-950">Exames & Relatórios</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gere folhas de avaliação técnica padronizadas prontas para impressão no A4. Identifique alunos sumidos e evite Churn.
            </p>
          </div>
        </section>

        {/* 4. Simulador SaaS - Sandbox de Demonstração */}
        <section id="simulador" className="py-16 px-6 sm:px-8 bg-slate-100 border-y border-slate-200/60">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Simulador Multi-Tenant Sandbox</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Acesse o sistema sob a perspectiva de diferentes academias pré-configuradas e observe o isolamento dos dados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {academias.map((ac) => {
                const statusColor = ac.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                return (
                  <div key={ac.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                          {ac.status}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Plano {ac.plan}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-base text-slate-950 tracking-tight">{ac.name}</h3>
                      <p className="text-xs text-slate-400">
                        Professor: <span className="font-semibold text-slate-700">{ac.ownerName}</span> <br />
                        E-mail: <span className="font-mono text-[11px] text-slate-500">{ac.ownerEmail}</span>
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleQuickLogin(ac.id)}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                          ac.status === 'Suspenso' 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                            : 'bg-zinc-950 hover:bg-zinc-850 text-white'
                        }`}
                      >
                        {ac.status === 'Suspenso' ? '⚠️ Logar (Conta Suspensa)' : 'Simular Login →'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. Simulador de Compra / Cadastro (Assinar) */}
        <section id="assinar" className="py-16 px-6 sm:px-8 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Compre Acesso e Crie sua Academia</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Escolha seu plano e simule a criação imediata de uma conta administrativa para a sua própria marca.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
            
            {/* Form de Cadastro */}
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4 border-r border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Cadastrar Minha Filial</h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome da Academia</label>
                <input 
                  type="text" 
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  required
                  placeholder="Ex: Gracie Barra Pinheiros" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Professor Responsável</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  placeholder="Ex: Prof. Gabriel Ramos" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">E-mail Administrativo</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contato@minhaacademia.com" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Plano Pretendido</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-700"
                >
                  <option value="Prata">Prata - R$ 99/mês</option>
                  <option value="Ouro">Ouro - R$ 199/mês</option>
                  <option value="BlackBelt">BlackBelt - R$ 349/mês</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-2 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-colors disabled:opacity-50"
              >
                {isRegistering ? 'Provisionando Tatame...' : 'Concluir Assinatura & Acessar'}
              </button>
            </form>

            {/* Resumo de Benefícios */}
            <div id="precos" className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-red-500 border-b border-zinc-800 pb-2">Planos Comerciais</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span>🥈 Plano Prata</span>
                    <span className="font-bold">R$ 99/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-2">Até 50 atletas matriculados, grade horária e chamada.</p>
                  
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span>🥇 Plano Ouro</span>
                    <span className="font-bold">R$ 199/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-2">Até 150 atletas matriculados, suporte financeiro por WhatsApp, controle de graduações e exames.</p>

                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span>🥋 Plano BlackBelt</span>
                    <span className="font-bold">R$ 349/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-2">Atletas ilimitados, multi-unidades unificadas, exportações completas e suporte prioritário.</p>
                </div>
              </div>

              <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700/50 space-y-1.5">
                <h4 className="text-[10px] font-bold text-red-500 uppercase">🛡️ SIMULAÇÃO PROTEGIDA</h4>
                <p className="text-[10px] text-zinc-300 leading-relaxed">
                  O cadastro criará a sua academia isolada no banco de dados local. Você poderá criar alunos, treinos e exames específicos sem interferir nas outras contas de demonstração.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 JiuPro Inc. Gestão Inteligente para Academias de Jiu-Jitsu. Todos os direitos reservados. Oss!</p>
      </footer>

    </div>
  )
}
