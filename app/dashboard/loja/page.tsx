// app/dashboard/loja/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, User, Product, Sale, Student } from '../../lib/db'

export default function LojaPage() {
  const router = useRouter()
  
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [students, setStudents] = useState<Student[]>([])

  // Form states - Venda
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')

  // Form states - Novo Produto
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductStock, setNewProductStock] = useState('10')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  const loadData = (academyId: string) => {
    const pList = db.getProducts(academyId)
    setProducts(pList)

    const sList = db.getSales(academyId)
    setSales(sList)

    const athleteList = db.getStudents(academyId)
    setStudents(athleteList)

    if (athleteList.length > 0 && !selectedStudentId) setSelectedStudentId(athleteList[0].id)
    if (pList.length > 0 && !selectedProductId) setSelectedProductId(pList[0].id)

    setIsPageLoading(false)
  }

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (!loggedUser) {
      router.push('/login')
      return
    }
    setUser(loggedUser)
    loadData(loggedUser.academyId)
  }, [])

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user) return
    if (!selectedStudentId || !selectedProductId) {
      setError('Por favor, selecione o atleta e o produto.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      try {
        db.recordSale(user.academyId, selectedStudentId, selectedProductId)
        setSuccess('Venda registrada com sucesso e estoque atualizado!')
        loadData(user.academyId)
        setIsLoading(false)
      } catch (err: any) {
        setError(err.message || 'Erro ao registrar venda.')
        setIsLoading(false)
      }
    }, 500)
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newProductName || !newProductPrice) return
    setError('')
    setSuccess('')

    try {
      db.addProduct(
        user.academyId,
        newProductName,
        newProductPrice,
        parseInt(newProductStock) || 0
      )
      setSuccess(`Produto "${newProductName}" cadastrado com sucesso!`)
      setNewProductName('')
      setNewProductPrice('')
      setNewProductStock('10')
      setShowAddProduct(false)
      loadData(user.academyId)
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar produto.')
    }
  }

  const handleQuickStock = (productId: string, delta: number) => {
    if (!user) return
    db.updateProductStock(user.academyId, productId, delta)
    loadData(user.academyId)
  }

  const handleExportStockPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()
      doc.text('Relatório de Reposição de Estoque — JiuPro', 14, 15)
      doc.setFontSize(10)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 22)

      const headers = [['Produto / Item', 'Preço Unitário (R$)', 'Qtd em Estoque', 'Status de Reposição']]
      const rows = products.map(p => [
        p.nome,
        `R$ ${p.preco}`,
        `${p.estoque} un`,
        p.estoque === 0 ? 'CRÍTICO: ESGOTADO' : p.estoque <= 5 ? 'ATENÇÃO: REPOR' : 'ESTOQUE EM DIA'
      ])

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27] }
      })

      doc.save(`jiupro_reposicao_estoque_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err: any) {
      console.error(err)
      alert('Erro ao gerar PDF de estoque.')
    }
  }

  if (isPageLoading) {
    return <div className="text-xs font-semibold text-slate-400">Carregando cantina...</div>
  }

  const lowStockItems = products.filter(p => p.estoque <= 5)
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.valor.replace('.', '').replace(',', '.')) || 0), 0)

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Loja & Cantina</h1>
          <p className="text-xs text-zinc-500 mt-1">Gerencie a venda de uniformes, patches e itens da cantina da academia.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportStockPDF}
            className="text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Relatório de Compras (PDF)
          </button>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 px-3.5 py-2 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {showAddProduct ? 'Fechar Cadastro' : '+ Novo Produto'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100 font-bold">
          {success}
        </div>
      )}

      {/* Cards de Métricas da Loja */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total de Itens</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950">{products.length}</span>
            <span className="text-xs text-zinc-400 font-medium">produtos ativos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Itens em Alerta / Reposição</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-xs text-zinc-400 font-medium">com estoque ≤ 5 un</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Faturado</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              R$ {totalSalesRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Form de Cadastro de Novo Produto (Expansível) */}
      {showAddProduct && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-zinc-100 pb-2">
            Cadastrar Novo Produto na Cantina
          </h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome do Produto</label>
              <input
                type="text"
                required
                placeholder="Ex: Kimono Trançado Branco A2"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 font-medium text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Preço (R$)</label>
              <input
                type="text"
                required
                placeholder="390,00"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 font-medium text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Estoque Inicial</label>
              <input
                type="number"
                required
                min="0"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 font-medium text-zinc-900"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventário / Produtos (Col-span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800">Controle de Estoque & Reposição</h2>
              <span className="text-[10px] text-zinc-400 font-semibold">{products.length} itens cadastrados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-400 uppercase tracking-wider text-[9px]">
                    <th className="p-4">Item / Produto</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4 text-center">Quantidade</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Repor Estoque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map((p) => {
                    const isLowStock = p.estoque <= 5
                    const isOut = p.estoque === 0
                    
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/40 transition-colors">
                        <td className="p-4 font-bold text-zinc-900">{p.nome}</td>
                        <td className="p-4 font-bold text-zinc-900">R$ {p.preco}</td>
                        <td className="p-4 text-center font-bold text-zinc-700">
                          <span className={isOut ? 'text-rose-600 font-black' : isLowStock ? 'text-amber-600 font-black' : ''}>
                            {p.estoque} un
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${
                            isOut 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : isLowStock 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {isOut ? 'Esgotado' : isLowStock ? 'Estoque Baixo' : 'Em Dia'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickStock(p.id, -1)}
                              disabled={p.estoque === 0}
                              title="Diminuir 1 unidade"
                              className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[10px] font-bold disabled:opacity-30"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleQuickStock(p.id, 5)}
                              title="Adicionar 5 unidades"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleQuickStock(p.id, 10)}
                              title="Adicionar 10 unidades"
                              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[10px] font-bold"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico de Vendas Recentes */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800">Faturamento da Cantina (Vendas Recentes)</h2>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-400 uppercase tracking-wider text-[9px]">
                    <th className="p-4">Data / Hora</th>
                    <th className="p-4">Atleta</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-zinc-50/30">
                        <td className="p-4 text-zinc-500">
                          {new Date(sale.data).toLocaleDateString('pt-BR')} — {new Date(sale.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 font-semibold text-zinc-900">{sale.studentName}</td>
                        <td className="p-4 text-zinc-700">{sale.productName}</td>
                        <td className="p-4 text-right font-bold text-zinc-950">R$ {sale.valor}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-zinc-400">Nenhuma venda registrada recentemente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lançador de Vendas (Col-span 1) */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 h-fit space-y-4">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Registrar Nova Venda</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Registre compras efetuadas pelos alunos no caixa da academia.</p>
          </div>

          <form onSubmit={handleRecordSale} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Selecione o Atleta
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 text-slate-750 font-bold"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.nome} ({s.faixa})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Item comprado
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 text-slate-750 font-bold"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.estoque === 0}>
                    {p.nome} — R$ {p.preco} ({p.estoque === 0 ? 'Esgotado' : `${p.estoque} em estoque`})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || products.length === 0}
              className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                'Registrando venda...'
              ) : (
                <>
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Registrar Venda
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  )
}
