// app/aluno/cadastro/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { db } from '../../lib/db'
import { supabase } from '../../lib/supabase'

function AlunoCadastroContent() {
  const searchParams = useSearchParams()
  const academyIdParam = searchParams.get('academyId') || ''

  const [academies, setAcademies] = useState<any[]>([])
  const [selectedAcademyId, setSelectedAcademyId] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    // Carregar as academias ativas diretamente do Supabase
    const fetchAcademies = async () => {
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('*')
          .eq('status', 'Ativo')
        
        if (!error && data) {
          setAcademies(data)
          
          // Auto-selecionar pelo parâmetro ou escolher a primeira
          const match = data.find(a => a.id === academyIdParam)
          if (match) {
            setSelectedAcademyId(match.id)
          } else if (data.length > 0) {
            setSelectedAcademyId(data[0].id)
          }
        }
      } catch (err) {
        console.error('Erro ao buscar academias:', err)
      }
    }
    
    fetchAcademies()
  }, [academyIdParam])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedAcademyId) {
      setError('Por favor, selecione uma academia para se vincular.')
      return
    }

    if (password.length < 4) {
      setError('A senha deve conter no mínimo 4 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      // 1. Verificar se o e-mail já existe no Supabase
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (existingStudent) {
        setError('E-mail já cadastrado!')
        setIsLoading(false)
        return
      }

      // 2. Buscar a academia selecionada para herdar valores padrão
      const { data: academyData, error: acError } = await supabase
        .from('academies')
        .select('*')
        .eq('id', selectedAcademyId)
        .single()

      if (acError || !academyData) {
        setError('Academia selecionada inválida.')
        setIsLoading(false)
        return
      }

      const newStudentId = 'student-' + Date.now().toString()
      const defaultMonthlyFee = academyData.mensalidade_padrao || '150,00'
      const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())
      const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)
      const formattedDueDate = new Date(Date.now() + 86400000 * 5).toLocaleDateString('pt-BR')

      // 3. Cadastrar Aluno no Supabase
      // 3. Cadastrar Aluno no Supabase via API segura (bypassing RLS)
      const registerResponse = await fetch('/api/aluno/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student: {
            id: newStudentId,
            academy_id: selectedAcademyId,
            nome: nome,
            email: email,
            password: password,
            faixa: 'Branca',
            graus: 0,
            status: 'Ativo',
            data_matricula: new Date().toISOString().split('T')[0],
            mensalidade: defaultMonthlyFee,
            dia_vencimento: '10',
            chave_pix: academyData.owner_email,
            peso: '',
            altura: '',
            badges: []
          },
          invoice: {
            student_id: newStudentId,
            mes: capitalizedMonth,
            vencimento: formattedDueDate,
            valor: defaultMonthlyFee,
            status: 'Atrasado'
          }
        })
      })

      const registerResult = await registerResponse.json()
      if (!registerResponse.ok) {
        throw new Error(registerResult.error || 'Erro ao registrar atleta.')
      }

      // 5. Salvar na sessão local/cache do navegador para login imediato
      const mappedStudent = {
        id: newStudentId,
        academyId: selectedAcademyId,
        nome: nome,
        email: email,
        faixa: 'Branca',
        graus: 0,
        status: 'Ativo',
        dataMatricula: new Date().toISOString().split('T')[0],
        mensalidade: defaultMonthlyFee,
        chavePix: academyData.owner_email,
        graduadoPor: 'Auto-cadastro',
        mestreOriginal: academyData.owner_name,
        password: password,
        financeiro: [
          {
            mes: capitalizedMonth,
            vencimento: formattedDueDate,
            valor: defaultMonthlyFee,
            status: 'Atrasado'
          }
        ],
        presencas: [],
        tournaments: []
      }

      const localStudents = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
      localStudents.push(mappedStudent)
      localStorage.setItem('jiupro_students', JSON.stringify(localStudents))

      // Salvar academia no cache local
      const localAcademies = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
      const otherAcademies = localAcademies.filter((a: any) => a.id !== selectedAcademyId)
      otherAcademies.push({
        id: academyData.id,
        name: academyData.name,
        mensalidadePadrao: academyData.mensalidade_padrao,
        diaVencimento: academyData.dia_vencimento,
        whatsappTemplate: academyData.whatsapp_template,
        logoUrl: academyData.logo_url,
        ownerName: academyData.owner_name,
        ownerEmail: academyData.owner_email,
        plan: academyData.plan,
        status: academyData.status,
        stripeConnectId: academyData.stripe_connect_id
      })
      localStorage.setItem('jiupro_academies', JSON.stringify(otherAcademies))

      // 6. Criar cookie de sessão
      document.cookie = `jiupro_student_session=${newStudentId}; path=/; max-age=86400; SameSite=Lax;`
      
      setSuccess('Matrícula realizada com sucesso! Acessando tatame...')
      setTimeout(() => {
        router.push('/aluno')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao realizar matrícula no banco de dados.')
      setIsLoading(false)
    }
  }

  const activeAcademy = academies.find(a => a.id === selectedAcademyId)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center text-center">
          <div className="h-11 w-11 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">
            Matrícula de Atleta
          </h1>
          {activeAcademy ? (
            <p className="mt-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">
              🥋 {activeAcademy.name}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-400">
              Cadastre-se para acompanhar sua evolução técnica
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100 font-bold flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Academy Dropdown Selector - only if not hardcoded in parameter */}
          {!academyIdParam && academies.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selecione sua Academia
              </label>
              <select
                value={selectedAcademyId}
                onChange={(e) => setSelectedAcademyId(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-700 font-bold"
              >
                {academies.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Nome Completo
            </label>
            <input 
              type="text" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Carlos Gracie"
              className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              E-mail de Acesso
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ex: atleta@provedor.com"
              className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Senha
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Confirmar Senha
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950 text-slate-900 font-semibold"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 focus:outline-none transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
          >
            {isLoading ? 'Cadastrando no tatame...' : 'Concluir Matrícula'}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400">
          Já possui cadastro?{' '}
          <a href="/aluno/login" className="font-bold text-red-600 hover:underline">
            Faça login aqui
          </a>
        </p>

      </div>
    </main>
  )
}

export default function AlunoCadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-400">Acessando matrícula...</div>}>
      <AlunoCadastroContent />
    </Suspense>
  )
}
