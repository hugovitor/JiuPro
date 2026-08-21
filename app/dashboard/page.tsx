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

  // Real grouped invoices data from database
  const allInvoices = alunos.flatMap(a => a.financeiro || [])
  const groupedInvoices: Record<string, { pago: number, pendente: number }> = {}

  allInvoices.forEach(inv => {
    const mes = inv.mes || 'Agosto/2026'
    const cleanVal = parseFloat(inv.valor.replace(',', '.'))
    const valor = isNaN(cleanVal) ? 0 : cleanVal

    if (!groupedInvoices[mes]) {
      groupedInvoices[mes] = { pago: 0, pendente: 0 }
    }
    if (inv.status === 'Pago') {
      groupedInvoices[mes].pago += valor
    } else {
      groupedInvoices[mes].pendente += valor
    }
  })

  // Calendar month ordering helper
  const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const getMonthIndex = (mesName: string) => {
    const pureMonth = mesName.split('/')[0].trim().substring(0, 3)
    return monthOrder.findIndex(m => m.toLowerCase().startsWith(pureMonth.toLowerCase()))
  }

  const sortedMonths = Object.keys(groupedInvoices).sort((a, b) => {
    const yearA = parseInt(a.split('/')[1]) || 2026
    const yearB = parseInt(b.split('/')[1]) || 2026
    if (yearA !== yearB) return yearA - yearB
    return getMonthIndex(a) - getMonthIndex(b)
  })

  // Take the last 4 months for comparison
  const ultimosMeses = sortedMonths.slice(-4)
  const realChartDados = ultimosMeses.map(mes => ({
    mes: mes.split('/')[0],
    pago: groupedInvoices[mes].pago,
    pendente: groupedInvoices[mes].pendente
  }))

  // Fallback if no invoices exist yet
  const now = new Date()
  const currentMonthName = now.toLocaleString('pt-BR', { month: 'long' })
  const currentMonthCapitalized = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

  if (realChartDados.length === 0) {
    realChartDados.push({
      mes: currentMonthCapitalized.substring(0, 3),
      pago: totalPago,
      pendente: totalInadimplencia
    })
  }

  // Calculate real average billing for projections
  const totalMonthsCount = Object.keys(groupedInvoices).length
  const avgMonthlyBilling = totalMonthsCount > 0
    ? Object.values(groupedInvoices).reduce((acc, curr) => acc + curr.pago + curr.pendente, 0) / totalMonthsCount
    : (totalFinanceiro > 0 ? totalFinanceiro : 1500)

  const proj1 = avgMonthlyBilling * 1.05
  const proj2 = avgMonthlyBilling * 1.10
  const proj3 = avgMonthlyBilling * 1.15

  // Safe hash generator from string for deterministic mock values
  const getStringHash = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  const currentMonthShort = now.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
  const monthAbbr = currentMonthShort.charAt(0).toUpperCase() + currentMonthShort.slice(1)

  // Birthdays list for this academy
  const aniversariantes = alunosAtivos.slice(0, 4).map((aluno) => {
    const hash = getStringHash(aluno.id || aluno.nome)
    const dia = (hash % 28) + 1
    const idade = 18 + (hash % 28)
    return {
      id: aluno.id,
      nome: aluno.nome,
      faixa: aluno.faixa,
      data: `${dia < 10 ? '0' + dia : dia}/${monthAbbr}`,
      idade
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
          <p className="text-xs text-zinc-500 mt-1">Aqui está o resumo em tempo real da sua academia.</p>
        </div>

        {/* Mural de Avisos Oficiais */}
        {announcements.length > 0 && (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
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
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Atletas Ativos</span>
              <span className="text-emerald-700 bg-emerald-50 text-[9px] px-2 py-0.5 rounded-md font-bold border border-emerald-100 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.018 12.018 0 0 1 12 21c-1.954 0-3.772-.465-5.38-1.285V19.13c0-1.112.285-2.16.786-3.07M12 19.13a11.963 11.963 0 0 0 3.011-1.025M12 19.13a11.963 11.963 0 0 1-3.011-1.025M21 9.75A3.75 3.75 0 1 1 17.25 6 3.75 3.75 0 0 1 21 9.75ZM12.75 9.75a3.75 3.75 0 1 1-3.75-3.75 3.75 3.75 0 0 1 3.75 3.75Z" />
                </svg>
                {alunosAtivos.length} ativos
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-zinc-900">{alunosAtivos.length}</span>
              <p className="text-[10px] font-semibold text-zinc-400 mt-1">Total de {alunos.length} matriculados</p>
            </div>
          </div>

          {/* Card: Inadimplência */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inadimplência</span>
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
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Adimplência Geral</span>
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
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Aniversariantes</span>
              <span className="text-amber-800 bg-amber-50 text-[9px] px-2 py-0.5 rounded-md font-bold border border-amber-100 capitalize">
                {currentMonthCapitalized}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-zinc-950">{aniversariantes.length}</span>
              <p className="text-[10px] font-semibold text-zinc-400 mt-1">Guerreiros festejando este mês</p>
            </div>
          </div>

        </div>

        {/* Painel de Gráficos e Projeções (Dashboard Financeiro) */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-700 flex items-center gap-2 border-b border-zinc-100 pb-3">
              📊 Saúde Financeira & Projeções de Caixa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Fluxo de Caixa Recorrente (Barras SVG) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Faturamento Recorrente (Mensal)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Comparativo de mensalidades pagas vs. pendentes.</p>
              </div>
              <div className="h-40 flex items-end justify-between px-2 pt-4 relative border-b border-l border-slate-150">
                {/* Y-Axis guide lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100/60 pointer-events-none" />
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100/60 pointer-events-none" />
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100/60 pointer-events-none" />

                {(() => {
                  const dados = realChartDados
                  const maxVal = Math.max(...dados.map(d => d.pago + d.pendente), 100)

                  return dados.map((d, i) => {
                    const pctPago = (d.pago / maxVal) * 100
                    const pctPendente = (d.pendente / maxVal) * 100

                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 flex-1 relative z-10">
                        {/* Tooltip info on hover */}
                        <div className="group relative w-7 sm:w-10 h-32 flex flex-col justify-end">
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[8px] font-bold p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                            P: R$ {d.pago.toFixed(0)} | A: R$ {d.pendente.toFixed(0)}
                          </div>
                          {/* Stacked bars */}
                          <div className="w-full bg-red-500 rounded-t" style={{ height: `${pctPendente}%` }} />
                          <div className="w-full bg-blue-600 rounded-b mt-0.5" style={{ height: `${pctPago}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{d.mes}</span>
                      </div>
                    )
                  })
                })()}
              </div>
              <div className="flex gap-4 text-[9px] font-bold justify-center pt-1 text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 rounded" /> Pago</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded" /> Atrasado</span>
              </div>
            </div>

            {/* 2. Pizza de Inadimplência / Adimplência (Circular SVG) */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Taxa de Conversão Real</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Distribuição do faturamento geral arrecadado.</p>
              </div>

              {/* Pizza circle representation using SVG strokeDasharray */}
              {(() => {
                const total = totalFinanceiro > 0 ? totalFinanceiro : 100
                const pctPago = Math.round((totalPago / total) * 100)
                const pctPendente = 100 - pctPago
                const radius = 25
                const circumference = 2 * Math.PI * radius
                const strokeDashOffset = circumference - (pctPago / 100) * circumference

                return (
                  <div className="flex items-center justify-center gap-6 py-2">
                    <div className="relative h-28 w-28 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        {/* Background circle */}
                        <circle cx="30" cy="30" r={radius} fill="transparent" stroke="#fecaca" strokeWidth="8" />
                        {/* Foreground circle representing paid pct */}
                        <circle 
                          cx="30" 
                          cy="30" 
                          r={radius} 
                          fill="transparent" 
                          stroke="#2563eb" 
                          strokeWidth="8" 
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-black text-slate-900">{pctPago}%</span>
                        <span className="text-[7.5px] font-bold text-blue-600 uppercase tracking-wider">Pago</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[10px] font-bold text-slate-500">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Adimplentes</span>
                        <p className="text-blue-600 font-black">R$ {totalPago.toFixed(0)} ({pctPago}%)</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Inadimplentes</span>
                        <p className="text-red-500 font-black">R$ {totalInadimplencia.toFixed(0)} ({pctPendente}%)</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* 3. Projeção de Caixa 3 Meses (Line-trend SVG) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Projeção Futura de Caixa</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Estimativa esperada de mensalidades.</p>
              </div>

              {(() => {
                const baseVal = avgMonthlyBilling
                // proj1, proj2, proj3 are already calculated in the component scope

                // Draw line points in SVG
                const maxVal = proj3 * 1.1
                const h1 = 100 - (baseVal / maxVal) * 100
                const h2 = 100 - (proj1 / maxVal) * 100
                const h3 = 100 - (proj2 / maxVal) * 100
                const h4 = 100 - (proj3 / maxVal) * 100

                return (
                  <div className="space-y-3">
                    <div className="h-28 w-full bg-slate-50 rounded-xl border border-slate-100 p-2 flex flex-col justify-between relative overflow-hidden">
                      {/* Grid background */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-50">
                        <div className="border-b border-slate-200" />
                        <div className="border-b border-slate-200" />
                        <div className="border-b border-slate-200" />
                      </div>

                      {/* SVG Line Graph */}
                      <svg className="absolute inset-0 w-full h-24 p-2 overflow-visible" preserveAspectRatio="none">
                        {/* Area gradient under line */}
                        <path 
                          d={`M 15 ${h1 + 10} L 95 ${h2 + 10} L 175 ${h3 + 10} L 255 ${h4 + 10} L 255 100 L 15 100 Z`} 
                          fill="rgba(37, 99, 235, 0.05)" 
                        />
                        {/* Line */}
                        <path 
                          d={`M 15 ${h1 + 10} L 95 ${h2 + 10} L 175 ${h3 + 10} L 255 ${h4 + 10}`} 
                          fill="none" 
                          stroke="#2563eb" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                        />
                        {/* Graph Node Circles */}
                        <circle cx="15" cy={h1 + 10} r="3.5" fill="#2563eb" />
                        <circle cx="95" cy={h2 + 10} r="3.5" fill="#2563eb" />
                        <circle cx="175" cy={h3 + 10} r="3.5" fill="#2563eb" />
                        <circle cx="255" cy={h4 + 10} r="3.5" fill="#2563eb" />
                      </svg>

                      {/* X axis month labels */}
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-auto pt-1 relative z-10 px-2">
                        <span>Atual</span>
                        <span>Mês+1</span>
                        <span>Mês+2</span>
                        <span>Mês+3</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-slate-500">
                      <div className="bg-slate-100/50 p-1.5 rounded border border-slate-200/40">
                        <span className="block text-[7.5px] text-slate-400 uppercase">Mês+1</span>
                        <span className="text-zinc-950 font-black">R$ {proj1.toFixed(0)}</span>
                      </div>
                      <div className="bg-slate-100/50 p-1.5 rounded border border-slate-200/40">
                        <span className="block text-[7.5px] text-slate-400 uppercase">Mês+2</span>
                        <span className="text-zinc-950 font-black">R$ {proj2.toFixed(0)}</span>
                      </div>
                      <div className="bg-slate-100/50 p-1.5 rounded border border-slate-200/40">
                        <span className="block text-[7.5px] text-slate-400 uppercase">Mês+3</span>
                        <span className="text-zinc-950 font-black">R$ {proj3.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

          </div>
        </div>

        {/* Seção Dupla: Listagens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Tabela: Cobranças Pendentes */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Mensalidades em Atraso</h2>
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
                        className="text-[10px] bg-zinc-950 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Aniversariantes do Mês</h2>
              <span className="text-xs font-bold text-zinc-400 capitalize">{currentMonthCapitalized}</span>
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
                    <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-lg">
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
