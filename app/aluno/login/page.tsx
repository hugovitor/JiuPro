// app/aluno/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { db } from '../../lib/db'

export default function AlunoLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 1. Query student directly from Supabase
      const { data: student, error: dbError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (dbError || !student) {
        // Fallback: check local storage (for offline/demo accounts)
        const localStudent = db.loginStudent(email, password)
        if (localStudent) {
          setIsLoading(false)
          router.push('/aluno')
          return
        }

        setIsLoading(false)
        setError('E-mail ou senha incorretos. A senha padrão de demonstração é 123456.')
        return
      }

      // 2. Validate password
      const dbPassword = student.password || '123456'
      if (dbPassword !== password) {
        setIsLoading(false)
        setError('Senha incorreta para o e-mail informado.')
        return
      }

      // 3. Load invoices, presence, etc. from Supabase to sync local storage cache
      const { data: invoices } = await supabase.from('invoices').select('*').eq('student_id', student.id)
      const { data: attendances } = await supabase.from('attendances').select('*').eq('student_id', student.id)
      const { data: tournaments } = await supabase.from('tournaments').select('*').eq('student_id', student.id)

      // Map to Student model structure
      const mappedStudent = {
        id: student.id,
        academyId: student.academy_id,
        nome: student.nome,
        email: student.email,
        faixa: student.faixa,
        graus: student.graus || 0,
        status: student.status,
        dataMatricula: student.data_matricula,
        mensalidade: student.mensalidade,
        chavePix: student.chave_pix,
        graduadoPor: student.graduado_por,
        mestreOriginal: student.mestre_original,
        password: student.password,
        peso: student.peso,
        altura: student.altura,
        badges: student.badges || [],
        financeiro: (invoices || []).map((inv: any) => ({
          mes: inv.mes,
          vencimento: inv.vencimento,
          valor: inv.valor,
          status: inv.status
        })),
        presencas: (attendances || []).map((att: any) => ({
          data: att.data,
          horario: att.horario,
          treino: att.treino
        })),
        tournaments: (tournaments || []).map((t: any) => ({
          id: t.id,
          campeonato: t.campeonato,
          data: t.data,
          categoria: t.categoria,
          resultado: t.resultado
        }))
      }

      // Save to local storage for local cache
      const localStudents = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
      const otherStudents = localStudents.filter((s: any) => s.id !== student.id)
      otherStudents.push(mappedStudent)
      localStorage.setItem('jiupro_students', JSON.stringify(otherStudents))

      // Also ensure academy is cached
      const { data: academyData } = await supabase.from('academies').select('*').eq('id', student.academy_id).single()
      if (academyData) {
        const localAcademies = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
        const otherAcademies = localAcademies.filter((a: any) => a.id !== student.academy_id)
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
      }

      // 4. Create session cookie and redirect
      document.cookie = `jiupro_student_session=${student.id}; path=/; max-age=86400; SameSite=Strict;`
      setIsLoading(false)
      router.push('/aluno')
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setError('Erro ao conectar com o banco de dados.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="h-11 w-11 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-xl italic tracking-tighter">JP</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">
            Portal do Aluno
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Acompanhe sua frequência e graus de treino
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              E-mail de acesso
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="atleta@gmail.com"
              className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors text-slate-900 font-medium"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Senha
              </label>
              <a href="/login/recuperar-senha" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors">
                Esqueceu a senha?
              </a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors text-slate-900 font-semibold"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 focus:outline-none transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Autenticando tatame...' : 'Entrar no Tatame'}
          </button>
        </form>

        <div className="space-y-3 pt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-wider">
              <span className="bg-white px-2.5 text-slate-400 font-bold">Demonstração</span>
            </div>
          </div>
          
          <div className="text-[10px] text-zinc-500 bg-zinc-50 rounded-xl p-3 border border-zinc-200 space-y-1">
            <p className="font-semibold text-zinc-700">Acessos de Teste:</p>
            <p>E-mail: <span className="font-mono font-bold text-red-600">carlos.silva@gmail.com</span></p>
            <p>Senha: <span className="font-mono font-bold text-red-600">123456</span></p>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400">
          Ainda não possui matrícula?{' '}
          <a href="/aluno/cadastro" className="font-bold text-red-600 hover:underline">
            Cadastre-se aqui
          </a>
        </p>

      </div>
    </main>
  )
}
