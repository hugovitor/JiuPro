// app/aluno/page.tsx
'use client'

import { useState } from 'react'

// Interfaces de Tipo Estritas
interface IParceiroTreino {
  nome: string
  faixa: string
  avatar: string
}

interface ITurmaAluno {
  id: string
  horario: string
  nome: string
  dias: string
  vagasRestantes: number
  checkInFeito: boolean
  parceirosConfirmados: IParceiroTreino[]
}

export default function AreaDoAlunoPage() {
  // 1. Dados do Aluno com foco na evolução para o próximo Grau
  const [aluno] = useState({
    nome: 'Carlos Silva',
    faixa: 'Azul',
    graus: 2,
    plano: 'Mensal Ouro',
    aulasConcluidas: 28,
    aulasParaProximoGrau: 40 // Meta de aulas para o professor avaliar o próximo grau
  })

  // Calcular percentual de progresso rumo ao próximo objetivo no tatame
  const percentualProgresso = Math.min(
    Math.round((aluno.aulasConcluidas / aluno.aulasParaProximoGrau) * 100),
    100
  )

  // 2. Grade de treinos do dia com a lista de quem já confirmou presença
  const [gradeTreinos, setGradeTreinos] = useState<ITurmaAluno[]>([
    { 
      id: '1', 
      horario: '19:30', 
      nome: 'Avançado — Foco em Competição', 
      dias: 'Seg, Qua, Sex', 
      vagasRestantes: 4, 
      checkInFeito: false,
      parceirosConfirmados: [
        { nome: 'Mariana Costa', faixa: 'Roxa', avatar: 'MC' },
        { nome: 'Rodrigo Lima', faixa: 'Branca', avatar: 'RL' },
        { nome: 'Lucas Almeida', faixa: 'Marrom', avatar: 'LA' },
      ]
    },
    { 
      id: '2', 
      horario: '21:00', 
      nome: 'Iniciantes — Fundamentos', 
      dias: 'Seg, Qua', 
      vagasRestantes: 20, 
      checkInFeito: false,
      parceirosConfirmados: []
    },
  ])

  // Alterna o agendamento da aula
  const handleCheckIn = (id: string) => {
    setGradeTreinos(
      gradeTreinos.map((treino) => {
        if (treino.id === id) {
          const jaAgendado = treino.checkInFeito
          
          // Adiciona ou remove o próprio aluno da lista visual de parceiros confirmados
          const novosParceiros = jaAgendado
            ? treino.parceirosConfirmados.filter((p) => p.nome !== aluno.nome)
            : [...treino.parceirosConfirmados, { nome: aluno.nome, faixa: aluno.faixa, avatar: 'CS' }]

          return {
            ...treino,
            checkInFeito: !jaAgendado,
            vagasRestantes: jaAgendado ? treino.vagasRestantes + 1 : treino.vagasRestantes - 1,
            parceirosConfirmados: novosParceiros
          }
        }
        return treino
      })
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12">
      
      {/* Perfil Superior */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-950 rounded-lg flex flex-col items-center justify-between py-1 border-b-[3px] border-red-600 shadow-sm">
              <span className="text-white text-[8px] font-bold uppercase tracking-wider">{aluno.faixa}</span>
              <span className="text-white text-[10px] font-black">{aluno.graus}G</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">{aluno.nome}</h1>
              <p className="text-[11px] text-slate-400 font-medium">{aluno.plano}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">
            Regular
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5">
        
        {/* CARD DE AVANÇO (Gamificação de Graus/Aulas) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wide">Evolução Técnica</span>
            <span className="font-bold text-slate-900">{aluno.aulasConcluidas}/{aluno.aulasParaProximoGrau} Aulas</span>
          </div>
          
          {/* Barra de Progresso */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-red-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${percentualProgresso}%` }}
            />
          </div>
          
          <p className="text-[11px] text-slate-400 font-medium">
            Faltam apenas <span className="font-bold text-slate-700">{aluno.aulasParaProximoGrau - aluno.aulasConcluidas} presenças</span> para você estar apto à próxima avaliação de grau.
          </p>
        </div>

        {/* Listagem de Treinos Disponíveis */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">Treinos de Hoje</h2>
          
          {gradeTreinos.map((treino) => (
            <div 
              key={treino.id}
              className={`p-4 rounded-xl border transition-all space-y-4 ${
                treino.checkInFeito 
                  ? 'bg-zinc-950 border-zinc-950 text-white shadow-md' 
                  : 'bg-white border-slate-200/70 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    treino.checkInFeito ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {treino.horario}h
                  </span>
                  <h3 className="text-sm font-semibold tracking-tight pt-1">{treino.nome}</h3>
                  <p className={`text-[11px] ${treino.checkInFeito ? 'text-zinc-400' : 'text-slate-400'}`}>
                    {treino.dias} • {treino.vagasRestantes} vagas
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckIn(treino.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    treino.checkInFeito
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {treino.checkInFeito ? 'Cancelar' : 'Agendar'}
                </button>
              </div>

              {/* Seção Comunidade: Quem também vai treinar */}
              {treino.parceirosConfirmados.length > 0 && (
                <div className={`pt-3 border-t text-xs ${
                  treino.checkInFeito ? 'border-zinc-800' : 'border-slate-100'
                }`}>
                  <p className={`text-[11px] font-medium pb-2 ${treino.checkInFeito ? 'text-zinc-400' : 'text-slate-400'}`}>
                    Confirmados para este rolo:
                  </p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {treino.parceirosConfirmados.map((p, idx) => (
                      <div 
                        key={idx} 
                        title={`${p.nome} - Faixa ${p.faixa}`}
                        className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold text-[10px] border ${
                          treino.checkInFeito 
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                            : 'bg-slate-50 border-slate-200/60 text-slate-700'
                        }`}
                      >
                        <span className="opacity-70">{p.avatar}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Histórico Recente de Presenças Consolidadas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Frequência Recente</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2 rounded-lg">
              <p className="text-slate-400 font-medium">Seg</p>
              <p className="text-sm mt-0.5">✓</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2 rounded-lg">
              <p className="text-slate-400 font-medium">Qua</p>
              <p className="text-sm mt-0.5">✓</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2 rounded-lg">
              <p className="text-slate-400 font-medium">Sex</p>
              <p className="text-sm mt-0.5">✓</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 text-slate-300 p-2 rounded-lg">
              <p className="text-slate-400 font-medium">Sáb</p>
              <p className="text-sm mt-0.5">-</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
