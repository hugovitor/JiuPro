// app/dashboard/page.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { db, Student, User } from '../lib/db'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [alunos, setAlunos] = useState<Student[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      setAlunos(db.getStudents(loggedUser.academyId))
      setAnnouncements(db.getAnnouncements(loggedUser.academyId))

      // Sincroniza em segundo plano com o Supabase
      db.syncWithSupabase(loggedUser.academyId).then(() => {
        setAlunos(db.getStudents(loggedUser.academyId))
        setAnnouncements(db.getAnnouncements(loggedUser.academyId))
      })
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

  // Paid invoices extraction for financial health widget
  const totalPago = alunos.reduce((acc, aluno) => {
    return acc + aluno.financeiro
      .filter(f => f.status === 'Pago')
      .reduce((sum, f) => {
        const cleanVal = parseFloat(f.valor.replace(',', '.'))
        return sum + (isNaN(cleanVal) ? 0 : cleanVal)
      }, 0)
  }, 0)

  const totalFinanceiro = totalPago + totalInadimplencia
  const adimplenciaPercent = totalFinanceiro > 0 ? Math.round((totalPago / totalFinanceiro) * 100) : 100

  // Birthdays mock list using students for this academy
  const aniversariantes = alunosAtivos.slice(0, 3).map((aluno) => {
    const dia = (parseInt(aluno.id) * 7) % 28 + 1
    return {
      id: aluno.id,
      nome: aluno.nome,
      faixa: aluno.faixa,
      data: `${dia < 10 ? '0' + dia : dia}/Ago`,
      idade: 20 + ((parseInt(aluno.id) * 3) % 25)
    }
  })

  // Handle WhatsApp PIX collection billing with dynamic template
  const handleCobrancaWhatsapp = (item: any) => {
    const academy = db.getAcademy(user.academyId)
    const template = academy?.whatsappTemplate || 'Olá, {aluno}! Consta em aberto no JiuPro a mensalidade de {mes} (Vencimento: {vencimento}) no valor de R$ {valor}.\n\nVocê pode pagar via PIX.\nChave: {chavePix}\n\nObrigado! Oss.'
    
    const texto = template
      .replace(/{aluno}/g, item.nome)
      .replace(/{mes}/g, item.mes)
      .replace(/{vencimento}/g, item.vencimento)
      .replace(/{valor}/g, item.valor)
      .replace(/{chavePix}/g, item.chavePix)

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

        {/* Mural de Avisos Oficiais */}
        {announcements.length > 0 && (
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-700 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317Z" />
              </svg>
              Avisos Oficiais Fixados (Mural do Tatame)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map(ann => (
                <div 
                  key={ann.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                    ann.categoria === 'Alerta' ? 'bg-red-50/30 border-red-100 text-red-950' :
                    ann.categoria === 'Evento' ? 'bg-amber-50/30 border-amber-100 text-amber-950' :
                    'bg-slate-50/40 border-slate-100 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                        ann.categoria === 'Alerta' ? 'bg-red-100/60 text-red-700' :
                        ann.categoria === 'Evento' ? 'bg-amber-100/60 text-amber-700' :
                        'bg-slate-200/60 text-slate-700'
                      }`}>
                        {ann.categoria}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400">
                        {new Date(ann.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold mt-2 text-zinc-900">{ann.titulo}</h3>
                    <p className="text-[11px] mt-1 opacity-90 leading-relaxed font-medium">{ann.conteudo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linha de Cartões de Resumo (KPIs) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card: Alunos Ativos */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Atletas Ativos</span>
              <span className="text-emerald-700 bg-emerald-50 text-[9px] px-2 py-0.5 rounded-md font-bold border border-emerald-100 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.018 12.018 0 0 1 12 21c-1.954 0-3.772-.465-5.38-1.285V19.13c0-1.112.285-2.16.786-3.07M12 19.13a11.963 11.963 0 0 0 3.011-1.025M12 19.13a11.963 11.963 0 0 1-3.011-1.025M21 9.75A3.75 3.75 0 1 1 17.25 6 3.75 3.75 0 0 1 21 9.75ZM12.75 9.75a3.75 3.75 0 1 1-3.75-3.75 3.75 3.75 0 0 1 3.75 3.75Z" />
                </svg>
                {alunosAtivos.length} ativos
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-zinc-900">{alunosAtivos.length}</span>
              <p className="text-[10px] font-semibold text-zinc-400 mt-1">Total de {alunos.length} cadastrados</p>
            </div>
          </div>

          {/* Card: Inadimplência */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Inadimplência</span>
              <span className="text-red-700 bg-red-50 text-[9px] px-2 py-0.5 rounded-md font-bold border border-red-100 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                {mensalidadesAtrasadas.length} pendentes
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-red-600">
                R$ {totalInadimplencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] font-semibold text-zinc-400 mt-1">Total pendente a receber</p>
            </div>
          </div>

          {/* Card: Saúde Financeira */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Adimplência Geral</span>
              <span className="text-blue-700 bg-blue-50 text-[9px] px-2 py-0.5 rounded-md font-bold border border-blue-100">
                {adimplenciaPercent}%
              </span>
            </div>
            <div className="mt-3.5 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-slate-800">
                  R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold">
                  de R$ {totalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all" 
                  style={{ width: `${adimplenciaPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card: Aniversariantes */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Aniversariantes</span>
              <span className="text-amber-800 bg-amber-50 text-[9px] px-2 py-0.5 rounded-md font-bold border border-amber-100">Agosto</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-zinc-900">{aniversariantes.length}</span>
              <p className="text-[10px] font-semibold text-zinc-450 mt-1">Guerreiros festejando este mês</p>
            </div>
          </div>

        </div>

        {/* Seção Dupla: Listagens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Tabela: Cobranças Pendentes */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Mensalidades Atrasadas</h2>
              <Link 
                href="/dashboard/alunos" 
                className="text-xs font-bold text-red-650 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                Ver todos
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            
            <div className="divide-y divide-zinc-100 min-h-[150px]">
              {mensalidadesAtrasadas.length > 0 ? (
                mensalidadesAtrasadas.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors">
                    <div>
                      <Link 
                        href={`/dashboard/alunos/${item.alunoId}`} 
                        className="text-xs font-bold text-zinc-900 hover:text-red-600 hover:underline transition-colors"
                      >
                        {item.nome}
                      </Link>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Faixa {item.faixa} • <span className="text-red-600 font-semibold">Atrasado ({item.mes})</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-900">R$ {item.valor}</span>
                      <button 
                        onClick={() => handleCobrancaWhatsapp(item)}
                        className="text-[10px] bg-zinc-950 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors font-bold shadow-sm flex items-center gap-1.5"
                      >
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
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
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Aniversariantes do Mês</h2>
              <span className="text-xs font-bold text-zinc-400">Agosto</span>
            </div>
            
            <div className="divide-y divide-zinc-100 min-h-[150px]">
              {aniversariantes.length > 0 ? (
                aniversariantes.map((aniv) => (
                  <div key={aniv.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 text-red-550 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697-.056-4.024-.166C6.845 9.51 6 10.652 6 11.963v6.284a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-6.284c0-1.313-.846-2.455-1.976-2.578A48.3 48.3 0 0 0 12 8.25Zm0 0V4.5m0 3.75c1.355 0 2.697-.056 4.024-.166C17.155 9.51 18 10.652 18 11.963v6.284a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-6.284c0-1.313.846-2.455 1.976-2.578A48.3 48.3 0 0 1 12 8.25ZM12 4.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM9.75 11.25h4.5M9.75 14.25h4.5" />
                      </svg>
                      <div>
                        <Link
                          href={`/dashboard/alunos/${aniv.id}`}
                          className="text-xs font-bold text-zinc-900 hover:text-red-600 hover:underline transition-colors"
                        >
                          {aniv.nome}
                        </Link>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Graduação: {aniv.faixa} • Vai fazer {aniv.idade} anos
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-zinc-100 text-zinc-650 px-2.5 py-1 rounded-lg">
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
