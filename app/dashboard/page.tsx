// app/dashboard/page.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { db, Student, User } from '../lib/db'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [alunos, setAlunos] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      setAlunos(db.getStudents(loggedUser.academyId))
    }
    setIsLoading(false)
  }, [])

  if (isLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando tatame...</div>
  }

  // Calculate stats based on real database students for this academy
  const alunosAtivos = alunos.filter(a => a.status === 'Ativo')
  
  // Late invoices extraction
  const mensalidadesAtrasadas = alunos.flatMap(aluno => 
    aluno.financeiro
      .filter(f => f.status === 'Atrasado')
      .map(f => ({
        alunoId: aluno.id,
        nome: aluno.nome,
        faixa: aluno.faixa,
        mes: f.mes,
        vencimento: f.vencimento,
        valor: f.valor,
        chavePix: aluno.chavePix,
        invoice: f
      }))
  )

  const totalInadimplencia = mensalidadesAtrasadas.reduce((acc, curr) => {
    const cleanVal = parseFloat(curr.valor.replace(',', '.'))
    return acc + (isNaN(cleanVal) ? 0 : cleanVal)
  }, 0)

  // Birthdays mock list using students for this academy
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const aniversariantes = alunosAtivos.slice(0, 3).map((aluno, index) => {
    // Generate deterministic birthdays based on ID
    const dia = (parseInt(aluno.id) * 7) % 28 + 1
    return {
      id: aluno.id,
      nome: aluno.nome,
      faixa: aluno.faixa,
      data: `${dia < 10 ? '0' + dia : dia}/Ago`,
      idade: 20 + ((parseInt(aluno.id) * 3) % 25)
    }
  })

  // Handle WhatsApp PIX collection billing
  const handleCobrancaWhatsapp = (item: any) => {
    const texto = `Olá, ${item.nome}! Consta em aberto no JiuPro a mensalidade de ${item.mes} (Vencimento: ${item.vencimento}) no valor de R$ ${item.valor}.\n\nVocê pode pagar via PIX.\nChave: ${item.chavePix}\n\nObrigado! Oss.`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-zinc-900">
      
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto py-4 space-y-6">
        
        {/* Saudação */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Oss, {user.name}!</h1>
          <p className="text-sm text-zinc-500">Aqui está o resumo em tempo real da sua academia.</p>
        </div>

        {/* Linha de Cartões de Resumo (KPIs) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card: Alunos Ativos */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Alunos Ativos</span>
              <span className="text-emerald-600 bg-emerald-50 text-xs px-2 py-0.5 rounded font-medium">
                {alunosAtivos.length} ativos
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{alunosAtivos.length}</span>
              <p className="text-xs text-zinc-500 mt-1">Total de {alunos.length} cadastrados no sistema</p>
            </div>
          </div>

          {/* Card: Mensalidades Atrasadas */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Inadimplência</span>
              <span className="text-rose-600 bg-rose-50 text-xs px-2 py-0.5 rounded font-medium">
                {mensalidadesAtrasadas.length} pendentes
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight text-rose-600">
                R$ {totalInadimplencia.toFixed(2).replace('.', ',')}
              </span>
              <p className="text-xs text-zinc-500 mt-1">Acumulado total de mensalidades vencidas</p>
            </div>
          </div>

          {/* Card: Aniversariantes */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Aniversariantes</span>
              <span className="text-red-600 bg-red-50 text-xs px-2 py-0.5 rounded font-medium">Agosto</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{aniversariantes.length}</span>
              <p className="text-xs text-zinc-500 mt-1">Guerreiros completando ano este mês</p>
            </div>
          </div>

        </div>

        {/* Seção Dupla: Listagens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Tabela: Cobranças Pendentes */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Mensalidades Atrasadas</h2>
              <Link 
                href="/dashboard/alunos" 
                className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Ver todos
              </Link>
            </div>
            
            <div className="divide-y divide-zinc-100 min-h-[150px]">
              {mensalidadesAtrasadas.length > 0 ? (
                mensalidadesAtrasadas.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div>
                      <Link 
                        href={`/dashboard/alunos/${item.alunoId}`} 
                        className="text-sm font-semibold text-zinc-900 hover:text-red-600 hover:underline transition-colors"
                      >
                        {item.nome}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Faixa {item.faixa} • <span className="text-rose-600 font-medium">Atrasado ({item.mes})</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-900">R$ {item.valor}</span>
                      <button 
                        onClick={() => handleCobrancaWhatsapp(item)}
                        className="text-xs bg-zinc-950 text-white px-3 py-1.5 rounded-md hover:bg-zinc-850 transition-colors font-bold shadow-sm"
                      >
                        Cobrar PIX
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400">
                  Nenhuma cobrança em atraso nesta unidade. Oss!
                </div>
              )}
            </div>
          </div>

          {/* Lista: Aniversariantes do Mês */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">Aniversariantes do Mês</h2>
              <span className="text-xs font-medium text-zinc-400">Agosto</span>
            </div>
            
            <div className="divide-y divide-zinc-100 min-h-[150px]">
              {aniversariantes.length > 0 ? (
                aniversariantes.map((aniv) => (
                  <div key={aniv.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-600" />
                      <div>
                        <Link
                          href={`/dashboard/alunos/${aniv.id}`}
                          className="text-sm font-semibold text-zinc-900 hover:text-red-600 hover:underline transition-colors"
                        >
                          {aniv.nome}
                        </Link>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Graduação: {aniv.faixa} • Vai fazer {aniv.idade} anos
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md">
                      {aniv.data}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400">
                  Nenhum aniversariante ativo neste mês.
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
