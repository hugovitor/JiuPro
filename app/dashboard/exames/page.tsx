// app/dashboard/exames/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { db, Student, User, Academy } from '../../lib/db'

export default function ExameGraduacaoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [listaAlunos, setListaAlunos] = useState<Student[]>([])
  
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState('')
  const [novaFaixa, setNovaFaixa] = useState('Azul')
  const [dataExame, setDataExame] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedUser = db.getLoggedInUser()
    if (loggedUser) {
      setUser(loggedUser)
      const currentAcademy = db.getAcademy(loggedUser.academyId)
      if (currentAcademy) setAcademy(currentAcademy)
      setListaAlunos(db.getStudents(loggedUser.academyId))
    }
    setIsLoading(false)
  }, [])

  const alunoAtivo = listaAlunos.find((a) => a.id === alunoSelecionadoId)

  // Gatilho nativo para abrir o assistente de impressão do navegador
  const handleImprimir = () => {
    if (!alunoSelecionadoId) {
      alert('Selecione um atleta antes de imprimir.')
      return
    }
    window.print()
  }

  if (isLoading || !user) {
    return <div className="text-xs font-semibold text-slate-400">Carregando tatame...</div>
  }

  return (
    <div className="space-y-6">
      
      {/* 1. PAINEL DE CONTROLE (Ocultado automaticamente na impressão via CSS 'print:hidden') */}
      <div className="print:hidden space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Fichas de Avaliação Técnica</h1>
          <p className="text-sm text-zinc-500">Gere e imprima folhas de exame individual para avaliação no dia da troca de faixa.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Atleta Avaliado</label>
            <select
              value={alunoSelecionadoId}
              onChange={(e) => setAlunoSelecionadoId(e.target.value)}
              className="w-full px-3 py-2 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm text-zinc-800"
            >
              <option value="">-- Escolha o aluno --</option>
              {listaAlunos.map((a) => (
                <option key={a.id} value={a.id}>{a.nome} ({a.faixa})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Faixa Pretendida</label>
            <select
              value={novaFaixa}
              onChange={(e) => setNovaFaixa(e.target.value)}
              className="w-full px-3 py-2 mt-1.5 text-sm bg-white border border-zinc-200 rounded-lg shadow-sm text-zinc-800"
            >
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

          <button
            onClick={handleImprimir}
            className="w-full px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition-colors h-[38px] font-bold flex items-center justify-center gap-1.5"
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5M18 15.75h-12a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5h12a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5zm-3-8.25v-3H9v3" />
            </svg>
            Imprimir Ficha de Exame
          </button>
        </div>
      </div>

      {/* 2. FICHA OFICIAL DE EXAME (ESTILIZADA PARA PAPEL A4) */}
      {alunoAtivo ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 max-w-2xl mx-auto shadow-sm print:shadow-none print:border-none print:p-0 font-serif text-zinc-900">
          
          {/* Cabeçalho da Ficha */}
          <div className="text-center space-y-2 border-b-2 border-zinc-900 pb-6">
            <h2 className="text-2xl font-black tracking-tight font-sans uppercase">
              {academy?.name || 'JiuPro'}
            </h2>
            <h3 className="text-lg font-bold uppercase tracking-widest font-sans text-zinc-700">
              Ficha de Avaliação Oficial de Graduação
            </h3>
            <p className="text-xs font-sans text-zinc-400">Documento Interno de Homologação de Faixa</p>
          </div>

          {/* Dados do Aluno */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-6 border-b border-zinc-200 text-sm">
            <div>
              <span className="block text-[10px] font-sans font-bold uppercase text-zinc-400">Nome do Atleta:</span>
              <span className="font-bold text-base font-sans">{alunoAtivo.nome}</span>
            </div>
            <div>
              <span className="block text-[10px] font-sans font-bold uppercase text-zinc-400">Data do Exame:</span>
              <span className="font-medium font-sans">{new Date(dataExame + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="block text-[10px] font-sans font-bold uppercase text-zinc-400">Graduação Atual:</span>
              <span className="font-medium font-sans">Faixa {alunoAtivo.faixa} ({alunoAtivo.graus} Graus)</span>
            </div>
            <div>
              <span className="block text-[10px] font-sans font-bold uppercase text-zinc-400">Exame para:</span>
              <span className="font-bold font-sans text-red-600">Faixa {novaFaixa}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] font-sans font-bold uppercase text-zinc-400">Histórico de Assiduidade:</span>
              <span className="font-medium font-sans text-xs text-zinc-600">Registrado um total de {alunoAtivo.presencas.length} treinos validados neste ciclo técnico.</span>
            </div>
          </div>

          {/* Tabela de Critérios de Avaliação (Para o mestre dar notas à caneta) */}
          <div className="py-6 space-y-4">
            <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-zinc-400">Critérios Técnicos e Comportamentais</h4>
            
            <div className="border border-zinc-300 rounded-lg overflow-hidden font-sans text-xs">
              <div className="grid grid-cols-5 bg-zinc-100 font-bold border-b border-zinc-300 p-2.5 uppercase tracking-wide text-zinc-500">
                <div className="col-span-3">Item Avaliado</div>
                <div className="text-center">Peso</div>
                <div className="text-center">Nota (0-10)</div>
              </div>
              <div className="divide-y divide-zinc-200">
                <div className="grid grid-cols-5 p-3"><div className="col-span-3 font-semibold">Domínio Técnico Geral (Posições de Guarda e Passagem)</div><div className="text-center text-zinc-400">4.0</div><div className="border-l border-zinc-200"></div></div>
                <div className="grid grid-cols-5 p-3"><div className="col-span-3 font-semibold">Defesa Pessoal Integrada (Sistemas de Controle Antijogo)</div><div className="text-center text-zinc-400">2.0</div><div className="border-l border-zinc-200"></div></div>
                <div className="grid grid-cols-5 p-3"><div className="col-span-3 font-semibold">Volume e Mobilidade no Combate (Rolo / Sparring)</div><div className="text-center text-zinc-400">2.0</div><div className="border-l border-zinc-200"></div></div>
                <div className="grid grid-cols-5 p-3"><div className="col-span-3 font-semibold">Conduta Disciplinar, Assiduidade e Postura Ética</div><div className="text-center text-zinc-400">2.0</div><div className="border-l border-zinc-200"></div></div>
              </div>
            </div>
          </div>

          {/* Campo de Parecer Final */}
          <div className="border border-dashed border-zinc-300 rounded-lg p-4 font-sans space-y-2 mt-2">
            <span className="block text-[10px] font-bold uppercase text-zinc-400">Observações e Parecer da Banca Examinadora:</span>
            <div className="h-16"></div> {/* Espaço em branco para o professor escrever anotações manuais */}
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-8 pt-16 text-center text-xs font-sans font-medium text-zinc-500">
            <div className="border-t border-zinc-400 pt-2">
              Assinatura do Atleta Avaliado
            </div>
            <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-900">
              Assinatura do Examinador Responsável
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-sm text-zinc-400">
          Selecione um atleta no painel acima para estruturar a folha de exame de graduação oficial.
        </div>
      )}

    </div>
  )
}
