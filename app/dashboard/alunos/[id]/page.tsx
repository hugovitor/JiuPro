// app/dashboard/alunos/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { db, Student, User, Invoice } from '../../../lib/db'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function FichaAlunoPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const alunoId = resolvedParams.id

  const [user, setUser] = useState<User | null>(null)
  const [aluno, setAluno] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<'financeiro' | 'presencas' | 'tradicao'>('financeiro')

  const loadData = () => {
    const loggedUser = db.getLoggedInUser()
    if (!loggedUser) {
      router.push('/login')
      return
    }
    setUser(loggedUser)

    const athlete = db.getStudent(alunoId)
    // Check tenant boundary
    if (athlete && athlete.academyId === loggedUser.academyId) {
      setAluno(athlete)
    } else {
      setAluno(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [alunoId])

  // Mark invoice as paid
  const handleDarBaixa = (invoiceIndex: number) => {
    if (!aluno) return
    const updatedInvoices = [...aluno.financeiro]
    updatedInvoices[invoiceIndex] = {
      ...updatedInvoices[invoiceIndex],
      status: 'Pago' as const
    }
    
    db.updateStudentInvoices(aluno.id, updatedInvoices)
    loadData()
  }

  // Disparar cobrança inteligente via WhatsApp
  const handleCobrancaWhatsapp = (f: Invoice) => {
    if (!aluno) return
    const texto = `Olá, ${aluno.nome}! Verificamos no sistema JiuPro que a mensalidade de ${f.mes} (Vencimento: ${f.vencimento}) no valor de R$ ${f.valor} consta em aberto.\n\nPara facilitar, você pode efetuar o pagamento via PIX.\nChave PIX: ${aluno.chavePix}\n\nApós o envio, o sistema dará a baixa automaticamente. Obrigado! Oss.`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  if (loading) {
    return <div className="text-xs font-semibold text-slate-400">Carregando ficha...</div>
  }

  if (!aluno) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          ← Voltar
        </button>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-zinc-400">
          Atleta não encontrado ou acesso não autorizado para esta unidade.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        ← Voltar para a lista
      </button>

      {/* Cabeçalho com Visual Premium de Faixa */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          
          {/* Tarja de graus estilizada de acordo com a faixa marcial */}
          <div className="h-14 w-14 bg-zinc-950 rounded-lg flex flex-col items-center justify-between py-1 border-b-[4px] border-red-600 shadow-inner overflow-hidden">
            <span className="text-white text-[8px] font-bold tracking-wider uppercase">{aluno.faixa}</span>
            {/* Representação visual dos graus em pequenas linhas brancas */}
            <div className="flex gap-0.5 justify-center mb-0.5">
              {Array.from({ length: aluno.graus }).map((_, i) => (
                <span key={i} className="w-1 h-2.5 bg-white rounded-sm block" />
              ))}
              {aluno.graus === 0 && <span className="text-[10px] text-zinc-500 font-bold">0G</span>}
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{aluno.nome}</h1>
            <p className="text-xs text-slate-400 font-medium">Matrícula realizada em {new Date(aluno.dataMatricula + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          aluno.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
        }`}>
          ● {aluno.status}
        </span>
      </div>

      {/* Navegação por Abas (Tabs) Expandida */}
      <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setAbaAtiva('financeiro')}
          className={`px-4 py-3 border-b-2 transition-all ${abaAtiva === 'financeiro' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          💳 Painel Financeiro
        </button>
        <button
          onClick={() => setAbaAtiva('presencas')}
          className={`px-4 py-3 border-b-2 transition-all ${abaAtiva === 'presencas' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          🥋 Frequência
        </button>
        <button
          onClick={() => setAbaAtiva('tradicao')}
          className={`px-4 py-3 border-b-2 transition-all ${abaAtiva === 'tradicao' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          📜 Linhagem & Tradição
        </button>
      </div>

      {/* Aba: Financeiro com Cobrador Ativo */}
      {abaAtiva === 'financeiro' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wide">
                <th className="p-4">Mês</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aluno.financeiro.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40">
                  <td className="p-4 font-semibold text-slate-900">{f.mes}</td>
                  <td className="p-4 text-slate-500">{f.vencimento}</td>
                  <td className="p-4 font-bold text-slate-900">R$ {f.valor}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                      f.status === 'Pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {f.status === 'Atrasado' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDarBaixa(idx)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                          ✓ Baixa
                        </button>
                        <button
                          onClick={() => handleCobrancaWhatsapp(f)}
                          className="text-xs bg-slate-950 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                        >
                          ⚡ Cobrar PIX
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Aba: Presenças */}
      {abaAtiva === 'presencas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
          {aluno.presencas.length > 0 ? (
            aluno.presencas.map((p, idx) => (
              <div key={idx} className="py-3 flex justify-between text-sm items-center">
                <div>
                  <p className="font-semibold text-slate-900">{p.treino}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Frequência registrada às {p.horario}</p>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          ) : (
            <p className="p-4 text-xs text-slate-400 text-center">Nenhum treino registrado.</p>
          )}
        </div>
      )}

      {/* Aba: Linhagem Tradicional */}
      {abaAtiva === 'tradicao' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instrutor Responsável</h3>
            <p className="text-sm font-semibold text-slate-800 mt-1">{aluno.graduadoPor}</p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Raiz / Linhagem de Mestre</h3>
            <p className="text-sm font-semibold text-slate-800 mt-1">{aluno.mestreOriginal}</p>
          </div>
        </div>
      )}

    </div>
  )
}
