// app/dashboard/alunos/novo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, User } from '../../../lib/db'
import { IBJJF_BELTS, getMaxDegreesForBelt } from '../../../lib/belts'
import BeltVisual from '../../../components/BeltVisual'

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

  const maxDegrees = getMaxDegreesForBelt(faixa)
  const infantilBelts = IBJJF_BELTS.filter(b => b.category === 'Infantil')
  const adultoBelts = IBJJF_BELTS.filter(b => b.category === 'Adulto')
  const mestreBelts = IBJJF_BELTS.filter(b => b.category === 'Mestre')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const academy = db.getAcademy(user.academyId)
    if (academy) {
      const totalStudents = db.getStudents(user.academyId).length
      if (academy.plan === 'Prata' && totalStudents >= 50) {
        alert('Limite atingido! O Plano Prata suporta até 50 atletas matriculados. Faça upgrade para o plano Ouro ou BlackBelt para continuar matriculando!')
        return
      }
      if (academy.plan === 'Ouro' && totalStudents >= 150) {
        alert('Limite atingido! O Plano Ouro suporta até 150 atletas matriculados. Faça upgrade para o plano BlackBelt para continuar matriculando!')
        return
      }
    }

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
          <p className="text-xs text-zinc-500 mt-1">Insira as informações do aluno conforme as diretrizes oficiais de graduação IBJJF.</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
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
                  className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-semibold text-zinc-900 transition-colors"
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
                  className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-semibold text-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Linha Dupla: Faixa e Graus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Graduação / Faixa Oficial (IBJJF)
                </label>
                <select
                  value={faixa}
                  onChange={(e) => {
                    const selected = e.target.value
                    setFaixa(selected)
                    const max = getMaxDegreesForBelt(selected)
                    if (Number(graus) > max) setGraus(String(max))
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Graus na Faixa
                </label>
                <select
                  value={graus}
                  onChange={(e) => setGraus(e.target.value)}
                  className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950 font-bold text-zinc-900 transition-colors"
                >
                  {Array.from({ length: maxDegrees + 1 }).map((_, idx) => (
                    <option key={idx} value={String(idx)}>
                      {idx === 0 ? 'Sem Graus (0º)' : `${idx}º Grau`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visualizer da Faixa selecionada */}
            <div className="bg-slate-50 p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Visualização da Faixa</span>
                <span className="text-xs font-bold text-zinc-800">Faixa {faixa} • {graus}º Grau</span>
              </div>
              <BeltVisual belt={faixa} degrees={Number(graus)} size="md" showLabel={false} />
            </div>

            {/* Linha Dupla: Mensalidade e Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Valor da Mensalidade (R$)
                </label>
                <div className="relative mt-1.5 rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-zinc-400 text-xs font-bold">R$</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={mensalidade}
                    onChange={(e) => setMensalidade(e.target.value)}
                    placeholder="150,00"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl placeholder-zinc-400 focus:outline-none focus:border-zinc-950 font-semibold text-zinc-900 transition-colors"
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
                  className="w-full px-3 py-2.5 mt-1.5 text-xs bg-slate-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-950 font-semibold text-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Matriculando...' : 'Concluir Matrícula'}
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  )
}
