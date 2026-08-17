// app/dashboard/promocoes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, Student, User } from '../../lib/db'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alunoSelecionadoId) {
      alert('Por favor, selecione um atleta.')
      return
    }

    setIsLoading(true)

    // Save in Mock DB
    db.updateStudentBelt(alunoSelecionadoId, novaFaixa, novosGraus)

    setTimeout(() => {
      setIsLoading(false)
      alert(`Graduação de ${alunoAtual?.nome} atualizada com sucesso!`)
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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Troca de Faixa & Graus</h1>
        <p className="text-sm text-zinc-500">Registre a evolução técnica e conceda novas graduações aos seus atletas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário Principal (Ocupa 2 colunas no desktop) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Campo: Selecionar Aluno */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Selecionar Atleta
              </label>
              <select
                required
                value={alunoSelecionadoId}
                onChange={(e) => {
                  setAlunoSelecionadoId(e.target.value)
                  // Ao mudar o aluno, preenche o formulário com a faixa atual dele por padrão
                  const selecionado = listaAlunos.find(a => a.id === e.target.value)
                  if (selecionado) {
                    setNovaFaixa(selecionado.faixa)
                    setNovosGraus(selecionado.graus)
                  }
                }}
                className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors text-zinc-800"
              >
                <option value="">-- Escolha um aluno da lista --</option>
                {listaAlunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} (Faixa {aluno.faixa})
                  </option>
                ))}
              </select>
            </div>

            {/* Linha Dupla: Nova Faixa e Novos Graus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Nova Faixa
                </label>
                <select
                  value={novaFaixa}
                  onChange={(e) => setNovaFaixa(e.target.value)}
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                >
                  <option value="Branca">Branca</option>
                  <option value="Cinza">Cinza</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Laranja">Laranja</option>
                  <option value="Verde">Verde</option>
                  <option value="Azul">Azul</option>
                  <option value="Roxa">Roxa</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Preta">Preta 🥋</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Quantidade de Graus
                </label>
                <select
                  value={novosGraus}
                  onChange={(e) => setNovosGraus(Number(e.target.value))}
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                >
                  <option value={0}>Sem Graus</option>
                  <option value={1}>1 Grau</option>
                  <option value={2}>2 Graus</option>
                  <option value={3}>3 Graus</option>
                  <option value={4}>4 Graus</option>
                </select>
              </div>
            </div>

            {/* Campo: Data da Cerimônia / Homologação */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Data da Promoção
              </label>
              <input 
                type="date"
                required
                value={dataPromocao}
                onChange={(e) => setDataPromocao(e.target.value)}
                className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            {/* Ações */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Homologando...' : 'Confirmar Nova Graduação'}
              </button>
            </div>

          </form>
        </div>

        {/* Card Lateral Informativo / Resumo Visual (Ocupa 1 coluna) */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-sm text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
            Resumo Técnico
          </h2>
          
          {alunoAtual ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-400 font-medium uppercase">Atleta Selecionado</p>
                <p className="text-base font-bold text-zinc-950 mt-0.5">{alunoAtual.nome}</p>
              </div>
              
              <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                <div>
                  <p className="text-[11px] text-zinc-400 font-medium uppercase">Graduação Atual</p>
                  <p className="text-sm font-bold text-zinc-800 mt-0.5">Faixa {alunoAtual.faixa}</p>
                </div>
                <span className="text-xs font-semibold bg-zinc-200 px-2 py-0.5 rounded text-zinc-600">
                  {alunoAtual.graus}G
                </span>
              </div>

              <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-lg border border-red-100">
                <div>
                  <p className="text-[11px] text-red-700 font-semibold uppercase">Nova Graduação</p>
                  <p className="text-sm font-bold text-red-900 mt-0.5">Faixa {novaFaixa}</p>
                </div>
                <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                  {novosGraus}G
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-zinc-400">
              Selecione um guerreiro ao lado para visualizar a evolução técnica da graduação.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
