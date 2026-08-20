// app/dashboard/onboarding/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, User, Academy } from '../../lib/db'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Step 1: Academia
  const [academyName, setAcademyName] = useState('')
  const [professorGrade, setProfessorGrade] = useState('Faixa Preta 1º Grau')
  const [mensalidade, setMensalidade] = useState('150,00')
  const [diaVencimento, setDiaVencimento] = useState('10')

  // Step 2: Primeiro horário
  const [horario, setHorario] = useState('19:00')
  const [classTitle, setClassTitle] = useState('Jiu-Jitsu Adulto')

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (!loggedUser) {
      router.push('/login')
      return
    }
    setUser(loggedUser)
    
    // Buscar academia
    supabase
      .from('academies')
      .select('*')
      .eq('id', loggedUser.academyId)
      .single()
      .then(({ data }) => {
        if (data) {
          setAcademy(data as any)
          setAcademyName(data.name || '')
          setMensalidade(data.mensalidade_padrao || '150,00')
          setDiaVencimento(data.dia_vencimento || '10')
          if (data.professor_grade) setProfessorGrade(data.professor_grade)
        }
        setIsLoading(false)
      })
  }, [])

  const [referralCodeInput, setReferralCodeInput] = useState('')

  const handleSaveStep1 = async () => {
    if (!user || !academyName) return
    setIsSaving(true)
    try {
      // Gerar um código único para esta academia se não existir
      let myCode = academy?.referralCode
      if (!myCode) {
        myCode = 'JP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString().slice(-4)
      }

      let validReferrerCode = null

      // Se usuário digitou um código, validar se ele existe
      if (referralCodeInput.trim()) {
        const { data: referrer, error: refErr } = await supabase
          .from('academies')
          .select('id, free_months')
          .eq('referral_code', referralCodeInput.trim().toUpperCase())
          .single()

        if (referrer) {
          validReferrerCode = referralCodeInput.trim().toUpperCase()
          // Dar 1 mês grátis para a academia que indicou
          await supabase
            .from('academies')
            .update({ free_months: (referrer.free_months || 0) + 1 })
            .eq('id', referrer.id)
        } else {
          alert('Código de indicação inválido ou não encontrado. O cadastro continuará sem ele.')
        }
      }

      const { error } = await supabase
        .from('academies')
        .update({
          name: academyName,
          professor_grade: professorGrade,
          mensalidade_padrao: mensalidade,
          dia_vencimento: diaVencimento,
          referral_code: myCode,
          referred_by_code: validReferrerCode
        })
        .eq('id', user.academyId)

      if (error) throw error

      // Atualizar cache local
      db.syncWithSupabase(user.academyId)
      setStep(2)
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveStep2 = async () => {
    if (!user || !horario || !classTitle) return
    setIsSaving(true)
    try {
      // Inserir primeiro horário de treino no Supabase
      const { error } = await supabase
        .from('class_sessions')
        .insert({
          id: `class-${Date.now()}`,
          academy_id: user.academyId,
          horario,
          title: classTitle
        })

      if (error) throw error

      setStep(3)
    } catch (err: any) {
      alert(`Erro ao salvar horário: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-xs font-bold text-slate-400">Carregando formulário inicial...</div>
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center shadow-md border-r-4 border-red-500">
            <span className="text-white font-black text-lg italic">JP</span>
          </div>
          <h1 className="mt-4 text-xl font-bold">Configuração Inicial</h1>
          <p className="text-xs text-zinc-400 mt-1">Configure sua nova academia de Jiu-Jitsu no JiuPro</p>
        </div>

        {/* Progresso de Steps */}
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-3">
          <span className={step === 1 ? 'text-red-600' : ''}>1. Academia</span>
          <span>•</span>
          <span className={step === 2 ? 'text-red-600' : ''}>2. Primeira Turma</span>
          <span>•</span>
          <span className={step === 3 ? 'text-red-600' : ''}>3. Pagamentos</span>
        </div>

        {/* STEP 1: DADOS DA ACADEMIA */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome da Academia</label>
              <input
                type="text"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sua Faixa/Graduação do Mestre</label>
              <input
                type="text"
                value={professorGrade}
                onChange={(e) => setProfessorGrade(e.target.value)}
                placeholder="Ex: Faixa Preta 2º Grau"
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mensalidade Padrão</label>
                <input
                  type="text"
                  value={mensalidade}
                  onChange={(e) => setMensalidade(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Dia Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Código de Indicação (Opcional)</label>
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                placeholder="Ex: JP-A7B2-1234"
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
              />
              <p className="text-[9px] text-zinc-400 mt-1">Se foi indicado por outra academia, insira o código aqui.</p>
            </div>
            <button
              onClick={handleSaveStep1}
              disabled={isSaving || !academyName}
              className="w-full py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-lg shadow hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Próximo Passo ➔'}
            </button>
          </div>
        )}

        {/* STEP 2: CADASTRO DO PRIMEIRO TREINO */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-[11px] text-zinc-500">Crie o primeiro horário de aulas para que os alunos possam fazer check-in.</p>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Horário da Aula</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome da Turma / Treino</label>
              <input
                type="text"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 text-slate-900 font-medium"
              />
            </div>
            <button
              onClick={handleSaveStep2}
              disabled={isSaving}
              className="w-full py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-lg shadow hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Próximo Passo ➔'}
            </button>
          </div>
        )}

        {/* STEP 3: CONFIGURAR STRIPE / PIX */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">💳</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Sua academia está pronta para começar! Para receber pagamentos no cartão de crédito direto na sua conta bancária, lembre-se de configurar a integração com a **Stripe** nas configurações do sistema.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
            >
              🥋 Entrar no Dashboard
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
