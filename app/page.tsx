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
    <div className="min-h-screen bg-white font-sans antialiased text-zinc-650 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* 1. Header (Navbar) - Minimalist & Clean */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-150 sticky top-0 z-50 py-4.5 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-zinc-950 rounded flex items-center justify-center border-r-2 border-red-600 shadow-sm">
              <span className="text-white font-black text-xs italic tracking-tighter">JP</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-950">
              JiuPro
            </span>
          </div>
          
          <div className="flex items-center gap-7">
            <a href="#precos" className="text-[11px] font-medium text-zinc-400 hover:text-zinc-900 transition-colors">Planos</a>
            <a href="#simulador" className="text-[11px] font-medium text-zinc-400 hover:text-zinc-900 transition-colors">Demonstrações</a>
            <button
              onClick={() => router.push('/login')}
              className="text-[11px] font-bold text-zinc-900 border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-1.5 rounded transition-all shadow-sm cursor-pointer"
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
          <div className="max-w-3xl mx-auto mt-6 px-6">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded text-center text-xs font-semibold text-emerald-800">
              Assinatura confirmada. Clique em "Acessar Painel" para entrar.
            </div>
          </div>
        )}
        {paymentStatus === 'cancel_payment' && (
          <div className="max-w-3xl mx-auto mt-6 px-6">
            <div className="bg-red-50 border border-red-150 p-3 rounded text-center text-xs font-semibold text-red-800">
              O pagamento foi cancelado ou interrompido. Você pode tentar novamente preenchendo o formulário abaixo.
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="py-24 px-6 sm:px-8 text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4.5xl font-black text-zinc-950 tracking-tight leading-none">
            Gestão moderna para academias de Jiu-Jitsu.
          </h1>
          <p className="max-w-lg mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Monitore mensalidades, controle presenças no tatame, automatize cobranças e acompanhe a evolução de faixas e graus de forma integrada.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#assinar"
              className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-all shadow-sm"
            >
              Criar Conta Comercial
            </a>
            <a
              href="#simulador"
              className="w-full sm:w-auto text-center px-5 py-2.5 text-xs font-semibold text-zinc-500 bg-zinc-50 hover:bg-zinc-100 rounded transition-all border border-zinc-200/60"
            >
              Visualizar Demonstrações
            </a>
          </div>
        </section>

        {/* Recursos Principais */}
        <section className="py-12 px-6 sm:px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-zinc-100">
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs text-zinc-900 tracking-tight">Faturamento</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Envie lembretes de mensalidade parametrizados via WhatsApp com chaves PIX de forma rápida.
            </p>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs text-zinc-900 tracking-tight">Frequência</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Agendamentos de presença efetuados pelos alunos com confirmação e fechamento de aula pelo mestre.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-xs text-zinc-900 tracking-tight">Evolução Técnica</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Controle histórico de faixas e graus alimentados automaticamente pela assiduidade no tatame.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-xs text-zinc-900 tracking-tight">Retenção</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Alertas automáticos que mapeiam alunos ausentes para evitar cancelamento de planos.
            </p>
          </div>
        </section>

        {/* Demonstrações Sandbox */}
        <section id="simulador" className="py-16 px-6 sm:px-8 bg-zinc-50/50 border-y border-zinc-150/60 scroll-mt-16">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-zinc-950">Contas de Demonstração</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-light">
                Visualize a interface administrativa da plataforma em modo de leitura protegida.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {academias.map((ac) => {
                const statusColor = ac.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                return (
                  <div key={ac.id} className="bg-white rounded-lg border border-zinc-200 p-5 flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-all shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${statusColor}`}>
                          {ac.status}
                        </span>
                        <span className="text-[9px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                          Plano {ac.plan}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-sm text-zinc-950 tracking-tight">{ac.name}</h3>
                      <p className="text-xs text-zinc-450 leading-relaxed font-light">
                        Mestre: <span className="font-medium text-zinc-700">{ac.ownerName}</span> <br />
                        E-mail: <span className="font-mono text-[10px] text-zinc-400">{ac.ownerEmail}</span>
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => handleQuickLogin(ac.id)}
                        className="w-full py-2 text-xs font-bold rounded bg-zinc-950 hover:bg-zinc-850 text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Acessar Demonstração</span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

        {/* Cadastro & Contratação */}
        <section id="assinar" className="py-20 px-6 sm:px-8 max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">Ativação de Unidade</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-light">
              Preencha os dados cadastrais da sua filial e avance para o pagamento seguro.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-sm">
            
            {/* Form de Cadastro */}
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4 border-r border-zinc-150">
              <h3 className="font-bold text-[10px] text-zinc-950 border-b border-zinc-100 pb-2 uppercase tracking-wider">Nova Filial</h3>
              
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450">Nome da Academia</label>
                <input 
                  type="text" 
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  required
                  placeholder="Ex: Gracie Barra Pinheiros" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-450">Professor Responsável</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  placeholder="Ex: Gabriel Ramos" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-455">E-mail Administrativo</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contato@minhaacademia.com" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-455">Defina uma Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full px-3 py-2 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-455">Plano Contratual</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full px-3 py-2 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-red-500 text-zinc-700 transition-colors cursor-pointer"
                >
                  <option value="Prata">Plano Prata — R$ 99/mês</option>
                  <option value="Ouro">Plano Ouro — R$ 199/mês</option>
                  <option value="BlackBelt">Plano BlackBelt — R$ 349/mês</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-2 py-3 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded shadow transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isRegistering ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <span>Prosseguir para Pagamento</span>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Resumo de Planos e Vantagens */}
            <div id="precos" className="bg-zinc-50/50 p-6 sm:p-8 flex flex-col justify-between text-zinc-700 border-l border-zinc-150 space-y-6">
              <div className="space-y-4">
                <h3 className="font-extrabold text-[9px] uppercase tracking-widest text-zinc-950 border-b border-zinc-200 pb-2">Valores Mensais</h3>
                
                <div className="space-y-4 text-xs font-light text-zinc-500">
                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                    <span className="font-medium text-zinc-900">Plano Prata</span>
                    <span className="font-bold text-zinc-900">R$ 99</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-1 leading-relaxed">Até 50 atletas matriculados, gestão de presenças e controle de turmas.</p>
                  
                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                    <span className="font-medium text-zinc-900 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      Plano Ouro (Recomendado)
                    </span>
                    <span className="font-bold text-zinc-900">R$ 199</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-1 leading-relaxed font-light">Até 150 atletas matriculados, lembretes de WhatsApp, exames de faixa e graus.</p>

                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                    <span className="font-medium text-zinc-900">Plano BlackBelt</span>
                    <span className="font-bold text-zinc-900">R$ 349</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-1 leading-relaxed">Atletas ilimitados, relatórios para exames, loja/cantina e suporte prioritário.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-zinc-200 space-y-1.5 text-zinc-450">
                <h4 className="text-[9px] font-bold text-zinc-900 uppercase tracking-wider">Pagamento Criptografado</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                  Processamento seguro via infraestrutura do Stripe. Dados de cobrança protegidos.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-zinc-150 py-8 text-center text-xs text-zinc-400">
        <p>© 2026 JiuPro. Gestão Marcial Integrada. Todos os direitos reservados. Oss!</p>
      </footer>

    </div>
  )
}
