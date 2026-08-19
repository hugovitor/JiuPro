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
  const [password, setPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'Prata' | 'Ouro' | 'BlackBelt'>('Ouro')
  const [isRegistering, setIsRegistering] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  // Load academies on mount to show in simulator
  useEffect(() => {
    setAcademias(db.getAcademies())
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setPaymentStatus(params.get('status'))
    }
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

  // Handle registration (Stripe Checkout Integration)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!academyName || !ownerName || !email || !password) return

    setIsRegistering(true)

    try {
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plano: selectedPlan,
          academyName,
          ownerName,
          email,
          password,
        }),
      })

      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao iniciar sessão de checkout do Stripe. Verifique suas credenciais API.')
        setIsRegistering(false)
      }
    } catch (err) {
      console.error('Erro no fetch do Stripe Checkout:', err)
      alert('Erro de conexão ao processar checkout. Tente novamente.')
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-600 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* faixa preta brand accent at the very top of the page - with centered, wide, equal-sized white stripes */}
      <div className="h-3 bg-zinc-950 flex justify-end">
        <div className="w-28 h-full bg-red-600 flex items-center justify-center gap-1.5 px-2 border-l border-r border-white/20">
          <div className="w-[4.5px] h-full bg-white" />
          <div className="w-[4.5px] h-full bg-white" />
          <div className="w-[4.5px] h-full bg-white" />
          <div className="w-[4.5px] h-full bg-white" />
        </div>
      </div>

      {/* 1. Header (Navbar) - Clean Light Style with Large Text-Only Logo */}
      <header className="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-3.5 z-50 py-3.5 px-6 sm:px-8 max-w-5xl w-full mx-auto rounded-b-xl shadow-sm">
        <div className="flex items-center justify-between gap-4">
          
          {/* Text-Only Logo - Enlarged and clean as requested */}
          <div className="flex items-center flex-shrink-0">
            <svg className="h-11 w-auto text-zinc-955" viewBox="0 0 250 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Bold Italic Typography */}
              <text x="2" y="32" fill="#09090B" fontSize="33" fontWeight="950" fontStyle="italic" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.03em">
                JIU<tspan fill="#DC2626">PRO</tspan>
              </text>
              
              {/* Spaced Subtitle */}
              <text x="4" y="49" fill="#71717A" fontSize="8" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.27em">
                PLATAFORMA PARA ACADEMIAS
              </text>
            </svg>
          </div>
          
          <div className="flex items-center gap-7">
            <a href="#precos" className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-wider">Planos</a>
            <a href="#simulador" className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-wider">Demonstrações</a>
            <button
              onClick={() => router.push('/login')}
              className="text-[11px] font-bold text-white bg-zinc-950 hover:bg-zinc-850 px-4.5 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider"
            >
              Acessar Painel
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1">
        
        {/* Payment Notifications */}
        {paymentStatus === 'success_payment' && (
          <div className="max-w-4xl mx-auto mt-6 px-6">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center text-xs font-bold text-emerald-800">
              Assinatura confirmada com sucesso! Clique em "Acessar Painel" para entrar na sua nova unidade administrativa.
            </div>
          </div>
        )}
        {paymentStatus === 'cancel_payment' && (
          <div className="max-w-4xl mx-auto mt-6 px-6">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-xs font-bold text-red-800">
              O pagamento foi cancelado ou interrompido. Você pode tentar novamente preenchendo o formulário abaixo.
            </div>
          </div>
        )}

        {/* Hero Section - Clean Light & High Contrast */}
        <section className="py-24 px-6 sm:px-8 text-center space-y-8 relative overflow-hidden bg-white border-b border-zinc-200">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 tracking-tight leading-[1.05]">
              A excelência na gestão <br />
              <span className="relative inline-block">
                da sua academia
                <span className="absolute bottom-1 left-0 w-full h-2 bg-red-600/10 -z-10" />
              </span>
            </h1>
            
            <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-500 leading-relaxed font-light">
              Monitore mensalidades, organize a frequência de treinos, automatize cobranças e gerencie a evolução técnica de faixas e graus em um painel administrativo limpo e ágil.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#assinar"
                className="w-full sm:w-auto text-center px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-850 rounded shadow-md transition-all"
              >
                Criar Unidade Administrativa
              </a>
              <a
                href="#simulador"
                className="w-full sm:w-auto text-center px-7 py-3 text-xs font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded transition-all border border-zinc-200/50"
              >
                Visualizar Demonstrações
              </a>
            </div>
          </div>
        </section>

        {/* Recursos Principais - Design de Tabela Premium */}
        <section className="py-20 px-6 sm:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2.5 border-l-2 border-zinc-900 pl-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Cobranças PIX</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Notificação de vencimentos diretamente no WhatsApp com textos parametrizados e chaves de pagamento automáticas.
              </p>
            </div>
            
            <div className="space-y-2.5 border-l-2 border-red-600 pl-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Controle de Presença</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Agendamento de check-ins pelos atletas e validação/fechamento das aulas em tempo real pelo professor.
              </p>
            </div>

            <div className="space-y-2.5 border-l-2 border-zinc-900 pl-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Evolução Técnica</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Controle automático de graduações de faixas e graus baseados na assiduidade e no tempo mínimo de carência de treino.
              </p>
            </div>

            <div className="space-y-2.5 border-l-2 border-red-600 pl-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Retenção de Alunos</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Relatórios automáticos que listam atletas sumidos do tatame para facilitar ações preventivas de evasão.
              </p>
            </div>
          </div>
        </section>

        {/* Separator mimicking the black belt design with centered, equal-sized white stripes. FIXED bg-zinc-950 color */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8 my-8">
          <div className="h-4 bg-zinc-950 rounded overflow-hidden flex justify-end">
            <div className="w-28 h-full bg-red-600 flex items-center justify-center gap-1.5 px-2 border-l border-r border-white/20">
              <div className="w-[4.5px] h-full bg-white" />
              <div className="w-[4.5px] h-full bg-white" />
              <div className="w-[4.5px] h-full bg-white" />
              <div className="w-[4.5px] h-full bg-white" />
            </div>
          </div>
        </div>

        {/* 4. Simulador Sandbox (Demonstrações) */}
        <section id="simulador" className="py-20 px-6 sm:px-8 scroll-mt-20">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 uppercase tracking-widest text-xs">Unidades de Demonstração</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-light">
                Experimente o painel de controle administrativo em modo de leitura protegida.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {academias.map((ac) => {
                const statusColor = ac.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                const planBorder = ac.plan === 'BlackBelt' ? 'border-t-zinc-900' : ac.plan === 'Ouro' ? 'border-t-red-600' : 'border-t-zinc-300'
                return (
                  <div key={ac.id} className={`bg-white rounded-xl border border-zinc-200 border-t-4 ${planBorder} shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-zinc-300 transition-all`}>
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${statusColor}`}>
                          {ac.status}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded uppercase tracking-wider">
                          Plano {ac.plan}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-sm text-zinc-900 tracking-tight">{ac.name}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-light">
                        Responsável: <span className="font-semibold text-zinc-800">{ac.ownerName}</span> <br />
                        E-mail: <span className="font-mono text-[10px] text-zinc-400">{ac.ownerEmail}</span>
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleQuickLogin(ac.id)}
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded bg-zinc-950 hover:bg-zinc-850 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Acessar Unidade</span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. Cadastro & Checkout */}
        <section id="assinar" className="py-20 px-6 sm:px-8 max-w-5xl mx-auto space-y-12 scroll-mt-20">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 uppercase tracking-widest text-xs">Ativação Comercial</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-light">
              Escolha seu plano, preencha o formulário e siga para o checkout seguro de faturamento.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
            
            {/* Form de Cadastro */}
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4 border-r border-zinc-200">
              <h3 className="font-bold text-[10px] text-zinc-900 border-b border-zinc-100 pb-2 uppercase tracking-wider">Cadastro de Unidade</h3>
              
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Nome da Academia</label>
                <input 
                  type="text" 
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  required
                  placeholder="Ex: Alliance Pinheiros" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Professor Responsável</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  placeholder="Ex: Gabriel Ramos" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">E-mail de Acesso</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contato@minhaacademia.com" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Defina uma Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Plano Pretendido</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-zinc-800 text-zinc-700 transition-colors cursor-pointer"
                >
                  <option value="Prata">Plano Prata — R$ 99/mês</option>
                  <option value="Ouro">Plano Ouro — R$ 199/mês</option>
                  <option value="BlackBelt">Plano BlackBelt — R$ 349/mês</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-3 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-900 rounded shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <span>Prosseguir para Pagamento</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Resumo de Planos e Vantagens */}
            <div id="precos" className="bg-zinc-50/50 p-6 sm:p-8 flex flex-col justify-between text-zinc-700 border-l border-zinc-200 space-y-6">
              <div className="space-y-4">
                <h3 className="font-extrabold text-[9px] uppercase tracking-widest text-zinc-900 border-b border-zinc-200 pb-2">Plano de Assinaturas</h3>
                
                <div className="space-y-4 text-xs font-light text-zinc-500">
                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                    <span className="font-semibold text-zinc-900">Plano Prata</span>
                    <span className="font-bold text-zinc-900">R$ 99</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-1 leading-relaxed">Até 50 atletas matriculados, controle completo de presenças e controle de turmas.</p>
                  
                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                    <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                      Plano Ouro (Recomendado)
                    </span>
                    <span className="font-bold text-zinc-900">R$ 199</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-1 leading-relaxed font-light">Até 150 atletas matriculados, lembretes inteligentes de PIX via WhatsApp, exames de faixa e graus.</p>

                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                    <span className="font-semibold text-zinc-900">Plano BlackBelt</span>
                    <span className="font-bold text-zinc-900">R$ 349</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-1 leading-relaxed">Atletas ilimitados, relatórios para exames, loja/cantina com controle de estoque.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-zinc-200 space-y-2 text-zinc-400">
                <h4 className="text-[9px] font-bold text-zinc-900 uppercase tracking-wider">Pagamento Criptografado</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                  Sua transação é assegurada pelo Stripe. Nenhuma informação bancária ou de cartão é armazenada.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-zinc-200 py-8 text-center text-xs text-zinc-400">
        <p>© 2026 JiuPro. Gestão Marcial Integrada. Todos os direitos reservados. Oss!</p>
      </footer>

    </div>
  )
}
