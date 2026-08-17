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

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  
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

    if (athleteList.length > 0) setSelectedStudentId(athleteList[0].id)
    if (pList.length > 0) setSelectedProductId(pList[0].id)

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
    }, 800)
  }

  if (isPageLoading) {
    return <div className="text-xs font-semibold text-slate-400">Carregando cantina...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Loja & Cantina</h1>
        <p className="text-xs text-zinc-500 mt-1">Gerencie a venda de uniformes, patches e itens da cantina da academia.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventário / Produtos (Col-span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">Controle de Estoque</h2>
              <span className="text-[10px] text-slate-400 font-semibold">{products.length} itens cadastrados</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-400 uppercase tracking-wide">
                  <th className="p-4">Item / Produto</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4 text-center">Quantidade em Estoque</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLowStock = p.estoque <= 5
                  const isOut = p.estoque === 0
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-semibold text-slate-900">{p.nome}</td>
                      <td className="p-4 font-bold text-slate-900">R$ {p.preco}</td>
                      <td className="p-4 text-center font-semibold text-slate-700">{p.estoque} unidades</td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                          isOut 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : isLowStock 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {isOut ? 'Esgotado' : isLowStock ? 'Estoque Baixo' : 'Em Dia'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Histórico de Vendas Recentes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">Faturamento da Cantina</h2>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-400 uppercase tracking-wide">
                    <th className="p-4">Data / Hora</th>
                    <th className="p-4">Atleta</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/30">
                        <td className="p-4 text-slate-500">
                          {new Date(sale.data).toLocaleDateString('pt-BR')} — {new Date(sale.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 font-semibold text-slate-900">{sale.studentName}</td>
                        <td className="p-4 text-slate-650">{sale.productName}</td>
                        <td className="p-4 text-right font-bold text-slate-950">R$ {sale.valor}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">Nenhuma venda registrada recentemente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lançador de Vendas (Col-span 1) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit space-y-4">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Registrar Nova Venda</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Registre compras efetuadas pelos alunos no caixa da academia.</p>
          </div>

          <form onSubmit={handleRecordSale} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
