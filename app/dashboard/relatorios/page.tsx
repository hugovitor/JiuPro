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
          }
        })
      })

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
    }
    setIsLoading(false)
  }, [])

  const handleNotificarAluno = (nome: string) => {
    const mensagem = `Olá, ${nome}! Notamos que você está sumido dos treinos na JiuPro há alguns dias. O tatame está pronto para o seu retorno, estamos te esperando para o próximo rolo! Oss.`
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
                  className="text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-250 px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  📥 Exportar CSV
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
          
          {/* Indicadores de Faturamento */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Caixa Líquido Recebido</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-zinc-400">Mensalidades Pagas + Vendas Cantina</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Faturamento da Cantina</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">R$ {receitaCantina.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-zinc-400">Venda física de uniformes e itens cantina</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Inadimplência Recorrente</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-600">R$ {inadimplenciaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-rose-600 text-xs font-bold font-mono">({inadimplenciaPercent}%)</span>
              </div>
              <p className="text-[10px] text-zinc-400">Mensalidades pendentes / em atraso</p>
            </div>
          </div>

          {/* Gráfico visual simples em CSS de Proporção de Caixa */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Proporção Receitas vs. Pendências</h3>
            
            <div className="space-y-2">
              <div className="w-full h-4 bg-rose-500 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-500"
                  style={{ width: `${100 - inadimplenciaPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Compensaçoes Recebidas ({100 - inadimplenciaPercent}%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Mensalidades em Atraso ({inadimplenciaPercent}%)</span>
              </div>
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
                  📥 Exportar CSV
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
