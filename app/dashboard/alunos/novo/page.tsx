// app/dashboard/alunos/novo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, User } from '../../../lib/db'

export default function NovoAlunoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados do formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [faixa, setFaixa] = useState('Branca')
  const [graus, setGraus] = useState('0')
  const [mensalidade, setMensalidade] = useState('150,00')
  const [dataMatricula, setDataMatricula] = useState(
    new Date().toISOString().split('T')[0] // Data de hoje por padrão
  )

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      // Load default monthly fee based on academy settings
      const academy = db.getAcademy(loggedUser.academyId)
      if (academy) {
        setMensalidade(academy.mensalidadePadrao)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    const novoAluno = {
      academyId: user.academyId,
      nome,
      email: email || `${nome.toLowerCase().replace(/\s+/g, '.')}@jiupro.com`,
      faixa,
      graus: Number(graus),
      status: 'Ativo' as const,
      dataMatricula,
      mensalidade,
      chavePix: `${user.email}`,
      graduadoPor: `${user.name} (${user.grade})`,
      mestreOriginal: 'Mestre Carlos Gracie Jr.'
    }
    
    db.saveStudent(novoAluno)

    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard/alunos')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-zinc-900">
      
      {/* Área do Formulário */}
      <main className="max-w-3xl mx-auto py-4">
        
        {/* Cabeçalho do formulário */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Matricular Novo Guerreiro</h1>
          <p className="text-sm text-zinc-500">Insira as informações do aluno para iniciar o controle de frequência e mensalidades.</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Linha Dupla: Nome e E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Nome Completo
                </label>
                <input 
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Gabriel Almeida Santos"
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  E-mail do Atleta
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: gabriel@email.com"
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Linha Dupla: Faixa e Graus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Graduação / Faixa
                </label>
                <select
                  value={faixa}
                  onChange={(e) => setFaixa(e.target.value)}
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
                  Graus na Faixa
                </label>
                <select
                  value={graus}
                  onChange={(e) => setGraus(e.target.value)}
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                >
                  <option value="0">Sem Graus</option>
                  <option value="1">1 Grau</option>
                  <option value="2">2 Graus</option>
                  <option value="3">3 Graus</option>
                  <option value="4">4 Graus</option>
                </select>
              </div>
            </div>

            {/* Linha Dupla: Mensalidade e Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Valor da Mensalidade (R$)
                </label>
                <div className="relative mt-1.5 rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-zinc-400 text-sm">R$</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={mensalidade}
                    onChange={(e) => setMensalidade(e.target.value)}
                    placeholder="150,00"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Data de Matrícula
                </label>
                <input 
                  type="date"
                  required
                  value={dataMatricula}
                  onChange={(e) => setDataMatricula(e.target.value)}
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Rodapé do formulário / Botões */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/alunos')}
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Finalizar Matrícula'}
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  )
}
