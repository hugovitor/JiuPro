// app/dashboard/frequencia/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, User, ClassSession, CheckIn } from '../../lib/db'

export default function ConfirmacaoFrequenciaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [agendamentos, setAgendamentos] = useState<CheckIn[]>([])
  const [treinoFiltro, setTreinoFiltro] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = (academyId: string) => {
    const classList = db.getClasses(academyId)
    setClasses(classList)
    if (classList.length > 0 && !treinoFiltro) {
      setTreinoFiltro(classList[0].horario)
    }

    const checkinList = db.getCheckIns(academyId)
    setAgendamentos(checkinList)
    setIsLoading(false)
  }

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      loadData(loggedUser.academyId)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Altera o status do check-in do aluno
  const mudarStatus = (studentId: string, novoStatus: 'Confirmado' | 'Faltou') => {
    if (!user) return
    db.confirmCheckIn(user.academyId, studentId, novoStatus)
    
    // Refresh state
    setAgendamentos(
      agendamentos.map((item) =>
        item.id === studentId ? { ...item, status: novoStatus } : item
      )
    )
  }

  // Filter checkins by currently selected class time
  const agendamentosFiltrados = agendamentos.filter(
    (item) => item.horario === treinoFiltro
  )

  // Contadores para o resumo do painel
  const totalAgendados = agendamentosFiltrados.length
  const totalConfirmados = agendamentosFiltrados.filter((a) => a.status === 'Confirmado').length
  const totalPendentes = agendamentosFiltrados.filter((a) => a.status === 'Pendente').length

  if (isLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando tatame...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Validar Presenças</h1>
          <p className="text-sm text-slate-500">Confirme os check-ins realizados pelos alunos antes de fechar a classe.</p>
        </div>

        {/* Seleção do treino focado no dia/horário detalhado */}
        {classes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Classe ativa:</span>
            <select
              value={treinoFiltro}
              onChange={(e) => setTreinoFiltro(e.target.value)}
              className="text-xs font-semibold bg-transparent border-none focus:outline-none cursor-pointer text-slate-800"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.horario}>
                  {cls.dias} — {cls.horario}h ({cls.nome})
                </option>
              ))}
            </select>
          </div>
        )}
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
        <div className="divide-y divide-slate-100 min-h-[150px]">
          {agendamentosFiltrados.length > 0 ? (
            agendamentosFiltrados.map((aluno) => (
              <div key={aluno.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/40">
                
                {/* Informações do Aluno */}
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center border border-slate-200 bg-slate-50 text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Presença Confirmada
                    </span>
                  )}

                  {aluno.status === 'Faltou' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-400 line-through">
                      Falta Registrada
                    </span>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum check-in agendado para o horário selecionado nesta unidade.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
