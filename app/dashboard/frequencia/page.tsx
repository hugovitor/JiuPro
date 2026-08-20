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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Validação de Presenças</h1>
          <p className="text-xs text-zinc-500 mt-1">Confirme e valide a presença dos atletas no tatame em tempo real.</p>
        </div>

        {/* Seleção do treino focado no dia/horário detalhado */}
        {classes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Classe Ativa:</span>
            <select
              value={treinoFiltro}
              onChange={(e) => setTreinoFiltro(e.target.value)}
              className="text-xs font-bold bg-transparent border-none focus:outline-none cursor-pointer text-zinc-900"
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
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total de Check-ins</span>
          <p className="text-2xl font-black text-zinc-950 mt-1">{totalAgendados} Atletas</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Confirmados no Tatame</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalConfirmados} Presentes</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Aguardando Validação</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalPendentes} Pendentes</p>
        </div>
      </div>

      {/* Lista de Validação */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800">Atletas que deram Check-in</h2>
          <span className="text-[10px] font-bold text-zinc-400">{agendamentosFiltrados.length} no treino selecionado</span>
        </div>

        <div className="divide-y divide-zinc-100 min-h-[150px]">
          {agendamentosFiltrados.length > 0 ? (
            agendamentosFiltrados.map((aluno) => (
              <div key={aluno.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-zinc-50/50">
                
                {/* Informações do Aluno */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">
                    {aluno.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">{aluno.nome}</p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      Faixa {aluno.faixa} {aluno.graus > 0 && `• ${aluno.graus}º Grau`}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação Baseados no Status */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {aluno.status === 'Pendente' && (
                    <>
                      <button
                        onClick={() => mudarStatus(aluno.id, 'Faltou')}
                        className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      >
                        Marcar Falta
                      </button>
                      <button
                        onClick={() => mudarStatus(aluno.id, 'Confirmado')}
                        className="px-4 py-1.5 text-[10px] font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                      >
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Validar Presença
                      </button>
                    </>
                  )}

                  {aluno.status === 'Confirmado' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Presença Validada
                    </span>
                  )}

                  {aluno.status === 'Faltou' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold bg-zinc-100 text-zinc-400 line-through">
                      Falta Registrada
                    </span>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-zinc-400 font-light">
              Nenhum check-in registrado para o horário selecionado nesta unidade.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
