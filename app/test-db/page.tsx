'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TestDbPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'credentials_missing'>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const testConnection = async () => {
      const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const dbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setUrl(dbUrl || '')

      if (!dbUrl || !dbKey || dbKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        setStatus('credentials_missing')
        return
      }

      try {
        // Tenta buscar da tabela academies (mesmo que esteja vazia)
        const { error } = await supabase.from('academies').select('id').limit(1)
        if (error) {
          throw error
        }
        setStatus('success')
      } catch (err: any) {
        setErrorMessage(err.message || String(err))
        setStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200/80 shadow-lg p-6 space-y-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2 flex items-center gap-2">
          🔌 Diagnóstico do Supabase
        </h1>
        
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            URL do Banco: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] break-all">{url || 'Não configurada'}</code>
          </p>

          {status === 'checking' && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <span>⏳ Verificando conectividade...</span>
            </div>
          )}

          {status === 'credentials_missing' && (
            <div className="space-y-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <p className="font-bold">❌ Credenciais Pendentes!</p>
              <p className="font-normal opacity-90 leading-relaxed">
                Você precisa colar a sua chave anônima (<strong>anon public</strong>) no arquivo <code>.env.local</code> no lugar de <code>YOUR_SUPABASE_ANON_KEY_HERE</code>.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-250 p-3 rounded-lg">
              <p className="font-bold">✅ Conexão Estabelecida com Sucesso!</p>
              <p className="font-normal opacity-90 leading-relaxed text-[11px]">
                O aplicativo conseguiu se comunicar perfeitamente com as tabelas do seu banco Postgres no Supabase. O projeto está pronto para a migração em produção!
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <p className="font-bold">❌ Falha na Conexão!</p>
              <p className="font-mono text-[10px] bg-white border border-rose-100 p-2 rounded break-all leading-normal">
                {errorMessage}
              </p>
              <p className="font-normal opacity-90 leading-relaxed text-[11px] mt-1">
                Verifique se você executou o script <code>supabase_schema.sql</code> no SQL Editor do Supabase para criar as tabelas e se as credenciais estão corretas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
