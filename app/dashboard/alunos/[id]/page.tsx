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
  const [abaAtiva, setAbaAtiva] = useState<'financeiro' | 'presencas' | 'tradicao' | 'performance'>('financeiro')

  // Edit fields states
  const [isEditing, setIsEditing] = useState(false)
  const [editNome, setEditNome] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Inativo'>('Ativo')
  const [editMensalidade, setEditMensalidade] = useState('')
  const [editFaixa, setEditFaixa] = useState('')
  const [editGraus, setEditGraus] = useState(0)
  const [editGraduadoPor, setEditGraduadoPor] = useState('')
  const [editMestreOriginal, setEditMestreOriginal] = useState('')

  // Manual Attendance form states
  const [manualDate, setManualDate] = useState('')
  const [manualClass, setManualClass] = useState('')
  const [turmas, setTurmas] = useState<any[]>([])

  // Manual Invoice form states
  const [manualMes, setManualMes] = useState('Setembro/2026')
  const [manualVencimento, setManualVencimento] = useState('10/09/2026')
  const [manualValor, setManualValor] = useState('')

  // Weekday Presence counts helper
  const getWeekdayPresenceCounts = (presencas: any[]) => {
    const counts = { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0 }
    presencas.forEach(p => {
      const d = new Date(p.data + 'T00:00:00')
      const day = d.getDay()
      if (day === 1) counts.Seg++
      else if (day === 2) counts.Ter++
      else if (day === 3) counts.Qua++
      else if (day === 4) counts.Qui++
      else if (day === 5) counts.Sex++
      else if (day === 6) counts.Sáb++
    })
    return counts
  }

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
      // Initialize edit fields
      setEditNome(athlete.nome)
      setEditEmail(athlete.email)
      setEditStatus(athlete.status)
      setEditMensalidade(athlete.mensalidade)
      setEditFaixa(athlete.faixa)
      setEditGraus(athlete.graus)
      setEditGraduadoPor(athlete.graduadoPor)
      setEditMestreOriginal(athlete.mestreOriginal)
      
      setManualValor(athlete.mensalidade)

      // Fetch academy classes for manual presence dropdown
      const classList = db.getClasses(loggedUser.academyId)
      setTurmas(classList)
      if (classList.length > 0 && !manualClass) {
        setManualClass(classList[0].nome)
      } else if (!manualClass) {
        setManualClass('Treino Livre / Rolo')
      }
    } else {
      setAluno(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    setManualDate(new Date().toISOString().split('T')[0])
    loadData()
  }, [alunoId])

  // Save student modifications
  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aluno || !user) return

    const updatedStudent = {
      academyId: user.academyId,
      nome: editNome,
      email: editEmail,
      faixa: editFaixa,
      graus: editGraus,
      status: editStatus,
      mensalidade: editMensalidade,
      dataMatricula: aluno.dataMatricula,
      chavePix: athleteEmailAsPixKey(),
      graduadoPor: editGraduadoPor,
      mestreOriginal: editMestreOriginal,
      id: aluno.id
    }

    db.saveStudent(updatedStudent)
    setIsEditing(false)
    loadData()
  }

  const athleteEmailAsPixKey = () => {
    if (!aluno) return ''
    return aluno.chavePix
  }

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
    if (!aluno || !user) return
    const academy = db.getAcademy(user.academyId)
    const template = academy?.whatsappTemplate || 'Olá, {aluno}! Consta em aberto no JiuPro a mensalidade de {mes} (Vencimento: {vencimento}) no valor de R$ {valor}.\n\nVocê pode pagar via PIX.\nChave: {chavePix}\n\nObrigado! Oss.'
    
    const texto = template
      .replace(/{aluno}/g, aluno.nome)
      .replace(/{mes}/g, f.mes)
      .replace(/{vencimento}/g, f.vencimento)
      .replace(/{valor}/g, f.valor)
      .replace(/{chavePix}/g, aluno.chavePix)

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  // Manual Attendance register
  const handleLancarPresenca = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aluno) return
    db.addManualPresence(aluno.id, manualDate, manualClass)
    loadData()
    alert('Frequência lançada com sucesso!')
  }

  // Manual Invoice register
  const handleLancarFatura = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aluno) return
    db.addManualInvoice(aluno.id, manualMes, manualVencimento, manualValor)
    loadData()
    alert('Mensalidade lançada com sucesso!')
  }

  if (loading) {
    return <div className="text-xs font-semibold text-slate-400">Carregando ficha...</div>
  }

  if (!aluno) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar
        </button>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-zinc-400">
          Atleta não encontrado ou acesso não autorizado para esta unidade.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-size: 11px !important;
          }
          /* Hide sidebar, headers, back buttons, forms, actions, and tabs */
          aside, header, nav, button, .print\\:hidden, .flex.border-b, form, select, input {
            display: none !important;
          }
          /* Make container fit perfectly and remove borders */
          .space-y-6, .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-white {
            border: none !important;
            box-shadow: none !important;
          }
          /* Ensure specific tabs are forced to render print layout */
          .aba-print-container {
            display: block !important;
          }
          .print-only {
            display: block !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
      
      <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 print:hidden">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Voltar para a lista
      </button>

      {/* Cadastro inline editor / visual premium header */}
      {isEditing ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSalvarEdicao} className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              Editar Cadastro do Atleta
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome</label>
                <input 
                  type="text" 
                  value={editNome} 
                  onChange={(e) => setEditNome(e.target.value)} 
                  required
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">E-mail</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  required
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Faixa</label>
                <select 
                  value={editFaixa} 
                  onChange={(e) => setEditFaixa(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-700 font-bold"
                >
                  <option value="Branca">Branca</option>
                  <option value="Cinza">Cinza</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Laranja">Laranja</option>
                  <option value="Verde">Verde</option>
                  <option value="Azul">Azul</option>
                  <option value="Roxa">Roxa</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Preta">Preta</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Graus</label>
                <select 
                  value={editGraus} 
                  onChange={(e) => setEditGraus(Number(e.target.value))}
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-700 font-bold"
                >
                  <option value={0}>0 Graus</option>
                  <option value={1}>1 Grau</option>
                  <option value={2}>2 Graus</option>
                  <option value={3}>3 Graus</option>
                  <option value={4}>4 Graus</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mensalidade (R$)</label>
                <input 
                  type="text" 
                  value={editMensalidade} 
                  onChange={(e) => setEditMensalidade(e.target.value)} 
                  required
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-700 font-bold"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Graduado por</label>
                <input 
                  type="text" 
                  value={editGraduadoPor} 
                  onChange={(e) => setEditGraduadoPor(e.target.value)} 
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mestre Original</label>
                <input 
                  type="text" 
                  value={editMestreOriginal} 
                  onChange={(e) => setEditMestreOriginal(e.target.value)} 
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Cabeçalho com Visual Premium de Faixa */
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            
            {/* Tarja de graus estilizada de acordo com a faixa marcial */}
            <div className="h-14 w-14 bg-zinc-950 rounded-lg flex flex-col items-center justify-between py-1 border-b-[4px] border-red-600 shadow-inner overflow-hidden flex-shrink-0">
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

          <div className="flex items-center gap-2 self-start sm:self-center print:hidden">
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-all"
            >
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12-1.227H7.231c-.615 0-1.11-.497-1.12-1.227L6.34 18m11.318 0h-11.32" />
              </svg>
              Imprimir Ficha
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-all"
            >
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              Editar Cadastro
            </button>
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
              aluno.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
            }`}>
              ● {aluno.status}
            </span>
          </div>
        </div>
      )}

      {/* Navegação por Abas (Tabs) Expandida */}
      <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setAbaAtiva('financeiro')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${abaAtiva === 'financeiro' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 5.25h19.5m-19.5 0h19.5M2.25 15h19.5M2.25 15.75h19.5" />
          </svg>
          Painel Financeiro
        </button>
        <button
          onClick={() => setAbaAtiva('presencas')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${abaAtiva === 'presencas' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          Frequência
        </button>
        <button
          onClick={() => setAbaAtiva('tradicao')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${abaAtiva === 'tradicao' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          Linhagem & Tradição
        </button>
        <button
          onClick={() => setAbaAtiva('performance')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${abaAtiva === 'performance' ? 'border-red-600 text-slate-950' : 'border-transparent text-slate-400'}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.75a1.125 1.125 0 0 1-1.125-1.125V3.375c0-.621-.503-1.125-1.125-1.125h-1.5a1.125 1.125 0 0 0-1.125 1.125v3.375M16.5 18.75V15.75M12 3v1.5m0 3v1.5m0 3v1.5m-3-6h6m-6 3h6" />
          </svg>
          Desempenho & Torneios
        </button>
      </div>

      {/* Aba: Financeiro com Lançador Manual */}
      {abaAtiva === 'financeiro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabela de Mensalidades */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
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
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Baixa
                          </button>
                          <button
                            onClick={() => handleCobrancaWhatsapp(f)}
                            className="text-xs bg-slate-950 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center"
                          >
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                            </svg>
                            Cobrar PIX
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Lançador de Fatura Manual (Novo!) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Lançar Mensalidade</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Registre manualmente uma fatura de mensalidade em aberto.</p>
            </div>
            
            <form onSubmit={handleLancarFatura} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mês de Referência</label>
                <input 
                  type="text" 
                  value={manualMes} 
                  onChange={(e) => setManualMes(e.target.value)} 
                  required
                  placeholder="Ex: Setembro/2026"
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Data de Vencimento</label>
                <input 
                  type="text" 
                  value={manualVencimento} 
                  onChange={(e) => setManualVencimento(e.target.value)} 
                  required
                  placeholder="Ex: 10/09/2026"
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor (R$)</label>
                <input 
                  type="text" 
                  value={manualValor} 
                  onChange={(e) => setManualValor(e.target.value)} 
                  required
                  placeholder="150,00"
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-bold"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Lançar Fatura
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Aba: Presenças com Lançador Manual */}
      {abaAtiva === 'presencas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histórico de Presenças */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100 h-fit">
            {aluno.presencas.length > 0 ? (
              aluno.presencas.map((p, idx) => (
                <div key={idx} className="py-3 flex justify-between text-sm items-center hover:bg-slate-50/40 transition-colors rounded px-2">
                  <div>
                    <p className="font-semibold text-slate-900">{p.treino}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Frequência registrada: {p.horario}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-650 px-2.5 py-1 rounded-md">
                    {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-4 text-xs text-slate-400 text-center">Nenhum treino registrado.</p>
            )}
          </div>

          {/* Form Lançador de Presença Manual (Novo!) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Lançar Aula Manual</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Credite presenças fora do fluxo do aplicativo.</p>
            </div>

            <form onSubmit={handleLancarPresenca} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Data da Presença</label>
                <input 
                  type="date" 
                  value={manualDate} 
                  onChange={(e) => setManualDate(e.target.value)} 
                  required
                  className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Classe / Turma</label>
                {turmas.length > 0 ? (
                  <select
                    value={manualClass}
                    onChange={(e) => setManualClass(e.target.value)}
                    className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-750 font-bold"
                  >
                    {turmas.map((t) => (
                      <option key={t.id} value={t.nome}>{t.horario}h — {t.nome}</option>
                    ))}
                    <option value="Treino Livre / Rolo">Treino Livre / Rolo</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={manualClass} 
                    onChange={(e) => setManualClass(e.target.value)} 
                    required
                    placeholder="Ex: Treino Principal"
                    className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 transition-colors text-slate-900 font-semibold"
                  />
                )}
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Lançar Aula
              </button>
            </form>
          </div>
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

      {/* Aba: Desempenho e Torneios (Novo!) */}
      {abaAtiva === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Coluna 1: Métricas & Gráfico */}
          <div className="space-y-6">
            {/* Ficha Física */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3.5 h-fit">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0H4.5m15 0a3.75 3.75 0 1 1-7.5 0v-3a3.75 3.75 0 0 1 7.5 0v3Zm-15 0a3.75 3.75 0 1 1 7.5 0v-3a3.75 3.75 0 0 0-7.5 0v3Z" />
                </svg>
                Métricas Físicas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Peso</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{aluno.peso || '78'} kg</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Altura</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{aluno.altura || '1.75'} m</p>
                </div>
              </div>
            </div>

            {/* Gráfico de Assiduidade Semanal */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit print:break-inside-avoid">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                Assiduidade Semanal
              </h3>
              
              {(() => {
                const getWeekdayPresenceCounts = (presencas: any[]) => {
                  const counts = { 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0 };
                  presencas.forEach(p => {
                    const day = new Date(p.data + 'T00:00:00').getDay();
                    if (day === 1) counts['Seg']++;
                    if (day === 2) counts['Ter']++;
                    if (day === 3) counts['Qua']++;
                    if (day === 4) counts['Qui']++;
                    if (day === 5) counts['Sex']++;
                    if (day === 6) counts['Sáb']++;
                  });
                  return counts;
                };
                const weekdayCounts = getWeekdayPresenceCounts(aluno.presencas)
                const maxCount = Math.max(...Object.values(weekdayCounts), 1)
                const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                
                return (
                  <div className="grid grid-cols-6 gap-2 pt-2 items-end">
                    {days.map(d => {
                      const val = (weekdayCounts as any)[d]
                      const pct = Math.max(10, Math.round((val / maxCount) * 100))
                      return (
                        <div key={d} className="flex flex-col items-center gap-2">
                          <span className="text-[8px] font-bold text-slate-400">{val}x</span>
                          <div className="w-3.5 h-16 bg-slate-50 rounded-full flex flex-col justify-end overflow-hidden border border-slate-100">
                            <div 
                              className="w-full bg-gradient-to-t from-red-600 to-rose-500 rounded-full transition-all duration-500 shadow-sm"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-700">{d}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Quadro de Medalhas & Histórico de Campeonatos */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850">Histórico em Competições</h3>
              
              {/* Quadro rápido de contagem de medalhas */}
              <div className="flex gap-2">
                <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🥇 {aluno.tournaments?.filter(t => t.resultado === 'Ouro').length || 0}
                </span>
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🥈 {aluno.tournaments?.filter(t => t.resultado === 'Prata').length || 0}
                </span>
                <span className="text-[10px] bg-orange-50 border border-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🥉 {aluno.tournaments?.filter(t => t.resultado === 'Bronze').length || 0}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {aluno.tournaments && aluno.tournaments.length > 0 ? (
                aluno.tournaments.map((t) => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50/40 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.campeonato}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')} • {t.categoria}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.resultado === 'Ouro' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      t.resultado === 'Prata' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                      t.resultado === 'Bronze' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {t.resultado}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-xs text-slate-400">Nenhum torneio registrado para este atleta.</p>
              )}
            </div>
          </div>
          
        </div>
      )}

      {/* Print Signature block */}
      <div className="print-only mt-24 pt-8 border-t border-dashed border-slate-350 text-center space-y-4">
        <div className="flex justify-between px-12 text-[10px] text-slate-500 font-bold">
          <div>
            <div className="h-12" />
            <div className="border-t border-slate-400 w-48 mx-auto" />
            <p className="mt-1">Assinatura do Atleta</p>
          </div>
          <div>
            <div className="h-12" />
            <div className="border-t border-slate-400 w-48 mx-auto" />
            <p className="mt-1">Assinatura do Mestre / Instrutor</p>
          </div>
        </div>
      </div>

    </div>
  )
}
