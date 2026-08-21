// app/dashboard/frequencia/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, User, ClassSession, CheckIn, Student } from '../../lib/db'
import BeltVisual from '../../components/BeltVisual'

interface ScanResult {
  studentName: string
  studentId: string
  belt: string
  degrees: number
  hasOverdue: boolean
  alergias: string
  lesoes: string
  status: 'Liberado' | 'Bloqueado'
}

export default function ConfirmacaoFrequenciaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [agendamentos, setAgendamentos] = useState<CheckIn[]>([])
  const [todosAlunos, setTodosAlunos] = useState<Student[]>([])
  const [treinoFiltro, setTreinoFiltro] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // QR simulation states
  const [selectedStudentForQr, setSelectedStudentForQr] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

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
    db.confirmCheckIn(user.academyId, studentId, novoStatus)
    
    // Refresh state
    setAgendamentos(
      agendamentos.map((item) =>
        item.id === studentId ? { ...item, status: novoStatus } : item
      )
    )
    
    // Reload student list to catch any badge award changes
    const studentsList = db.getStudents(user.academyId)
    setTodosAlunos(studentsList)
  }

  const handleSimulateQrScan = () => {
    if (!selectedStudentForQr || !user) return
    
    const student = todosAlunos.find(a => a.id === selectedStudentForQr)
    if (!student) return

    // Check financial status (has any overdue invoice)
    const hasOverdue = student.financeiro.some(inv => inv.status === 'Atrasado')

    setScanResult({
      studentName: student.nome,
      studentId: student.id,
      belt: student.faixa,
      degrees: student.graus,
      hasOverdue,
      alergias: student.alergias || '',
      lesoes: student.lesoes || '',
      status: hasOverdue ? 'Bloqueado' : 'Liberado'
    })

    if (!hasOverdue) {
      // Auto check-in and confirm attendance
      db.studentCheckIn(user.academyId, student.id, treinoFiltro)
      db.confirmCheckIn(user.academyId, student.id, 'Confirmado')
      db.checkAndAwardBadges(student.id)
      
      // Reload lists
      loadData(user.academyId)
    }
    
    setSelectedStudentForQr('')
  }

  const handleForceCheckIn = (studentId: string) => {
    if (!user) return
    db.studentCheckIn(user.academyId, studentId, treinoFiltro)
    db.confirmCheckIn(user.academyId, studentId, 'Confirmado')
    db.checkAndAwardBadges(studentId)
    
    setScanResult(prev => prev ? { ...prev, status: 'Liberado' } : null)
    loadData(user.academyId)
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Validação de Presenças & Recepção</h1>
          <p className="text-xs text-zinc-500 mt-1">Confirme e valide a presença dos atletas no tatame em tempo real ou simule leituras de QR Code.</p>
        </div>

        {/* Seleção do treino focado no dia/horário detalhado */}
        {classes.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Classe Ativa:</span>
            <select
              value={treinoFiltro}
              onChange={(e) => {
                setTreinoFiltro(e.target.value)
                setScanResult(null)
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

      {/* Layout principal: Fila de chamadas vs Scanner Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Fila de Chamadas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800">Atletas que deram Check-in</h2>
              <span className="text-[10px] font-bold text-zinc-400">{agendamentosFiltrados.length} no treino selecionado</span>
            </div>

            <div className="divide-y divide-zinc-100 min-h-[220px]">
              {agendamentosFiltrados.length > 0 ? (
                agendamentosFiltrados.map((alunoCheckin) => {
                  // Get full student object to read medical status
                  const fullStudent = todosAlunos.find(st => st.id === alunoCheckin.id)
                  const hasHealthAlert = !!(fullStudent?.alergias || fullStudent?.lesoes)

                  return (
                    <div key={alunoCheckin.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-zinc-50/50">
                      
                      {/* Informações do Aluno com Alertas Médicos */}
                      <div className="flex items-center gap-3">
                        <BeltVisual beltName={alunoCheckin.faixa} degrees={alunoCheckin.graus} size="xs" />
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

                      {/* Botões de Ação Baseados no Status */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {alunoCheckin.status === 'Pendente' && (
                          <>
                            <button
                              onClick={() => mudarStatus(alunoCheckin.id, 'Faltou')}
                              className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            >
                              Marcar Falta
                            </button>
                            <button
                              onClick={() => mudarStatus(alunoCheckin.id, 'Confirmado')}
                              className="px-4 py-1.5 text-[10px] font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                            >
                              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                              Validar Presença
                            </button>
                          </>
                        )}

                        {alunoCheckin.status === 'Confirmado' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Presença Validada
                          </span>
                        )}

                        {alunoCheckin.status === 'Faltou' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold bg-zinc-100 text-zinc-400 line-through">
                            Falta Registrada
                          </span>
                        )}
                      </div>

                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400 font-light flex flex-col items-center justify-center min-h-[220px]">
                  <p>Nenhum check-in registrado para o horário selecionado.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Os atletas devem realizar o check-in no aplicativo ou passar no leitor de QR Code ao lado.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Recepção & Simulador QR Code */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                📷 Receptor de Check-in QR Code
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Simule a leitura física da carteirinha digital do atleta na entrada da academia.</p>
            </div>

            {/* Simulated camera scanning box */}
            <div className="border border-dashed border-zinc-300 bg-slate-50 rounded-xl p-4 text-center space-y-3 relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />

              <span className="text-[28px] animate-pulse">📱</span>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Aguardando escaneamento...</p>
            </div>

            {/* QR Scanner dropdown selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Escolha o atleta para simular:</label>
              <div className="flex gap-2">
                <select
                  value={selectedStudentForQr}
                  onChange={(e) => setSelectedStudentForQr(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-red-650"
                >
                  <option value="">Selecione um atleta...</option>
                  {todosAlunos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.faixa})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSimulateQrScan}
                  disabled={!selectedStudentForQr}
                  className="bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow disabled:opacity-50 cursor-pointer"
                >
                  Escanear
                </button>
              </div>
            </div>

            {/* Scan Results Screen */}
            {scanResult && (
              <div className={`p-4 rounded-xl border space-y-3.5 animate-scale-up ${
                scanResult.status === 'Liberado' 
                  ? 'bg-emerald-50/55 border-emerald-100 text-emerald-950' 
                  : 'bg-rose-50/55 border-rose-100 text-rose-950'
              }`}>
                <div className="flex justify-between items-start border-b border-emerald-250/20 pb-2">
                  <div>
                    <h3 className="font-bold text-xs">{scanResult.studentName}</h3>
                    <p className="text-[9px] font-semibold opacity-80">Check-in na classe de {treinoFiltro}h</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    scanResult.status === 'Liberado' 
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-100 border-rose-200 text-rose-800'
                  }`}>
                    {scanResult.status === 'Liberado' ? '✅ LIBERADO' : '🚨 INADIMPLENTE'}
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  <BeltVisual beltName={scanResult.belt} degrees={scanResult.degrees} size="sm" />
                  <span className="text-[10px] font-bold">{scanResult.belt} • {scanResult.degrees}G</span>
                </div>

                {/* Medical remarks on scan */}
                {(scanResult.alergias || scanResult.lesoes) && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-rose-100 text-[10px] space-y-1">
                    <p className="font-bold text-rose-700">🩺 Ficha Médica Atleta:</p>
                    {scanResult.alergias && <p>● **Alergias:** {scanResult.alergias}</p>}
                    {scanResult.lesoes && <p>● **Lesões:** {scanResult.lesoes}</p>}
                  </div>
                )}

                {scanResult.status === 'Bloqueado' ? (
                  <div className="space-y-2 pt-1.5">
                    <p className="text-[9px] font-medium text-rose-600">
                      ⚠️ O aluno possui pendências financeiras e a entrada automática foi recusada.
                    </p>
                    <button
                      onClick={() => handleForceCheckIn(scanResult.studentId)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Aprovar Entrada Manualmente (Cortesia)
                    </button>
                  </div>
                ) : (
                  <p className="text-[9px] font-semibold text-emerald-700">
                    🎉 Entrada aprovada! Presença validada automaticamente no tatame. Bons treinos!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
