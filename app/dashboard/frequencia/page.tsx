// app/dashboard/frequencia/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, User, ClassSession, CheckIn, Student } from '../../lib/db'
import BeltVisual from '../../components/BeltVisual'

export default function ConfirmacaoFrequenciaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [agendamentos, setAgendamentos] = useState<CheckIn[]>([])
  const [todosAlunos, setTodosAlunos] = useState<Student[]>([])
  const [treinoFiltro, setTreinoFiltro] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Manual search state for kids/other students
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = (academyId: string) => {
    const classList = db.getClasses(academyId)
    setClasses(classList)
    if (classList.length > 0 && !treinoFiltro) {
      setTreinoFiltro(classList[0].horario)
    }

    const checkinList = db.getCheckIns(academyId)
    setAgendamentos(checkinList)

    const studentsList = db.getStudents(academyId)
    setTodosAlunos(studentsList)
    
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
    db.confirmCheckIn(user.academyId, studentId, novoStatus, treinoFiltro)
    
    // Refresh state
    loadData(user.academyId)
  }

  // Realiza a chamada manual direta (para crianças / quem está sem celular)
  const handlePresencaManual = (student: Student) => {
    if (!user) return

    // Financial check
    const hasOverdue = student.financeiro.some(inv => inv.status === 'Atrasado')
    if (hasOverdue) {
      const confirmar = window.confirm(
        `⚠️ ALERTA FINANCEIRO: O aluno ${student.nome} possui faturas em atraso.\n\nDeseja confirmar a presença mesmo assim?`
      )
      if (!confirmar) return
    }

    // Process check-in and confirm attendance
    db.studentCheckIn(user.academyId, student.id, treinoFiltro)
    db.confirmCheckIn(user.academyId, student.id, 'Confirmado', treinoFiltro)
    db.checkAndAwardBadges(student.id)

    // Reload list
    loadData(user.academyId)
  }

  // Remove presença/check-in de um aluno
  const handleDesistirPresenca = (studentId: string) => {
    if (!user) return
    db.studentCancelCheckIn(user.academyId, studentId, treinoFiltro)
    loadData(user.academyId)
  }

  // Filter checkins by currently selected class time
  const agendamentosFiltrados = agendamentos.filter(
    (item) => item.horario === treinoFiltro
  )

  // Filter all students of the gym for the manual call list (excluding inactive ones)
  const alunosFiltradosBusca = todosAlunos
    .filter(a => a.status === 'Ativo')
    .filter(a => 
      a.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.faixa.toLowerCase().includes(searchQuery.toLowerCase())
    )

  // Contadores para o resumo do painel
  const totalAgendados = agendamentosFiltrados.length
  const totalConfirmados = agendamentosFiltrados.filter((a) => a.status === 'Confirmado').length
  const totalPendentes = agendamentosFiltrados.filter((a) => a.status === 'Pendente').length

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-slate-400">Carregando tatame...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Frequência e Chamada de Treino</h1>
          <p className="text-xs text-zinc-500 mt-1">Gerencie a chamada do tatame em tempo real para cada horário e faça chamadas manuais para crianças ou alunos sem celular.</p>
        </div>

        {/* Seleção do treino focado no dia/horário detalhado */}
        {classes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Turma Selecionada:</span>
            <select
              value={treinoFiltro}
              onChange={(e) => {
                setTreinoFiltro(e.target.value)
              }}
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

      {/* Resumo do Tatame */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Check-ins Feitos (App)</span>
          <p className="text-2xl font-black text-zinc-950 mt-1">{totalAgendados} Atletas</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Confirmados no Tatame</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalConfirmados} Presentes</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Aguardando Confirmação</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalPendentes} Pendentes</p>
        </div>
      </div>

      {/* Layout principal: Fila de chamadas vs Chamada Manual (Crianças/Direta) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Fila de Chamadas (Alunos com Celular que agendaram) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800">Fila de Chamada (Agendados via App)</h2>
              <span className="text-[10px] font-bold text-zinc-400">{agendamentosFiltrados.length} agendados</span>
            </div>

            <div className="divide-y divide-zinc-100 min-h-[220px]">
              {agendamentosFiltrados.length > 0 ? (
                agendamentosFiltrados.map((alunoCheckin) => {
                  const fullStudent = todosAlunos.find(st => st.id === alunoCheckin.id)
                  const hasHealthAlert = !!(fullStudent?.alergias || fullStudent?.lesoes)

                  return (
                    <div key={alunoCheckin.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-zinc-50/50">
                      
                      <div className="flex items-center gap-3">
                        <BeltVisual belt={alunoCheckin.faixa} degrees={alunoCheckin.graus} size="xs" showLabel={false} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-zinc-950">{alunoCheckin.nome}</p>
                            {hasHealthAlert && (
                              <span 
                                title={`Alergias: ${fullStudent?.alergias || 'Nenhuma'} • Lesões: ${fullStudent?.lesoes || 'Nenhuma'}`}
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-700 border border-rose-200 animate-pulse cursor-help"
                              >
                                🩺 Alerta Saúde
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                            Faixa {alunoCheckin.faixa} {alunoCheckin.graus > 0 && `• ${alunoCheckin.graus}º Grau`}
                            {hasHealthAlert && (
                              <span className="block text-[9px] text-rose-500 mt-0.5 italic">
                                Lesões: {fullStudent?.lesoes || 'Nenhuma'} • Alergias: {fullStudent?.alergias || 'Nenhuma'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {alunoCheckin.status === 'Pendente' && (
                          <>
                            <button
                              onClick={() => mudarStatus(alunoCheckin.id, 'Faltou')}
                              className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            >
                              Falta
                            </button>
                            <button
                              onClick={() => mudarStatus(alunoCheckin.id, 'Confirmado')}
                              className="px-4 py-1.5 text-[10px] font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                            >
                              Confirmar Presença
                            </button>
                          </>
                        )}

                        {alunoCheckin.status === 'Confirmado' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Presente
                            <button 
                              onClick={() => handleDesistirPresenca(alunoCheckin.id)}
                              className="text-[9px] text-emerald-600 hover:text-rose-600 ml-1 font-bold cursor-pointer"
                              title="Remover presença"
                            >
                              ✕
                            </button>
                          </span>
                        )}

                        {alunoCheckin.status === 'Faltou' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-zinc-100 text-zinc-400 line-through">
                            Falta Registrada
                            <button 
                              onClick={() => handleDesistirPresenca(alunoCheckin.id)}
                              className="text-[9px] text-zinc-400 hover:text-rose-600 ml-1 font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        )}
                      </div>

                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400 font-light flex flex-col items-center justify-center min-h-[220px]">
                  <p>Nenhum check-in agendado pelo aplicativo para este horário.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Use a lista ao lado para fazer a chamada manual diretamente.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Chamada Direta / Lista de Alunos (Manual - Crianças e sem Celular) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4 h-fit">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                📋 Chamada Rápida (Lista de Atletas)
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Dê presença direta para crianças e atletas que não possuem ou não usam celular.</p>
            </div>

            {/* Campo de Busca Rápida */}
            <div>
              <input 
                type="text" 
                placeholder="🔍 Buscar por nome ou graduação..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Lista dos atletas filtrados */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {alunosFiltradosBusca.length > 0 ? (
                alunosFiltradosBusca.map((student) => {
                  const checkinAtivo = agendamentosFiltrados.find(c => c.id === student.id)
                  const isPresent = checkinAtivo?.status === 'Confirmado'

                  return (
                    <div key={student.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{student.nome}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {student.faixa} • {student.grupoFamiliar ? `Família: ${student.grupoFamiliar}` : 'Individual'}
                        </p>
                      </div>

                      <div>
                        {isPresent ? (
                          <button
                            onClick={() => handleDesistirPresenca(student.id)}
                            className="px-2.5 py-1 text-[9px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Clique para remover presença"
                          >
                            ✓ Presente
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePresencaManual(student)}
                            className="px-2.5 py-1 text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                          >
                            Marcar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-[10px] text-center text-slate-400 py-6">Nenhum atleta ativo localizado.</p>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
