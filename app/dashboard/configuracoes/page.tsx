// app/dashboard/configuracoes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, User, Academy, ClassSession } from '../../lib/db'
import { supabase } from '../../lib/supabase'

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [turmas, setTurmas] = useState<ClassSession[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isConnectingStripe, setIsConnectingStripe] = useState(false)
  
  // Estado Financeiro da Academia
  const [mensalidadePadrao, setMensalidadePadrao] = useState('150,00')
  const [diaVencimento, setDiaVencimento] = useState('10')
  const [whatsappTemplate, setWhatsappTemplate] = useState('')

  // Estados para adicionar uma nova turma
  const [novoHorario, setNovoHorario] = useState('')
  const [novoNomeTurma, setNovoNomeTurma] = useState('Treino Livre')
  const [customNomeTurma, setCustomNomeTurma] = useState('')
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    Seg: true,
    Ter: false,
    Qua: true,
    Qui: false,
    Sex: true,
    Sáb: false,
    Dom: false
  })

  // Estados para avisos
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [avisoTitulo, setAvisoTitulo] = useState('')
  const [avisoConteudo, setAvisoConteudo] = useState('')
  const [avisoCat, setAvisoCat] = useState<'Informativo' | 'Alerta' | 'Evento'>('Informativo')

  const [linkCopiado, setLinkCopiado] = useState(false)

  const handleCopiarLink = () => {
    if (!user) return
    const url = `${window.location.origin}/aluno/cadastro?academyId=${user.academyId}`
    navigator.clipboard.writeText(url)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2000)
  }

  const handleConectarStripe = async () => {
    if (!user) return
    setIsConnectingStripe(true)
    try {
      const response = await fetch('/api/stripe-connect/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ academyId: user.academyId }),
      })
      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao iniciar integração com a Stripe.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão ao iniciar Stripe Connect.')
    } finally {
      setIsConnectingStripe(false)
    }
  }

  const handleDesconectarStripe = async () => {
    if (!user) return
    if (!confirm("Deseja realmente desconectar esta conta Stripe? Isso impedirá que os alunos paguem por cartão até que você vincule uma nova conta.")) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/academy/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          academyId: user.academyId,
          settings: {
            mensalidadePadrao: academy?.mensalidadePadrao || '150,00',
            diaVencimento: academy?.diaVencimento || '10',
            stripeConnectId: ''
          }
        })
      })

      if (res.ok) {
        db.updateAcademySettings(user.academyId, {
          mensalidadePadrao: academy?.mensalidadePadrao || '150,00',
          diaVencimento: academy?.diaVencimento || '10',
          stripeConnectId: ''
        })
        
        await db.syncWithSupabase(user.academyId)
        loadData(user.academyId)
        alert('Conta Stripe desconectada com sucesso!')
      } else {
        alert('Erro ao desconectar conta Stripe no banco de dados.')
      }
    } catch (err: any) {
      alert(`Erro ao desconectar: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = (academyId: string) => {
    const currentAcademy = db.getAcademy(academyId)
    if (currentAcademy) {
      setAcademy(currentAcademy)
      setMensalidadePadrao(currentAcademy.mensalidadePadrao)
      setDiaVencimento(currentAcademy.diaVencimento)
      setWhatsappTemplate(currentAcademy.whatsappTemplate || '')
    }

    const classList = db.getClasses(academyId)
    setTurmas(classList)

    const announcementsList = db.getAnnouncements(academyId)
    setAnnouncements(announcementsList)
    
    setIsPageLoading(false)
  }

  useEffect(() => {
    // 1. Checar se retornou do Stripe Connect onboarding
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const connectStatus = params.get('connect')
      const accountId = params.get('accountId')
      const acadId = params.get('academyId')
      
      if (connectStatus === 'success' && accountId && acadId) {
        // Atualizar banco de dados via API independente de estar logado no cache local
        fetch('/api/academy/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            academyId: acadId,
            settings: {
              mensalidadePadrao: '150,00',
              diaVencimento: '10',
              stripeConnectId: accountId
            }
          })
        }).then(async (res) => {
          if (res.ok) {
            // Sincronizar cache local se estiver logado
            const loggedUser = db.getLoggedInUser()
            if (loggedUser && loggedUser.academyId === acadId) {
              db.updateAcademySettings(loggedUser.academyId, {
                mensalidadePadrao: db.getAcademy(loggedUser.academyId)?.mensalidadePadrao || '150,00',
                diaVencimento: db.getAcademy(loggedUser.academyId)?.diaVencimento || '10',
                stripeConnectId: accountId
              })
              // Forçar sincronização para recarregar tudo atualizado
              await db.syncWithSupabase(loggedUser.academyId)
            }
            alert('Conta Stripe Connect vinculada com sucesso! Agora você pode receber mensalidades por cartão de crédito.')
            window.history.replaceState({}, document.title, window.location.pathname)
            window.location.reload()
          } else {
            alert('Erro ao salvar vinculação com a Stripe no banco de dados.')
          }
        }).catch(err => {
          console.error(err)
          alert('Erro de conexão ao salvar vinculação.')
        })
        return
      }
    }

    // 2. Fluxo normal de carregamento do painel
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      
      // Sincronizar com o Supabase no início para garantir que o cache local está preenchido
      db.syncWithSupabase(loggedUser.academyId).then(() => {
        loadData(loggedUser.academyId)
      })
    } else {
      setIsPageLoading(false)
    }
  }, [])

  // Função para adicionar nova turma na lista
  const handleAdicionarTurma = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !novoHorario) return

    // Calculate active days
    const activeDays = Object.entries(selectedDays)
      .filter(([_, active]) => active)
      .map(([day]) => day)
      .join(', ')

    if (!activeDays) {
      alert('Por favor, selecione pelo menos um dia da semana para o treino.')
      return
    }

    // Determine the class name
    const finalClassName = novoNomeTurma === 'Outro' ? customNomeTurma.trim() : novoNomeTurma
    if (!finalClassName) {
      alert('Por favor, defina o nome do treino.')
      return
    }

    const novaTurma = {
      horario: novoHorario,
      nome: finalClassName,
      dias: activeDays
    }

    db.saveClass(user.academyId, novaTurma)
    
    // Refresh turmas list and sort by time
    const updatedClasses = db.getClasses(user.academyId)
    setTurmas(updatedClasses.sort((a, b) => a.horario.localeCompare(b.horario)))

    setNovoHorario('')
    setCustomNomeTurma('')
    setNovoNomeTurma('Treino Livre')
  }

  // Função para remover uma turma da grade
  const handleRemoverTurma = (id: string) => {
    if (!user) return
    db.removeClass(user.academyId, id)
    setTurmas(turmas.filter((t) => t.id !== id))
  }

  // Função para adicionar novo aviso
  const handleAdicionarAviso = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !avisoTitulo || !avisoConteudo) return

    db.addAnnouncement(user.academyId, avisoTitulo, avisoConteudo, avisoCat)
    
    // Refresh
    setAnnouncements(db.getAnnouncements(user.academyId))
    setAvisoTitulo('')
    setAvisoConteudo('')
  }

  // Função para remover um aviso
  const handleRemoverAviso = (id: string) => {
    if (!user) return
    db.removeAnnouncement(user.academyId, id)
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  // Função para salvar as configurações gerais
  const handleGerarCodigoIndicacao = async () => {
    if (!user || !academy) return
    setIsLoading(true)
    try {
      const newCode = 'JP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString().slice(-4)
      const { error } = await supabase
        .from('academies')
        .update({ referral_code: newCode })
        .eq('id', user.academyId)
      
      if (error) throw error
      
      await db.syncWithSupabase(user.academyId)
      loadData(user.academyId)
      alert('Código gerado com sucesso!')
    } catch (err: any) {
      alert(`Erro ao gerar código: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSalvarConfiguracoes = () => {
    if (!user) return
    setIsLoading(true)

    db.updateAcademySettings(user.academyId, {
      mensalidadePadrao,
      diaVencimento,
      whatsappTemplate
    })

    setTimeout(() => {
      setIsLoading(false)
      alert('Configurações da academia salvas com sucesso!')
    }, 800)
  }

  if (isPageLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando configurações...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Configurações da Academia</h1>
          <p className="text-sm text-zinc-500">Gerencie os valores de planos, mensalidades e a grade horária de treinos da filial **{academy?.name}**.</p>
        </div>
        <button
          onClick={handleSalvarConfiguracoes}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda: Configurações Financeiras e Indicação */}
        <div className="space-y-6 md:col-span-1">

          {/* Indique e Ganhe */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-emerald-700 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              Indique e Ganhe 1 Mês Grátis
            </h2>
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              Indique uma nova academia. Se ela se cadastrar usando seu código, você ganha **1 mês grátis** no JiuPro!
            </p>
            
            <div className="space-y-3 pt-2">
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Seu Código de Indicação</span>
                <div className="flex items-center gap-2">
                  {academy?.referralCode ? (
                    <span className="font-mono text-sm font-bold bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 select-all w-full text-center">
                      {academy.referralCode}
                    </span>
                  ) : (
                    <button 
                      onClick={handleGerarCodigoIndicacao}
                      disabled={isLoading}
                      className="w-full py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 transition-colors"
                    >
                      {isLoading ? 'Gerando...' : 'Gerar Código Agora'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Meses Grátis Acumulados</span>
                <span className="text-xl font-black text-emerald-600">
                  {academy?.freeMonths || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">
              Plano & Mensalidade
            </h2>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mensalidade Padrão (R$)
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-zinc-400 text-sm">R$</span>
                </div>
                <input
                  type="text"
                  value={mensalidadePadrao}
                  onChange={(e) => setMensalidadePadrao(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Dia de Vencimento Padrão
              </label>
              <select
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                className="w-full px-3 py-2 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors text-zinc-800"
              >
                <option value="05">Dia 05</option>
                <option value="10">Dia 10</option>
                <option value="15">Dia 15</option>
                <option value="20">Dia 20</option>
              </select>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Assinatura Ativa</span>
              <p className="text-xs font-bold text-slate-700 mt-1">Plano JiuPro {academy?.plan}</p>
            </div>
          </div>

          {/* Card: Template WhatsApp (Novo!) */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              Template WhatsApp
            </h2>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Texto de Cobrança PIX
              </label>
              <textarea
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 mt-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-800 font-semibold"
                placeholder="Olá, {aluno}! Mensalidade de {mes}..."
              />
              <p className="text-[9px] text-zinc-400 mt-1 leading-relaxed">
                Variáveis dinâmicas:<br />
                <span className="font-mono text-red-600 font-bold">{`{aluno}`}</span>, <span className="font-mono text-red-600 font-bold">{`{mes}`}</span>, <span className="font-mono text-red-600 font-bold">{`{vencimento}`}</span>, <span className="font-mono text-red-600 font-bold">{`{valor}`}</span>, <span className="font-mono text-red-600 font-bold">{`{chavePix}`}</span>
              </p>
            </div>
          </div>

          {/* Card: Auto-cadastro (Novo!) */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              Auto-Matrícula de Alunos
            </h2>
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                Envie o link abaixo para seus alunos se cadastrarem e se vincularem a esta filial de forma automática.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={user ? `${window.location.origin}/aluno/cadastro?academyId=${user.academyId}` : ''}
                  className="flex-1 px-2.5 py-2 text-[10px] bg-slate-50 border border-slate-200 rounded-lg text-zinc-500 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopiarLink}
                  className={`px-3 py-2 text-xs font-bold text-white rounded-lg transition-all ${
                    linkCopiado ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-zinc-950 hover:bg-zinc-850'
                  }`}
                >
                  {linkCopiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          {/* Card: Stripe Connect */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              Pagamento via Cartão de Crédito
            </h2>
            <div className="space-y-3.5">
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                Vincule sua academia ao Stripe Connect para habilitar assinaturas mensais recorrentes no cartão de crédito dos seus alunos. A plataforma cobra uma comissão automática de 5% por transação.
              </p>

              {academy?.stripeConnectId ? (
                <div className="space-y-2">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Conta Conectada Ativa</span>
                      <p className="font-mono text-[10px] text-emerald-700 font-bold mt-0.5">{academy.stripeConnectId}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={handleDesconectarStripe}
                    disabled={isLoading}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all cursor-pointer text-center disabled:opacity-50"
                  >
                    Desconectar / Trocar de Conta
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConectarStripe}
                  disabled={isConnectingStripe}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-900 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer animate-none"
                >
                  {isConnectingStripe ? (
                    <span>Carregando Stripe...</span>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Vincular Conta Stripe</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Grade de Horários / Turmas */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Card: Grade Atual */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800">
                Grade de Horários & Turmas
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Estes horários aparecerão na tela de chamada diária.</p>
            </div>

            <div className="divide-y divide-zinc-100 min-h-[100px]">
              {turmas.length > 0 ? (
                turmas.map((turma) => (
                  <div key={turma.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                        {turma.horario}h
                      </span>
                      <div>
                        <span className="font-semibold text-zinc-700 block">{turma.nome}</span>
                        <span className="text-[10px] text-zinc-400">{turma.dias}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverTurma(turma.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-2.5 py-1 rounded transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400">
                  Nenhuma turma criada. Adicione uma classe abaixo!
                </div>
              )}
            </div>
          </div>

          {/* Form Integrado: Adicionar Nova Turma */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-zinc-900 text-sm">Adicionar Novo Horário de Treino</h3>
            
            <form onSubmit={handleAdicionarTurma} className="space-y-4">
              
              {/* Checkboxes de Dias da Semana */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Dias da Semana
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(selectedDays).map((day) => (
                    <label 
                      key={day} 
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all select-none ${
                        selectedDays[day]
                          ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDays[day]}
                        onChange={(e) => setSelectedDays({ ...selectedDays, [day]: e.target.checked })}
                        className="sr-only"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Horário */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={novoHorario}
                    onChange={(e) => setNovoHorario(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>

                {/* Turma / Nome do Treino */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Categoria da Turma
                  </label>
                  <select
                    value={novoNomeTurma}
                    onChange={(e) => setNovoNomeTurma(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors cursor-pointer text-zinc-900"
                  >
                    <option value="Treino Livre">Treino Livre</option>
                    <option value="Treino Iniciante / Fundamental">Treino Iniciante / Fundamental</option>
                    <option value="Jiu-Jitsu Infantil">Jiu-Jitsu Infantil</option>
                    <option value="Jiu-Jitsu Adolescentes / Juvenil">Jiu-Jitsu Adolescentes / Juvenil</option>
                    <option value="Treino Avançado">Treino Avançado</option>
                    <option value="Treino de Competição">Treino de Competição</option>
                    <option value="Outro">Outro (Personalizado)...</option>
                  </select>
                </div>

                {/* Nome personalizado (se selecionado "Outro") */}
                {novoNomeTurma === 'Outro' ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Nome do Treino Personalizado
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Treino NoGi"
                      value={customNomeTurma}
                      onChange={(e) => setCustomNomeTurma(e.target.value)}
                      className="w-full px-3 py-1.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                    />
                  </div>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition-colors h-[38px] cursor-pointer sm:col-start-3"
                >
                  + Adicionar Classe
                </button>
              </div>

            </form>
          </div>

          {/* Card: Mural de Avisos Oficiais */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mt-6">
            <div className="p-5 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800">
                Mural de Avisos Oficiais (Quadro de Avisos)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Estes comunicados aparecerão fixados no topo do painel dos alunos.</p>
            </div>

            <div className="divide-y divide-zinc-100 min-h-[50px]">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors text-sm">
                    <div className="flex items-start gap-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        ann.categoria === 'Alerta' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        ann.categoria === 'Evento' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-zinc-50 text-zinc-600 border-zinc-200'
                      }`}>
                        {ann.categoria}
                      </span>
                      <div>
                        <span className="font-semibold text-zinc-800 block">{ann.titulo}</span>
                        <span className="text-xs text-zinc-500 block mt-0.5">{ann.conteudo}</span>
                        <span className="text-[9px] text-zinc-400 font-mono mt-1 block">{new Date(ann.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverAviso(ann.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-2.5 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400">
                  Nenhum aviso cadastrado. Publique um aviso oficial abaixo!
                </div>
              )}
            </div>
          </div>

          {/* Form: Publicar Novo Aviso */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mt-6">
            <h3 className="font-semibold text-zinc-900 text-sm mb-4">Publicar Novo Aviso Paginado</h3>
            
            <form onSubmit={handleAdicionarAviso} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Título do Aviso</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Seminário de Passagem de Guarda"
                    value={avisoTitulo}
                    onChange={(e) => setAvisoTitulo(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1.5 text-xs bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Categoria</label>
                  <select
                    value={avisoCat}
                    onChange={(e) => setAvisoCat(e.target.value as any)}
                    className="w-full px-3 py-1.5 mt-1.5 text-xs bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 transition-colors text-zinc-800 font-bold"
                  >
                    <option value="Informativo">Informativo</option>
                    <option value="Alerta">Alerta Urgente</option>
                    <option value="Evento">Evento / Seminário</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Mensagem / Conteúdo</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escreva os detalhes do aviso..."
                  value={avisoConteudo}
                  onChange={(e) => setAvisoConteudo(e.target.value)}
                  className="w-full px-3 py-1.5 mt-1.5 text-xs bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 transition-colors font-medium text-zinc-800"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 transition-all shadow-sm cursor-pointer"
              >
                Publicar Comunicado
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  )
}
