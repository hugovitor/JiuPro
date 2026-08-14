// app/dashboard/relatorios/page.tsx
'use client'

import { useState } from 'react'

// Dados fictícios simulando o histórico de presença acumulado no banco de dados
const initialAlunosSumidos = [
  { id: 1, nome: 'Marcos Oliveira', faixa: 'Roxa', graus: 2, ultimos30Dias: 0, diasAfastado: 32, status: 'Crítico' },
  { id: 2, nome: 'Felipe Melo', faixa: 'Branca', graus: 0, ultimos30Dias: 1, diasAfastado: 18, status: 'Alerta' },
  { id: 3, nome: 'Juliana Ribeiro', faixa: 'Azul', graus: 3, ultimos30Dias: 2, diasAfastado: 14, status: 'Alerta' },
  { id: 4, nome: 'Arthur Jorge', faixa: 'Marrom', graus: 1, ultimos30Dias: 0, diasAfastado: 45, status: 'Crítico' },
]

export default function RelatoriosPage() {
  const [alunos, setAlunos] = useState(initialAlunosSumidos)

  // Filtra ou simula uma ação de envio de mensagem de incentivo
  const handleNotificarAluno = (nome: string) => {
    const mensagem = `Olá, ${nome}! Notamos que você está sumido dos treinos na JiuPro há alguns dias. O tatame está pronto para o seu retorno, estamos te esperando para o próximo rolo! Oss.`
    
    // Abre o WhatsApp Web com o texto pronto (simulado)
    const url = `https://wa.me{encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
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
            <span className="text-emerald-600 text-xs font-medium">↑ 2.3% vs. mês passado</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Guerreiros Afastados</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-red-600">{alunos.length}</span>
            <span className="text-zinc-500 text-xs">Há mais de 10 dias sem treinar</span>
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
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
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
              {alunos.map((aluno) => (
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-950 text-white rounded-md hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                      💬 Resgatar Atleta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
