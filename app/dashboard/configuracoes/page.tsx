// app/dashboard/configuracoes/page.tsx
'use client'

import { useState } from 'react'

// Interfaces de Tipo
interface ITurma {
  id: string
  horario: string
  nome: string
  dias: string
}

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Estado Financeiro da Academia
  const [mensalidadePadrao, setMensalidadePadrao] = useState('150,00')
  const [diaVencimento, setDiaVencimento] = useState('10')

  // Estado das Turmas / Grade de Horários
  const [turmas, setTurmas] = useState<ITurma[]>([
    { id: '1', horario: '07:00', nome: 'Matinal — Todos os Níveis', dias: 'Seg, Qua, Sex' },
    { id: '2', horario: '12:00', nome: 'Meio-dia — Sem Kimono (NoGi)', dias: 'Ter, Qui' },
    { id: '3', horario: '18:30', nome: 'Infantil — Até 12 anos', dias: 'Seg, Qua, Sex' },
    { id: '4', horario: '19:30', nome: 'Avançado — Foco em Competição', dias: 'Ter, Qui' },
    { id: '5', horario: '21:00', nome: 'Iniciantes — Fundamentos', dias: 'Seg, Qua' },
  ])
  // Estados para adicionar uma nova turma
  const [novoHorario, setNovoHorario] = useState('')
  const [novoNomeTurma, setNovoNomeTurma] = useState('')
  const [novosDias, setNovosDias] = useState('Seg, Qua, Sex')

  // Função para adicionar nova turma na lista
  const handleAdicionarTurma = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoHorario || !novoNomeTurma) return

    const nova: ITurma = {
      id: Date.now().toString(),
      horario: novoHorario,
      nome: novoNomeTurma,
      dias: novosDias
    }

    // Ordena as turmas por horário automaticamente
    setTurmas([...turmas, nova].sort((a, b) => a.horario.localeCompare(b.horario)))
    setNovoHorario('')
    setNovoNomeTurma('')
  }

  // Função para remover uma turma da grade
  const handleRemoverTurma = (id: string) => {
    setTurmas(turmas.filter((t) => t.id !== id))
  }

  // Função para salvar as configurações gerais
  const handleSalvarConfiguracoes = () => {
    setIsLoading(true)
    
    const dadosConfig = {
      mensalidadePadrao,
      diaVencimento,
      gradeTurmas: turmas
    }

    console.log('Salvando configurações do JiuPro:', dadosConfig)

    setTimeout(() => {
      setIsLoading(false)
      alert('Configurações da academia salvas com sucesso!')
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Configurações da Academia</h1>
          <p className="text-sm text-zinc-500">Gerencie os valores de planos, mensalidades e a grade horária de treinos.</p>
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

            <div className="divide-y divide-zinc-100">
              {turmas.map((turma) => (
                <div key={turma.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                      {turma.horario}h
                    </span>
                    <span className="font-medium text-zinc-700">{turma.nome}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoverTurma(turma.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-2.5 py-1 rounded transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))}
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
              <div className="sm:col-span-1">
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

        </div>

      </div>

    </div>
  )
}
