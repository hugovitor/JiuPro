// app/dashboard/configuracoes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, User, Academy, ClassSession } from '../../lib/db'

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [turmas, setTurmas] = useState<ClassSession[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Estado Financeiro da Academia
  const [mensalidadePadrao, setMensalidadePadrao] = useState('150,00')
  const [diaVencimento, setDiaVencimento] = useState('10')
  const [whatsappTemplate, setWhatsappTemplate] = useState('')

  // Estados para adicionar uma nova turma
  const [novoHorario, setNovoHorario] = useState('')
  const [novoNomeTurma, setNovoNomeTurma] = useState('')
  const [novosDias, setNovosDias] = useState('Seg, Qua, Sex')

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
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      loadData(loggedUser.academyId)
    } else {
      setIsPageLoading(false)
    }
  }, [])

  // Função para adicionar nova turma na lista
  const handleAdicionarTurma = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !novoHorario || !novoNomeTurma) return

    const novaTurma = {
      horario: novoHorario,
      nome: novoNomeTurma,
      dias: novosDias
    }

    db.saveClass(user.academyId, novaTurma)
    
    // Refresh turmas list and sort by time
    const updatedClasses = db.getClasses(user.academyId)
    setTurmas(updatedClasses.sort((a, b) => a.horario.localeCompare(b.horario)))

    setNovoHorario('')
    setNovoNomeTurma('')
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
        
        {/* Coluna da Esquerda: Configurações Financeiras */}
        <div className="space-y-6 md:col-span-1">
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
                    linkCopiado ? 'bg-emerald-650 hover:bg-emerald-755' : 'bg-zinc-950 hover:bg-zinc-850'
                  }`}
                >
                  {linkCopiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
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
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <h3 className="font-semibold text-zinc-900 text-sm mb-4">Adicionar Novo Horário de Treino</h3>
            <form onSubmit={handleAdicionarTurma} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Nome da Classe / Turma
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treino de Competição"
                  value={novoNomeTurma}
                  onChange={(e) => setNovoNomeTurma(e.target.value)}
                  className="w-full px-3 py-1.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition-colors h-[38px]"
              >
                + Adicionar Classe
              </button>
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
                    <option value="Informativo">📢 Informativo</option>
                    <option value="Alerta">🚨 Alerta Urgente</option>
                    <option value="Evento">🎓 Evento / Seminário</option>
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
