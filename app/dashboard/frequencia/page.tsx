// app/dashboard/frequencia/page.tsx
'use client'

import { useState } from 'react'

interface ICheckInAluno {
  id: string
  nome: string
  faixa: string
  graus: number
  status: 'Pendente' | 'Confirmado' | 'Faltou'
}

export default function ConfirmacaoFrequenciaPage() {
  // Simulação dos alunos que fizeram check-in pelo celular para o treino das 19:30h
  const [agendamentos, setAgendamentos] = useState<ICheckInAluno[]>([
    { id: '1', nome: 'Carlos Silva', faixa: 'Azul', graus: 2, status: 'Pendente' },
    { id: '2', nome: 'Mariana Costa', faixa: 'Roxa', graus: 4, status: 'Pendente' },
    { id: '3', nome: 'Rodrigo Lima', faixa: 'Branca', graus: 1, status: 'Confirmado' },
    { id: '4', nome: 'Felipe Melo', faixa: 'Branca', graus: 0, status: 'Pendente' },
  ])

  const [treinoFiltro, setTreinoFiltro] = useState('19:30')

  // Altera o status do check-in do aluno
  const mudarStatus = (id: string, novoStatus: 'Confirmado' | 'Faltou') => {
    setAgendamentos(
      agendamentos.map((item) =>
        item.id === id ? { ...item, status: novoStatus } : item
      )
    )
  }

  // Contadores para o resumo do painel
  const totalAgendados = agendamentos.length
  const totalConfirmados = agendamentos.filter((a) => a.status === 'Confirmado').length
  const totalPendentes = agendamentos.filter((a) => a.status === 'Pendente').length

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Validar Presenças</h1>
          <p className="text-sm text-slate-500">Confirme os check-ins realizados pelos alunos antes de fechar a classe.</p>
        </div>

        {/* Seleção do treino focado no dia/horário detalhado */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Classe ativa:</span>
          <select
            value={treinoFiltro}
            onChange={(e) => setTreinoFiltro(e.target.value)}
            className="text-xs font-semibold bg-transparent border-none focus:outline-none cursor-pointer text-slate-800"
          >
            <option value="19:30">Seg/Qua/Sex — 19:30h (Avançado)</option>
            <option value="12:00">Ter/Qui — 12:00h (NoGi)</option>
            <option value="21:00">Seg/Qua — 21:00h (Iniciantes)</option>
          </select>
        </div>
      </div>

      {/* Mini Painel de Controle de fluxo no Tatame */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Check-ins Feitos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAgendados} Alunos</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Confirmados no Tatame</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalConfirmados} Atletas</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Aguardando Visto</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{totalPendentes} Restantes</p>
        </div>
      </div>

      {/* Lista de Validação */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {agendamentos.map((aluno) => (
            <div key={aluno.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/40">
              
              {/* Informações do Aluno */}
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full flex items-center justify-center border text-[9px] border-slate-300 bg-slate-100 text-slate-600 font-bold">
                  🥋
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{aluno.nome}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Faixa {aluno.faixa} {aluno.graus > 0 && `• ${aluno.graus}G`}
                  </p>
                </div>
              </div>

              {/* Botões de Ação Baseados no Status */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {aluno.status === 'Pendente' && (
                  <>
                    <button
                      onClick={() => mudarStatus(aluno.id, 'Faltou')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      Faltou
                    </button>
                    <button
                      onClick={() => mudarStatus(aluno.id, 'Confirmado')}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-all"
                    >
                      Confirmar Presença
                    </button>
                  </>
                )}

                {aluno.status === 'Confirmado' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    ✓ Presença Confirmada
                  </span>
                )}

                {aluno.status === 'Faltou' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-400 line-through">
                    Falta Registrada
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
