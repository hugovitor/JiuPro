// app/dashboard/alunos/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db, Student } from '../../lib/db'

export default function ListagemAlunosPage() {
  const [busca, setBusca] = useState('')
  const [filtroFaixa, setFiltroFaixa] = useState('Todas')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('Todos')
  const [alunos, setAlunos] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setAlunos(db.getStudents(loggedUser.academyId))
    }
    setIsLoading(false)
  }, [])

  // Lógica combinada de busca por texto, faixa, status e financeiro
  const alunosFiltrados = alunos.filter((aluno) => {
    const matchesBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase())
    const matchesFaixa = filtroFaixa === 'Todas' || aluno.faixa === filtroFaixa
    const matchesStatus = filtroStatus === 'Todos' || aluno.status === filtroStatus
    const matchesFinanceiro = (() => {
      if (filtroFinanceiro === 'Todos') return true
      const hasLateInvoice = aluno.financeiro.some(inv => inv.status === 'Atrasado')
      if (filtroFinanceiro === 'Inadimplente') return hasLateInvoice
      if (filtroFinanceiro === 'Regular') return !hasLateInvoice
      return true
    })()
    return matchesBusca && matchesFaixa && matchesStatus && matchesFinanceiro
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
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition-colors gap-1.5"
        >
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Aluno
        </Link>
      </div>

      {/* Painel de Filtros e Pesquisa */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Barra de Pesquisa por Nome */}
        <div className="w-full sm:flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar atleta por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
          />
        </div>

        {/* Seletor de Filtro de Faixa */}
        <div className="w-full sm:w-44 flex items-center gap-2 border border-zinc-200 p-2 rounded-lg bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Faixa:</span>
          <select
            value={filtroFaixa}
            onChange={(e) => setFiltroFaixa(e.target.value)}
            className="w-full text-xs font-bold bg-transparent border-none focus:outline-none cursor-pointer text-zinc-800"
          >
            <option value="Todas">Todas</option>
            <option value="Branca">Branca</option>
            <option value="Azul">Azul</option>
            <option value="Roxa">Roxa</option>
            <option value="Marrom">Marrom</option>
            <option value="Preta">Preta</option>
          </select>
        </div>

        {/* Seletor de Filtro de Status (Novo!) */}
        <div className="w-full sm:w-44 flex items-center gap-2 border border-zinc-200 p-2 rounded-lg bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full text-xs font-bold bg-transparent border-none focus:outline-none cursor-pointer text-zinc-800"
          >
            <option value="Todos">Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
        </div>

        {/* Seletor de Filtro Financeiro (Novo!) */}
        <div className="w-full sm:w-44 flex items-center gap-2 border border-zinc-200 p-2 rounded-lg bg-white shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Caixa:</span>
          <select
            value={filtroFinanceiro}
            onChange={(e) => setFiltroFinanceiro(e.target.value)}
            className="w-full text-xs font-bold bg-transparent border-none focus:outline-none cursor-pointer text-zinc-800"
          >
            <option value="Todos">Todos</option>
            <option value="Regular">Em Dia</option>
            <option value="Inadimplente">Com Pendências</option>
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
                    <td className="p-4 flex items-center gap-3">
                      {aluno.avatarUrl ? (
                        <img
                          src={aluno.avatarUrl}
                          alt={aluno.nome}
                          className="h-8 w-8 rounded-full object-cover border border-zinc-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-zinc-200 text-zinc-500 font-bold text-xs flex-shrink-0">
                          {aluno.nome.slice(0, 2).toUpperCase()}
                        </div>
                      )}
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
