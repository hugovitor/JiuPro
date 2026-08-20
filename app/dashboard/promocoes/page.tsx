// app/dashboard/promocoes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, Student, User } from '../../lib/db'
import { IBJJF_BELTS, getMaxDegreesForBelt } from '../../lib/belts'
import BeltVisual from '../../components/BeltVisual'

export default function PromocoesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [listaAlunos, setListaAlunos] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Estados do formulário de promoção
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState('')
  const [novaFaixa, setNovaFaixa] = useState('Branca')
  const [novosGraus, setNovosGraus] = useState(0)
  const [dataPromocao, setDataPromocao] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      setListaAlunos(db.getStudents(loggedUser.academyId))
    }
    setIsPageLoading(false)
  }, [])

  // Encontra os dados do aluno atualmente selecionado para exibir um resumo na tela
  const alunoAtual = listaAlunos.find(a => a.id === alunoSelecionadoId)

  // Max degrees for the selected belt
  const maxDegrees = getMaxDegreesForBelt(novaFaixa)

  // Belt grouping
  const infantilBelts = IBJJF_BELTS.filter(b => b.category === 'Infantil')
  const adultoBelts = IBJJF_BELTS.filter(b => b.category === 'Adulto')
  const mestreBelts = IBJJF_BELTS.filter(b => b.category === 'Mestre')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alunoSelecionadoId) {
      alert('Por favor, selecione um atleta.')
      return
    }

    setIsLoading(true)

    // Save in DB
    db.updateStudentBelt(alunoSelecionadoId, novaFaixa, novosGraus)

    setTimeout(() => {
      setIsLoading(false)
      alert(`Graduação de ${alunoAtual?.nome} atualizada com sucesso para Faixa ${novaFaixa} (${novosGraus}º Grau)!`)
      router.push('/dashboard/alunos')
    }, 800)
  }

  if (isPageLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando tatame...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* Título da Seção */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Homologação de Graduações (IBJJF)</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Registre a evolução técnica e conceda novas faixas e graus aos seus atletas conforme o regulamento oficial da IBJJF.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário Principal (Ocupa 2 colunas no desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Campo: Selecionar Aluno */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Selecionar Atleta
              </label>
              <select
                required
                value={alunoSelecionadoId}
                onChange={(e) => {
                  setAlunoSelecionadoId(e.target.value)
                  const selecionado = listaAlunos.find(a => a.id === e.target.value)
                  if (selecionado) {
                    setNovaFaixa(selecionado.faixa)
                    setNovosGraus(selecionado.graus)
                  }
                }}
                className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950 font-bold text-zinc-900 transition-colors"
              >
                <option value="">-- Escolha um aluno da lista --</option>
                {listaAlunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} (Faixa {aluno.faixa} • {aluno.graus}ºG)
                  </option>
                ))}
              </select>
            </div>

            {/* Linha Dupla: Nova Faixa e Novos Graus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Nova Faixa Oficial (IBJJF)
                </label>
                <select
                  value={novaFaixa}
                  onChange={(e) => {
                    const belt = e.target.value
                    setNovaFaixa(belt)
                    const max = getMaxDegreesForBelt(belt)
                    if (novosGraus > max) setNovosGraus(max)
                  }}
                  className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950 font-bold text-zinc-900 transition-colors"
                >
                  <optgroup label="Adulto / Master (16+ anos)">
                    {adultoBelts.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Infantil / Juvenil (4 a 15 anos)">
                    {infantilBelts.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Mestres & Grandes Mestres">
                    {mestreBelts.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Quantidade de Graus
                </label>
                <select
                  value={novosGraus}
                  onChange={(e) => setNovosGraus(Number(e.target.value))}
                  className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950 font-bold text-zinc-900 transition-colors"
                >
                  {Array.from({ length: maxDegrees + 1 }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      {idx === 0 ? 'Sem Graus (0º)' : `${idx}º Grau`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo: Data da Cerimônia / Homologação */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Data da Cerimônia / Exame
              </label>
              <input 
                type="date"
                required
                value={dataPromocao}
                onChange={(e) => setDataPromocao(e.target.value)}
                className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950 font-medium text-zinc-900 transition-colors"
              />
            </div>

            {/* Ações */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoading ? 'Homologando...' : 'Confirmar e Homologar Graduação'}
              </button>
            </div>

          </form>
        </div>

        {/* Card Lateral Informativo / Resumo Visual (Ocupa 1 coluna) */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4 h-fit">
          <h2 className="font-bold text-xs text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
            Resumo Técnico & Pré-Visualização
          </h2>
          
          {alunoAtual ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Atleta Selecionado</p>
                <p className="text-sm font-bold text-zinc-950 mt-0.5">{alunoAtual.nome}</p>
              </div>
              
              {/* Graduação Atual */}
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-2">
                <p className="text-[9px] text-zinc-400 font-bold uppercase">Graduação Atual</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800">Faixa {alunoAtual.faixa}</span>
                  <span className="text-[10px] font-black bg-zinc-200 px-2 py-0.5 rounded text-zinc-700">
                    {alunoAtual.graus}ºG
                  </span>
                </div>
                <div className="pt-1 flex justify-center">
                  <BeltVisual belt={alunoAtual.faixa} degrees={alunoAtual.graus} size="md" showLabel={false} />
                </div>
              </div>

              {/* Nova Graduação */}
              <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-200 space-y-2">
                <p className="text-[9px] text-red-700 font-bold uppercase">Nova Graduação</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-950">Faixa {novaFaixa}</span>
                  <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded">
                    {novosGraus}ºG
                  </span>
                </div>
                <div className="pt-1 flex justify-center">
                  <BeltVisual belt={novaFaixa} degrees={novosGraus} size="md" showLabel={false} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-zinc-400 font-light">
              Selecione um atleta ao lado para visualizar o comparativo da graduação.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
