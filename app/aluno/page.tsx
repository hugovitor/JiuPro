// app/aluno/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { db, Student, Academy, ClassSession } from '../lib/db'

function AreaDoAlunoContent() {
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId') || '1' // Default to Carlos Silva

  const [student, setStudent] = useState<Student | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [checkins, setCheckins] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(true)

  const loadData = () => {
    const s = db.getStudent(studentId)
    if (s) {
      setStudent(s)
      const ac = db.getAcademy(s.academyId)
      if (ac) setAcademy(ac)

      const classList = db.getClasses(s.academyId)
      setClasses(classList)

      const activeCheckins = db.getCheckIns(s.academyId)
      setCheckins(activeCheckins)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [studentId])

  // Alterna o agendamento da aula (check-in)
  const handleCheckInToggle = (classTime: string) => {
    if (!student || !academy) return

    const jaCheckedIn = checkins.some(c => c.id === student.id && c.horario === classTime)

    if (jaCheckedIn) {
      db.studentCancelCheckIn(academy.id, student.id)
    } else {
      db.studentCheckIn(academy.id, student.id, classTime)
    }

    // Reload checkins
    const updated = db.getCheckIns(academy.id)
    setCheckins(updated)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-slate-400">Acessando tatame...</div>
      </div>
    )
  }

  if (!student || !academy) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 text-center">
        <div className="max-w-xs space-y-4">
          <p className="text-sm text-slate-500 font-medium">Nenhum atleta encontrado para esta credencial.</p>
          <a href="/" className="inline-block text-xs font-bold text-red-600 underline">Voltar para a Home</a>
        </div>
      </div>
    )
  }

  // Evolução do aluno
  const aulasConcluidas = student.presencas.length
  const aulasParaProximoGrau = 40
  const percentualProgresso = Math.min(
    Math.round((aulasConcluidas / aulasParaProximoGrau) * 100),
    100
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12">
      
      {/* Perfil Superior */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-950 rounded-lg flex flex-col items-center justify-between py-1 border-b-[3px] border-red-600 shadow-sm">
              <span className="text-white text-[8px] font-bold uppercase tracking-wider">{student.faixa}</span>
              <span className="text-white text-[10px] font-black">{student.graus}G</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">{student.nome}</h1>
              <p className="text-[11px] text-slate-400 font-medium">{academy.name} • {student.mensalidade === '150,00' ? 'Mensal Ouro' : 'Plano Unitário'}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            student.status === 'Ativo' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-zinc-50 text-zinc-600 border-zinc-200'
          }`}>
            {student.status === 'Ativo' ? 'Regular' : 'Inativo'}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5">
        
        {/* CARD DE AVANÇO (Gamificação de Graus/Aulas) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wide">Evolução Técnica</span>
            <span className="font-bold text-slate-900">{aulasConcluidas}/{aulasParaProximoGrau} Aulas</span>
          </div>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-red-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${percentualProgresso}%` }}
            />
          </div>
          
          <p className="text-[11px] text-slate-400 font-medium">
            {aulasConcluidas >= aulasParaProximoGrau ? (
              <span className="text-emerald-600 font-semibold">Parabéns! Você concluiu a meta mínima de aulas para avaliação técnica.</span>
            ) : (
              <>Faltam apenas <span className="font-bold text-slate-700">{aulasParaProximoGrau - aulasConcluidas} presenças</span> para você estar apto à próxima avaliação de grau.</>
            )}
          </p>
        </div>

        {/* Listagem de Treinos Disponíveis */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">Treinos de Hoje</h2>
          
          {classes.map((treino) => {
            // Check check-in status
            const statusCheckin = checkins.find(c => c.id === student.id && c.horario === treino.horario)
            const checkInFeito = !!statusCheckin
            const isConfirmed = statusCheckin?.status === 'Confirmado'

            // Count total confirmed students for this roll
            const parceiros = checkins.filter(c => c.horario === treino.horario && c.id !== student.id)

            return (
              <div 
                key={treino.id}
                className={`p-4 rounded-xl border transition-all space-y-4 ${
                  checkInFeito 
                    ? isConfirmed 
                      ? 'bg-emerald-950 border-emerald-900 text-white shadow-md' 
                      : 'bg-zinc-950 border-zinc-950 text-white shadow-md' 
                    : 'bg-white border-slate-200/70 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      checkInFeito ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {treino.horario}h
                    </span>
                    <h3 className="text-sm font-semibold tracking-tight pt-1">{treino.nome}</h3>
                    <p className={`text-[11px] ${checkInFeito ? 'text-zinc-400' : 'text-slate-400'}`}>
                      {treino.dias} • Turma Geral
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheckInToggle(treino.horario)}
                    disabled={isConfirmed}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      checkInFeito
                        ? isConfirmed
                          ? 'bg-emerald-600 text-white opacity-80 cursor-default'
                          : 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isConfirmed ? 'Confirmado' : checkInFeito ? 'Cancelar' : 'Agendar'}
                  </button>
                </div>

                {/* Seção Comunidade: Quem também vai treinar */}
                {parceiros.length > 0 && (
                  <div className={`pt-3 border-t text-xs ${
                    checkInFeito ? 'border-zinc-800' : 'border-slate-100'
                  }`}>
                    <p className={`text-[11px] font-medium pb-2 ${checkInFeito ? 'text-zinc-400' : 'text-slate-400'}`}>
                      Confirmados para este rolo:
                    </p>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {parceiros.map((p, idx) => (
                        <div 
                          key={idx} 
                          title={`${p.nome} - Faixa ${p.faixa}`}
                          className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold text-[10px] border ${
                            checkInFeito 
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                              : 'bg-slate-50 border-slate-200/60 text-slate-700'
                          }`}
                        >
                          <span className="opacity-70">{p.nome.split(' ').map((n: string) => n[0]).join('').substring(0,2)}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Histórico Recente de Presenças Consolidadas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Histórico de Aulas Concluídas</h3>
          <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
            {student.presencas.length > 0 ? (
              student.presencas.map((p, idx) => (
                <div key={idx} className="py-2.5 flex justify-between text-xs items-center">
                  <span className="font-semibold text-slate-800">{p.treino}</span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')} às {p.horario}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 py-2 text-center">Nenhum treino confirmado recentemente.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

export default function AreaDoAlunoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-400">Iniciando área do aluno...</div>}>
      <AreaDoAlunoContent />
    </Suspense>
  )
}
