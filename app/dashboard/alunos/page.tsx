// app/dashboard/alunos/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db, Student } from '../../lib/db'

export default function ListagemAlunosPage() {
  const [busca, setBusca] = useState('')
  const [filtroFaixa, setFiltroFaixa] = useState('Todas')
  const [alunos, setAlunos] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setAlunos(db.getStudents(loggedUser.academyId))
    }
    setIsLoading(false)
  }, [])

  // Lógica combinada de busca por texto e filtro por faixa
  const alunosFiltrados = alunos.filter((aluno) => {
    const matchesBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase())
    const matchesFaixa = filtroFaixa === 'Todas' || aluno.faixa === filtroFaixa
    return matchesBusca && matchesFaixa
  })

  if (isLoading) {
    return <div className="text-xs font-semibold text-slate-400">Carregando tatame...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Gestão de Alunos</h1>
          <p className="text-sm text-zinc-500">Consulte, pesquise e gerencie a ficha cadastral de todos os atletas.</p>
        </div>
        <Link
          href="/dashboard/alunos/novo"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition-colors"
        >
          + Novo Aluno
        </Link>
      </div>

      {/* Painel de Filtros e Pesquisa */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Barra de Pesquisa por Nome */}
        <div className="w-full sm:flex-1 relative">
          <input
            type="text"
            placeholder="🔍 Buscar atleta por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
          />
        </div>

        {/* Seletor de Filtro de Faixa */}
        <div className="w-full sm:w-48 flex items-center gap-2 border border-zinc-200 p-2 rounded-lg bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Faixa:</span>
          <select
            value={filtroFaixa}
            onChange={(e) => setFiltroFaixa(e.target.value)}
            className="w-full text-sm font-semibold bg-transparent border-none focus:outline-none cursor-pointer text-zinc-800"
          >
            <option value="Todas">Todas</option>
            <option value="Branca">Branca</option>
            <option value="Azul">Azul</option>
            <option value="Roxa">Roxa</option>
            <option value="Marrom">Marrom</option>
            <option value="Preta">Preta 🥋</option>
          </select>
        </div>

      </div>

      {/* Tabela de Alunos */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4">Nome do Atleta</th>
                <th className="p-4">Graduação</th>
                <th className="p-4">Matrícula</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Link para a ficha individual no Nome */}
                    <td className="p-4">
                      <Link
                        href={`/dashboard/alunos/${aluno.id}`}
                        className="font-semibold text-zinc-900 hover:text-red-600 hover:underline transition-colors block"
                      >
                        {aluno.nome}
                      </Link>
                    </td>
                    
                    {/* Faixa e Graus */}
                    <td className="p-4 text-zinc-600">
                      <span className="font-medium">Faixa {aluno.faixa}</span>
                      {aluno.graus > 0 && (
                        <span className="text-[11px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded ml-1.5">
                          {aluno.graus}G
                        </span>
                      )}
                    </td>
                    
                    {/* Data de Entrada */}
                    <td className="p-4 text-zinc-500">{aluno.dataMatricula}</td>
                    
                    {/* Badge de Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        aluno.status === 'Ativo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>
                    
                    {/* Ação: Botão para abrir detalhes */}
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/alunos/${aluno.id}`}
                        className="inline-flex items-center text-xs font-semibold text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Ver Ficha
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-zinc-400">
                    Nenhum atleta encontrado com os filtros aplicados.
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
