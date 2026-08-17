// app/dashboard/relatorios/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, Student, User } from '../../lib/db'

export default function RelatoriosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [alunosSumidos, setAlunosSumidos] = useState<any[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      const allStudents = db.getStudents(loggedUser.academyId)
      
      // Calculate missing students dynamically
      const active = allStudents.filter(s => s.status === 'Ativo')
      setActiveCount(active.length)

      const missing = allStudents.map(s => {
        // Calculate days away
        let daysAway = 10
        let last30Days = 0

        if (s.presencas.length > 0) {
          const lastPresence = new Date(s.presencas[0].data + 'T00:00:00')
          const today = new Date()
          const diffTime = Math.abs(today.getTime() - lastPresence.getTime())
          daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          // count presences in last 30 days
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          last30Days = s.presencas.filter(p => new Date(p.data + 'T00:00:00') >= thirtyDaysAgo).length
        } else {
          // If no presences, calculate based on matricula date
          const entryDate = new Date(s.dataMatricula + 'T00:00:00')
          const today = new Date()
          const diffTime = Math.abs(today.getTime() - entryDate.getTime())
          daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return {
          id: s.id,
          nome: s.nome,
          faixa: s.faixa,
          graus: s.graus,
          ultimos30Dias: last30Days,
          diasAfastado: daysAway,
          status: daysAway > 30 ? 'Crítico' : 'Alerta'
        }
      }).filter(s => s.diasAfastado > 7) // More than 7 days is warnings

      setAlunosSumidos(missing.sort((a, b) => b.diasAfastado - a.diasAfastado))
    }
    setIsLoading(false)
  }, [])

  // Filtra ou simula uma ação de envio de mensagem de incentivo
  const handleNotificarAluno = (nome: string) => {
    const mensagem = `Olá, ${nome}! Notamos que você está sumido dos treinos na JiuPro há alguns dias. O tatame está pronto para o seu retorno, estamos te esperando para o próximo rolo! Oss.`
    
    // Abre o WhatsApp Web com o texto pronto (simulado)
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  if (isLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando relatórios...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* Título da Seção */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Relatórios de Frequência</h1>
        <p className="text-sm text-zinc-500">Mapeamento de assiduidade e controle de evasão de alunos.</p>
      </div>

      {/* Cartões Rápidos de Métricas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Presença Semanal</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-950">84%</span>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              2.3% vs. mês passado
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Guerreiros Afastados</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-red-600">{alunosSumidos.length}</span>
            <span className="text-zinc-500 text-xs">Há mais de 7 dias sem treinar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Média de Treinos / Aluno</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-950">3.4</span>
            <span className="text-zinc-500 text-xs">Sessões por semana</span>
          </div>
        </div>
      </div>

      {/* Tabela de Alunos Sumidos do Tatame */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900">Alunos Sumidos (Risco de Churn)</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Alunos matriculados que reduziram drasticamente a frequência.</p>
          </div>
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 font-semibold">
            Ação Recomendada
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4">Atleta</th>
                <th className="p-4">Graduação</th>
                <th className="p-4 text-center">Treinos (Últimos 30 dias)</th>
                <th className="p-4 text-center">Tempo Fora</th>
                <th className="p-4">Grau de Risco</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {alunosSumidos.length > 0 ? (
                alunosSumidos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Nome */}
                    <td className="p-4 font-semibold text-zinc-900">{aluno.nome}</td>
                    
                    {/* Faixa / Graduação */}
                    <td className="p-4 text-zinc-600">
                      Faixa {aluno.faixa} 
                      {aluno.graus > 0 && <span className="text-xs text-zinc-400 ml-1">({aluno.graus}G)</span>}
                    </td>
                    
                    {/* Treinos no mês */}
                    <td className="p-4 text-center font-medium text-zinc-700">{aluno.ultimos30Dias}</td>
                    
                    {/* Dias afastado */}
                    <td className="p-4 text-center font-bold text-zinc-900">{aluno.diasAfastado} dias</td>
                    
                    {/* Badge de Risco */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        aluno.status === 'Crítico' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>
                    
                    {/* Botão de Cobrança / Motivação */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleNotificarAluno(aluno.nome)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-950 text-white rounded-md hover:bg-zinc-850 transition-colors shadow-sm"
                      >
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
                        Resgatar Atleta
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-zinc-400">
                    Nenhum aluno em risco de churn detectado. Parabéns pela assiduidade dos atletas!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
