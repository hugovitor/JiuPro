// app/login/recuperar-senha/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '../../lib/db'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<'admin' | 'aluno'>('admin')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      if (userType === 'admin') {
        const users = db.getUsers()
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase())
        if (!userExists) {
          setError('E-mail administrativo não encontrado.')
          setIsLoading(false)
          return
        }
      } else {
        // Look up in all students in database
        const students = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
        const studentExists = students.some((s: any) => s.email.toLowerCase() === email.toLowerCase())
        if (!studentExists) {
          setError('E-mail de atleta não encontrado.')
          setIsLoading(false)
          return
        }
      }

      setIsEmailSent(true)
      setIsLoading(false)
    }, 800)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const isStudent = userType === 'aluno'
      const updated = db.resetUserPassword(email, isStudent, newPassword)

      if (updated) {
        setSuccess('Senha redefinida com sucesso! Redirecionando...')
        setTimeout(() => {
          if (isStudent) {
            router.push('/aluno/login')
          } else {
            router.push('/login')
          }
        }, 1500)
      } else {
        setError('Ocorreu um erro ao atualizar a senha.')
        setIsLoading(false)
      }
    }, 800)
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
            Recuperar Senha
          </h1>
          <p className="mt-1 text-xs text-zinc-400 text-center">
            Defina uma nova senha para voltar aos treinos
          </p>
        </div>

        {/* Seleção do Perfil (só aparece antes de simular o envio) */}
        {!isEmailSent && (
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-500">
            <button
              type="button"
              onClick={() => { setUserType('admin'); setError(''); }}
              className={`flex-1 py-1.5 rounded-md transition-all ${userType === 'admin' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:text-zinc-800'}`}
            >
              Professor / Dono
            </button>
            <button
              type="button"
              onClick={() => { setUserType('aluno'); setError(''); }}
              className={`flex-1 py-1.5 rounded-md transition-all ${userType === 'aluno' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:text-zinc-800'}`}
            >
              Atleta / Aluno
            </button>
          </div>
        )}

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

        {/* FLUXO 1: Inserir Email */}
        {!isEmailSent && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                E-mail cadastrado
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ex: atleta@provedor.com"
                className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors text-slate-900 font-medium"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 rounded-lg shadow hover:bg-zinc-850 focus:outline-none transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? 'Verificando...' : 'Verificar E-mail'}
            </button>
          </form>
        )}

        {/* FLUXO 2: E-mail Confirmado, Mudar Senha */}
        {isEmailSent && !success && (
          <div className="space-y-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center space-y-2">
              <div className="h-8 w-8 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-zinc-950">E-mail verificado!</p>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Simulamos o envio do token de redefinição para <span className="font-semibold text-zinc-650">{email}</span>. Digite sua nova senha abaixo para atualizá-la agora:
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nova Senha
                </label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Confirmar Nova Senha
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 mt-1 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors text-slate-900 font-semibold"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Atualizando...' : 'Definir Nova Senha'}
              </button>
            </form>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => {
              if (userType === 'aluno') {
                router.push('/aluno/login')
              } else {
                router.push('/login')
              }
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar para Login
          </button>
        </div>

      </div>
    </main>
  )
}
