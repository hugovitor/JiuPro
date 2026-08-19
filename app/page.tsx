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
        // Redireciona para o checkout seguro do Stripe
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
    <div className="min-h-screen bg-white font-sans antialiased text-zinc-800 flex flex-col justify-between selection:bg-red-650 selection:text-white">
      
      {/* 1. Header (Navbar) - Branco Limpo */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-50 py-4 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center border-r-[4px] border-red-655 shadow-md">
              <span className="text-white font-black text-sm italic tracking-tighter">JP</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              Jiu<span className="text-red-600 font-extrabold">Pro</span>
              <span className="text-[9px] font-bold text-zinc-550 bg-zinc-100 border border-zinc-205 px-2.5 py-0.5 rounded-full">Plataforma</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#precos" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Planos</a>
            <a href="#simulador" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Demonstrações</a>
            <a
              href="#simulador"
              className="text-xs font-bold text-zinc-900 border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Acessar Painel
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1">
        
        {/* Payment Notifications */}
        {paymentStatus === 'success_payment' && (
          <div className="max-w-4xl mx-auto mt-6 px-6">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
              🎉 Assinatura confirmada com sucesso via Stripe! Clique em "Acessar Painel" para entrar na sua nova unidade administrativa.
            </div>
          </div>
        )}
        {paymentStatus === 'cancel_payment' && (
          <div className="max-w-4xl mx-auto mt-6 px-6">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-xs font-bold text-red-800">
              ⚠️ O pagamento foi cancelado ou interrompido. Você pode tentar novamente preenchendo o formulário abaixo.
            </div>
          </div>
        )}

        {/* Hero Section - Fundo Claro com Destaques */}
        <section className="py-24 px-6 sm:px-8 text-center space-y-8 relative overflow-hidden bg-white border-b border-zinc-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.02)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-655 border border-red-200/50">
              🥋 Nova Versão 2.0 Pronta para Produção
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 tracking-tight leading-[1.05]">
              Gestão Profissional para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600">Academias de Jiu-Jitsu</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-500 leading-relaxed font-light">
              Monitore mensalidades, controle graduações, automatize cobranças do PIX por WhatsApp e acompanhe a evolução de faixas e presenças dos seus alunos de forma isolada por filial.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#assinar"
                className="w-full sm:w-auto text-center px-7 py-3.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/10 transition-all"
              >
                Criar Minha Academia (Real)
              </a>
              <a
                href="#simulador"
                className="w-full sm:w-auto text-center px-7 py-3.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
              >
                Acessar Demonstrações
              </a>
            </div>
          </div>
        </section>

        {/* Recursos Principais - Fundo Branco e Cards Cinzas */}
        <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4 hover:border-zinc-300 transition-all group">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879-.659c1.546-1.16 4.697-1.16 6.243 0zM12 6V4m0 16v-2m-3-2.818.879-.659c1.546-1.16 4.697-1.16 6.243 0zM15 8.25c-1.546-1.16-4.697-1.16-6.243 0l-.879.66" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-zinc-950">Mensalidades & PIX</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Notifique cobranças inteligentes via WhatsApp integradas com chave PIX e texto parametrizado de forma dinâmica.
            </p>
          </div>
          
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4 hover:border-zinc-300 transition-all group">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-zinc-950">Chamada Inteligente</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Agendamentos de presença facilitados para os alunos no aplicativo com controle e fechamento da classe direto no painel do mestre.
            </p>
          </div>

          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4 hover:border-zinc-300 transition-all group">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0 0 12 18.75h9m-9-9.75h9M3 9.75h6.75M3 14.25h6.75M9.75 9.75v4.5m0-4.5H12a3 3 0 0 1 3 3v2.25H9.75v-5.25Z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-zinc-950">Progressão Técnica</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Controle automatizado de graus e faixas alimentado pela frequência diária no tatame com medalhas e conquistas.
            </p>
          </div>

          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4 hover:border-zinc-300 transition-all group">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-zinc-950">Relatórios & Churn</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Identifique imediatamente alunos ausentes e sumidos e evite a perda de receita recorrente na sua academia.
            </p>
          </div>
        </section>

        {/* 4. Simulador - Sandbox de Demonstração (Fundo Claro) */}
        <section id="simulador" className="py-20 px-6 sm:px-8 bg-zinc-50 border-y border-zinc-200/80 scroll-mt-16">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Contas de Demonstração</h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-light">
                Acesse o ambiente sandbox para visualizar a plataforma. Estas contas rodam em **Modo Demo (Leitura Protegida)**. Para testar gravação e gerenciar dados reais, crie sua filial no formulário abaixo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {academias.map((ac) => {
                const statusColor = ac.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                return (
                  <div key={ac.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-zinc-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${statusColor}`}>
                          {ac.status}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                          Plano {ac.plan}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-base text-zinc-950 tracking-tight">{ac.name}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-light">
                        Mestre: <span className="font-semibold text-zinc-800">{ac.ownerName}</span> <br />
                        E-mail: <span className="font-mono text-[10px] text-zinc-450">{ac.ownerEmail}</span>
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleQuickLogin(ac.id)}
                        className="w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-zinc-950 text-white hover:bg-zinc-850 cursor-pointer"
                      >
                        <span>Simular Login</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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
        <section id="assinar" className="py-20 px-6 sm:px-8 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Contratação Segura</h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-light">
              Preencha os dados da sua filial e siga para a página de pagamento criptografada do Stripe para ativar sua conta na produção.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            
            {/* Form de Cadastro */}
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4 border-r border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">Cadastrar Nova Filial</h3>
              
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Nome da Academia / Filial</label>
                <input 
                  type="text" 
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  required
                  placeholder="Ex: Gracie Barra Pinheiros" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Nome do Professor Responsável</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  placeholder="Ex: Prof. Gabriel Ramos" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">E-mail de Acesso Administrativo</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contato@minhaacademia.com" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Defina uma Senha Administrativa</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-red-500 text-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Plano Selecionado</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 mt-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-red-500 text-zinc-700 transition-colors cursor-pointer"
                >
                  <option value="Prata">Plano Prata — R$ 99/mês</option>
                  <option value="Ouro">Plano Ouro — R$ 199/mês</option>
                  <option value="BlackBelt">Plano BlackBelt — R$ 349/mês</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-3 py-3.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <span>Ir para Pagamento Seguro</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879-.659c1.546-1.16 4.697-1.16 6.243 0z" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Resumo de Planos e Vantagens - Fundo Branco e Borda */}
            <div id="precos" className="bg-zinc-50 p-8 flex flex-col justify-between text-zinc-800 border-l border-zinc-200/80 space-y-6">
              <div className="space-y-5">
                <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-red-600 border-b border-zinc-200 pb-2.5">Benefícios Disponíveis</h3>
                
                <div className="space-y-4 text-xs font-light text-zinc-650">
                  <div className="flex justify-between border-b border-zinc-200 pb-2.5 items-center">
                    <span className="font-semibold text-zinc-900">Plano Prata</span>
                    <span className="font-bold text-zinc-950">R$ 99/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 pl-2 leading-relaxed">Até 50 atletas matriculados, controle completo de presenças e controle de aulas agendadas.</p>
                  
                  <div className="flex justify-between border-b border-zinc-200 pb-2.5 items-center">
                    <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-550 rounded-full" />
                      Plano Ouro (Recomendado)
                    </span>
                    <span className="font-bold text-zinc-950">R$ 199/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 pl-2 leading-relaxed font-light">Até 150 atletas matriculados, lembretes inteligentes de PIX via WhatsApp, controle avançado de graus, exames de faixa e diários de treino.</p>

                  <div className="flex justify-between border-b border-zinc-200 pb-2.5 items-center">
                    <span className="font-semibold text-zinc-900">Plano BlackBelt</span>
                    <span className="font-bold text-zinc-950">R$ 349/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 pl-2 leading-relaxed">Alunos ilimitados, unificação de filiais, exportação A4 de relatórios para exames, loja/cantina com controle de estoque e suporte 24h.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-2 text-zinc-500">
                <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                  🛡️ Pagamento Criptografado
                </h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
                  Sua transação é assegurada pelo Stripe. Nenhuma informação de pagamento ou cartão de crédito é armazenada.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 JiuPro. Gestão Marcial e Comercial Integrada. Todos os direitos reservados. Oss!</p>
      </footer>

    </div>
  )
}
