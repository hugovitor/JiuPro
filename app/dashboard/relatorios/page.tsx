// app/dashboard/relatorios/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, Student, User, Sale, Invoice } from '../../lib/db'

interface LedgerEntry {
  id: string
  data: string
  tipo: 'Mensalidade' | 'Cantina'
  descricao: string
  valor: number
}

export default function RelatoriosPage() {
  const [user, setUser] = useState<User | null>(null)
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'frequencia' | 'financeiro'>('frequencia')
  
  // Attendance & Churn states
  const [alunosSumidos, setAlunosSumidos] = useState<any[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [totalStudentsCount, setTotalStudentsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Finance states
  const [receitaMensalidades, setReceitaMensalidades] = useState(0)
  const [receitaCantina, setReceitaCantina] = useState(0)
  const [inadimplenciaValor, setInadimplenciaValor] = useState(0)
  const [inadimplentesList, setInadimplentesList] = useState<any[]>([])
  const [historicoMensal, setHistoricoMensal] = useState<{ mes: string, realizado: number, previsto: number }[]>([])
  
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      const allStudents = db.getStudents(loggedUser.academyId)
      setTotalStudentsCount(allStudents.length)
      
      // Calculate missing students
      const active = allStudents.filter(s => s.status === 'Ativo')
      setActiveCount(active.length)

      const missing = allStudents.map(s => {
        let daysAway = 10
        let last30Days = 0

        if (s.presencas.length > 0) {
          const lastPresence = new Date(s.presencas[0].data + 'T00:00:00')
          const today = new Date()
          const diffTime = Math.abs(today.getTime() - lastPresence.getTime())
          daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          last30Days = s.presencas.filter(p => new Date(p.data + 'T00:00:00') >= thirtyDaysAgo).length
        } else {
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
      }).filter(s => s.diasAfastado > 7)

      setAlunosSumidos(missing.sort((a, b) => b.diasAfastado - a.diasAfastado))

      // Finance calculations
      let paidInvoicesSum = 0
      let unpaidInvoicesSum = 0
      const localLedger: LedgerEntry[] = []
      const devedoresMap: Record<string, { nome: string, faixa: string, total: number, meses: string[] }> = {}

      allStudents.forEach(s => {
        s.financeiro.forEach((inv, idx) => {
          // Parse numerical value (handling R$ format)
          const cleanVal = parseFloat(inv.valor.replace('.', '').replace(',', '.')) || 0
          
          if (inv.status === 'Pago') {
            paidInvoicesSum += cleanVal
            // Add paid invoice to transactions log
            localLedger.push({
              id: `inv-${s.id}-${idx}`,
              data: new Date().toISOString().split('T')[0] + 'T10:00:00', // simulation date
              tipo: 'Mensalidade',
              descricao: `Mensalidade ${inv.mes} — Aluno: ${s.nome}`,
              valor: cleanVal
            })
          } else {
            unpaidInvoicesSum += cleanVal
            if (!devedoresMap[s.id]) {
              devedoresMap[s.id] = {
                nome: s.nome,
                faixa: s.faixa,
                total: 0,
                meses: []
              }
            }
            devedoresMap[s.id].total += cleanVal
            devedoresMap[s.id].meses.push(inv.mes)
          }
        })
      })

      const devList = Object.entries(devedoresMap).map(([id, info]) => ({
        id,
        ...info
      })).sort((a, b) => b.total - a.total)
      setInadimplentesList(devList)

      // Fetch Canteen sales
      const salesList = db.getSales(loggedUser.academyId)
      let canteenSalesSum = 0
      salesList.forEach((sale) => {
        const cleanVal = parseFloat(sale.valor.replace('.', '').replace(',', '.')) || 0
        canteenSalesSum += cleanVal
        
        localLedger.push({
          id: sale.id,
          data: sale.data,
          tipo: 'Cantina',
          descricao: `Venda Cantina: ${sale.productName} — Aluno: ${sale.studentName}`,
          valor: cleanVal
        })
      })

      setReceitaMensalidades(paidInvoicesSum)
      setReceitaCantina(canteenSalesSum)
      setInadimplenciaValor(unpaidInvoicesSum)
      
      // Sort ledger cronologically (descending)
      setLedgerEntries(localLedger.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))

      // Generate 6-month simulated revenue curve
      const mesesLabels = ['Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto']
      const hist = mesesLabels.map((mes, index) => {
        const base = (active.length || 15) * 150
        const fator = 0.75 + (index * 0.05)
        const realizado = index === 5 ? (paidInvoicesSum + canteenSalesSum) : Math.round(base * fator)
        const previsto = Math.round(base * 1.05)
        return { mes, realizado, previsto }
      })
      setHistoricoMensal(hist)
    }
    setIsLoading(false)
  }, [])

  const handleNotificarAluno = (nome: string) => {
    const mensagem = `Olá, ${nome}! Notamos que você está sumido dos treinos na JiuPro há alguns dias. O tatame está pronto para o seu retorno, estamos te esperando para o próximo treino! Oss.`
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  const handleCobrarInadimplente = (nome: string, total: number, meses: string[]) => {
    const mensagem = `Olá, ${nome}! Tudo bem? Consta em aberto no sistema a(s) mensalidade(s) de ${meses.join(', ')} no valor total de R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Você pode acertar na recepção da academia ou via PIX. Qualquer dúvida estamos à disposição! Oss.`
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  // Export functions to CSV format
  const handleExportFrequencyCSV = () => {
    const headers = ['Atleta', 'Faixa', 'Graus', 'Treinos (30 dias)', 'Tempo Afastado (dias)', 'Status de Risco']
    const rows = alunosSumidos.map(a => [
      a.nome,
      a.faixa,
      a.graus,
      a.ultimos30Dias,
      a.diasAfastado,
      a.status
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `jiupro_alunos_afastados_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportFrequencyPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      
      const doc = new jsPDF()
      doc.text('Relatório JiuPro — Alunos Sumidos (Risco de Evasão)', 14, 15)
      doc.setFontSize(10)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22)
      
      const headers = [['Atleta', 'Faixa', 'Graus', 'Treinos (30d)', 'Dias Afastado', 'Risco']]
      const rows = alunosSumidos.map(a => [
        a.nome,
        a.faixa,
        a.graus.toString(),
        a.ultimos30Dias.toString(),
        `${a.diasAfastado} dias`,
        a.status
      ])

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [9, 9, 11] }, // Zinc 950 color
      })

      doc.save(`jiupro_alunos_afastados_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar PDF.')
    }
  }

  const handleExportFinanceCSV = () => {
    const headers = ['Data', 'Tipo', 'Descricao', 'Valor (R$)']
    const rows = ledgerEntries.map(e => [
      new Date(e.data).toLocaleDateString('pt-BR'),
      e.tipo,
      e.descricao.replace(/,/g, ' '),
      e.valor.toFixed(2)
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `jiupro_caixa_transacoes_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportFinancePDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      
      const doc = new jsPDF()
      doc.text('Relatório JiuPro — Fluxo de Caixa', 14, 15)
      doc.setFontSize(10)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22)
      doc.text(`Faturamento Total: R$ ${faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 28)
      
      const headers = [['Data', 'Origem', 'Descrição', 'Valor']]
      const rows = ledgerEntries.map(e => [
        new Date(e.data).toLocaleDateString('pt-BR'),
        e.tipo,
        e.descricao,
        `R$ ${e.valor.toFixed(2)}`
      ])

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 34,
        theme: 'striped',
        headStyles: { fillColor: [9, 9, 11] },
      })

      doc.save(`jiupro_caixa_transacoes_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar PDF.')
    }
  }

  if (isLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando relatórios...</div>
  }

  // Filter transaction entries
  const filteredLedger = ledgerEntries.filter(entry => 
    entry.descricao.toLowerCase().includes(searchFilter.toLowerCase()) || 
    entry.tipo.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const faturamentoTotal = receitaMensalidades + receitaCantina
  const totalEstimado = faturamentoTotal + inadimplenciaValor
  const inadimplenciaPercent = totalEstimado > 0 ? Math.round((inadimplenciaValor / totalEstimado) * 100) : 0

  return (
    <div className="space-y-6">
      
      {/* Título da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Relatórios & Caixa</h1>
          <p className="text-xs text-zinc-500 mt-1">Estatísticas integradas de frequência, inadimplência e faturamento da cantina.</p>
        </div>

        {/* Abas */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-500 w-fit self-start sm:self-center">
          <button
            onClick={() => setActiveTab('frequencia')}
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'frequencia' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:text-zinc-800'}`}
          >
            Frequência & Evasão
          </button>
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'financeiro' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:text-zinc-800'}`}
          >
            Financeiro & Caixa
          </button>
        </div>
      </div>

      {/* ABA 1: FREQUÊNCIA E EVASÃO */}
      {activeTab === 'frequencia' && (
        <div className="space-y-6">
          {/* Cartões Rápidos de Frequência */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total de Atletas</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-zinc-950">{totalStudentsCount}</span>
                <span className="text-zinc-500 text-xs">Alunos registrados</span>
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
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Atletas Fielmente Ativos</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-emerald-600">{activeCount}</span>
                <span className="text-zinc-500 text-xs">Com status regular</span>
              </div>
            </div>
          </div>

          {/* Tabela de Alunos Sumidos do Tatame */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">Alunos Sumidos (Risco de Evasão)</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Atletas que reduziram a frequência de treinos.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportFrequencyCSV}
                  className="text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={handleExportFrequencyPDF}
                  className="text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span>Exportar PDF</span>
                </button>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 uppercase tracking-wider leading-none flex items-center">
                  Ação Recomendada
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Atleta</th>
                    <th className="p-4">Graduação</th>
                    <th className="p-4 text-center">Treinos (30 dias)</th>
                    <th className="p-4 text-center">Tempo Afastado</th>
                    <th className="p-4">Status de Risco</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-slate-700">
                  {alunosSumidos.length > 0 ? (
                    alunosSumidos.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-zinc-50/40 transition-colors">
                        <td className="p-4 font-semibold text-zinc-900">{aluno.nome}</td>
                        <td className="p-4">
                          Faixa {aluno.faixa} 
                          {aluno.graus > 0 && <span className="text-zinc-400 ml-1">({aluno.graus}G)</span>}
                        </td>
                        <td className="p-4 text-center font-medium">{aluno.ultimos30Dias}</td>
                        <td className="p-4 text-center font-bold text-zinc-900">{aluno.diasAfastado} dias</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            aluno.status === 'Crítico' 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {aluno.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleNotificarAluno(aluno.nome)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-zinc-950 text-white rounded-lg hover:bg-zinc-850 transition-colors shadow-sm cursor-pointer"
                          >
                            Resgatar Atleta (WhatsApp)
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400">
                        Nenhum aluno em risco de evasão detectado. Parabéns pela assiduidade dos atletas!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: FINANCEIRO E CAIXA */}
      {activeTab === 'financeiro' && (
        <div className="space-y-6">
          
          {/* Indicadores Chave de Faturamento */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Caixa Recebido</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-zinc-400">Mensalidades + Vendas Cantina</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Faturamento da Cantina</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">R$ {receitaCantina.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-zinc-400">Kimonos, faixas e suplementação</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Inadimplência Recorrente</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-600">R$ {inadimplenciaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-rose-600 text-xs font-bold font-mono">({inadimplenciaPercent}%)</span>
              </div>
              <p className="text-[10px] text-zinc-400">{inadimplentesList.length} aluno(s) em atraso</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Ticket Médio / LTV</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">
                  R$ {(activeCount > 0 ? receitaMensalidades / activeCount : 150).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">/ R$ {((activeCount > 0 ? receitaMensalidades / activeCount : 150) * 12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              </div>
              <p className="text-[10px] text-zinc-400">Mensalidade média / Valor Vitalício</p>
            </div>
          </div>

          {/* Gráfico de Evolução dos Últimos 6 Meses & Projeção de Caixa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico de Barras / Evolução */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Evolução de Faturamento (Últimos 6 Meses)</h3>
                  <p className="text-[11px] text-zinc-400">Comparativo entre faturamento realizado vs. previsto</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-zinc-950 inline-block" /> Realizado</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-zinc-300 inline-block" /> Meta Prevista</span>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="pt-4 flex items-end justify-between gap-3 h-48 px-2 border-b border-zinc-100">
                {historicoMensal.map((item, idx) => {
                  const maxVal = Math.max(...historicoMensal.map(h => Math.max(h.realizado, h.previsto)), 1)
                  const heightRealizado = Math.round((item.realizado / maxVal) * 100)
                  const heightPrevisto = Math.round((item.previsto / maxVal) * 100)

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-bold text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        R${(item.realizado / 1000).toFixed(1)}k
                      </span>
                      <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                        <div 
                          className="w-1/2 bg-zinc-250 hover:bg-zinc-300 rounded-t transition-all"
                          style={{ height: `${heightPrevisto}%` }}
                          title={`Previsto: R$ ${item.previsto}`}
                        />
                        <div 
                          className="w-1/2 bg-zinc-950 hover:bg-red-600 rounded-t transition-all"
                          style={{ height: `${heightRealizado}%` }}
                          title={`Realizado: R$ ${item.realizado}`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500">{item.mes.slice(0, 3)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Projeção de Fluxo de Caixa (30/60/90 Dias) */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-zinc-100 pb-3">
                  🔮 Projeção de Caixa Futuro
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">Estimativa de receitas com base nos {activeCount} atletas ativos.</p>
              </div>

              <div className="space-y-3 my-2">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Próximos 30 Dias</span>
                    <span className="text-xs text-zinc-600 font-medium">Ciclo mensal regular</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    + R$ {((activeCount || 15) * 150).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Próximos 60 Dias</span>
                    <span className="text-xs text-zinc-600 font-medium">Previsão acumulada</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    + R$ {((activeCount || 15) * 150 * 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Próximos 90 Dias (Trimestre)</span>
                    <span className="text-xs text-zinc-600 font-medium">Previsão trimestral</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    + R$ {((activeCount || 15) * 150 * 3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <span className="text-[9px] text-zinc-400 leading-tight block">
                * Estimativas calculadas com base no ticket padrão de mensalidade por aluno ativo.
              </span>
            </div>

          </div>

          {/* Painel de Recuperação de Inadimplência com WhatsApp */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-bold text-rose-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Painel de Inadimplência Ativa ({inadimplentesList.length} devedores)
                </h2>
                <p className="text-xs text-rose-700/80 mt-0.5">Cobrança ágil de mensalidades em atraso diretamente no WhatsApp.</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-rose-900 block">Total a Recuperar:</span>
                <span className="text-base font-black text-rose-600">
                  R$ {inadimplenciaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 font-bold uppercase tracking-wider text-zinc-400 text-[10px]">
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Graduação</th>
                    <th className="p-4">Meses Pendentes</th>
                    <th className="p-4">Valor Total</th>
                    <th className="p-4 text-right">Ação de Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-slate-700">
                  {inadimplentesList.length > 0 ? (
                    inadimplentesList.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/40 transition-colors">
                        <td className="p-4 font-bold text-zinc-900">{item.nome}</td>
                        <td className="p-4 text-zinc-500 font-medium">Faixa {item.faixa}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {item.meses.map((m: string, i: number) => (
                              <span key={i} className="bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-black text-rose-600">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleCobrarInadimplente(item.nome, item.total, item.meses)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.974-.94 4.053 4.053 0 0 0 .801-2.041C3.815 16.37 3 14.28 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                            </svg>
                            Cobrar WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-emerald-600 font-bold">
                        🎉 Excelente! Nenhuma mensalidade em atraso no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico Consolidado de Transações */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">Histórico de Entradas Recentes</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Todas as conciliações financeiras de planos e cantina.</p>
              </div>
              
              <div className="flex gap-2 w-full sm:max-w-md items-center">
                <input
                  type="text"
                  placeholder="Filtrar por nome ou item..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 transition-colors flex-1 font-semibold"
                />
                <button
                  onClick={handleExportFinanceCSV}
                  className="text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
                >
                  <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={handleExportFinancePDF}
                  className="text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
                >
                  <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Data Conciliação</th>
                    <th className="p-4">Origem</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-slate-700">
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-50/40 transition-colors">
                        <td className="p-4 text-zinc-500">
                          {new Date(entry.data).toLocaleDateString('pt-BR')} — {new Date(entry.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-[5px] text-[9px] font-bold border ${
                            entry.tipo === 'Mensalidade' 
                              ? 'bg-blue-50 text-blue-700 border-blue-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {entry.tipo}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">{entry.descricao}</td>
                        <td className="p-4 text-right font-bold text-slate-900">R$ {entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-400">
                        Nenhuma entrada de caixa correspondente aos filtros foi encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
