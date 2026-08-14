// app/dashboard/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

// Dados fictícios para simular o banco de dados da academia
const initialAlunosAtrasados = [
  { id: 1, nome: 'Carlos Silva', faixa: 'Azul', dias: 5, valor: 'R$ 150,00' },
  { id: 2, nome: 'Mariana Costa', faixa: 'Roxa', dias: 12, valor: 'R$ 170,00' },
  { id: 3, nome: 'Rodrigo Lima', faixa: 'Branca', dias: 3, valor: 'R$ 150,00' },
]

const aniversariantesDoMes = [
  { id: 1, nome: 'Lucas Almeida', faixa: 'Marrom', data: '15/Ago', idade: 28 },
  { id: 2, nome: 'Beatriz Santos', faixa: 'Preta', data: '19/Ago', idade: 34 },
  { id: 3, nome: 'Thiago Rocha', faixa: 'Branca', data: '24/Ago', idade: 22 },
]

export default function DashboardPage() {
  const [atrasados, setAtrasados] = useState(initialAlunosAtrasados)

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-zinc-900">
      
   

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Saudação */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Oss, Professor!</h1>
          <p className="text-sm text-zinc-500">Aqui está o resumo da sua academia para o dia de hoje.</p>
        </div>

        {/* Linha de Cartões de Resumo (KPIs) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card: Alunos Ativos */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Alunos Ativos</span>
              <span className="text-emerald-600 bg-emerald-50 text-xs px-2 py-0.5 rounded font-medium">+4 este mês</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">142</span>
              <p className="text-xs text-zinc-500 mt-1">Frequência média de 78% nos treinos</p>
            </div>
          </div>

          {/* Card: Mensalidades Atrasadas */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Inadimplência</span>
              <span className="text-rose-600 bg-rose-50 text-xs px-2 py-0.5 rounded font-medium">{atrasados.length} pendentes</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight text-rose-600">R$ 470,00</span>
              <p className="text-xs text-zinc-500 mt-1">Total acumulado em aberto</p>
            </div>
          </div>

          {/* Card: Aniversariantes */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Aniversariantes</span>
              <span className="text-red-600 bg-red-50 text-xs px-2 py-0.5 rounded font-medium">Este mês</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{aniversariantesDoMes.length}</span>
              <p className="text-xs text-zinc-500 mt-1">Guerreiros completando ano</p>
            </div>
          </div>

        </div>

        {/* Seção Dupla: Listagens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Tabela: Cobranças Pendentes */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Mensalidades Atrasadas</h2>
              <button className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors">Ver todos</button>
            </div>
            <div className="divide-y divide-zinc-100">
              {atrasados.map((aluno) => (
                <div key={aluno.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div>
                    {/* Agora o nome se torna um link seguro para a rota dinâmica da Ficha do Aluno */}
                    <Link 
                      href={`/dashboard/alunos/${aluno.id}`} 
                      className="text-sm font-semibold text-zinc-900 hover:text-red-600 hover:underline transition-colors"
                    >
                      {aluno.nome}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Faixa {aluno.faixa} • <span className="text-rose-600 font-medium">Atrasado há {aluno.dias} dias</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-900">{aluno.valor}</span>
                    <button className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                      Cobrar
                    </button>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Lista: Aniversariantes do Mês */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Aniversariantes do Mês</h2>
              <span className="text-xs font-medium text-zinc-400">Agosto</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {aniversariantesDoMes.map((aniv) => (
                <div key={aniv.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Indicador visual atualizado com a cor da marca */}
                    <div className="h-2 w-2 rounded-full bg-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{aniv.nome}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Graduação: {aniv.faixa} • Vai fazer {aniv.idade} anos
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md">
                    {aniv.data}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
