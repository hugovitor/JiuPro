// app/academia/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AcademiaPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Buscar academia pelo slug (id normalizado)
  const { data: academias } = await supabaseAdmin
    .from('academies')
    .select('*')
    .eq('status', 'Ativo')

  // Encontrar a academia cujo id normalize corresponde ao slug
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const academy = academias?.find((a: any) =>
    normalize(a.id) === slug ||
    normalize(a.name) === slug ||
    a.id === slug
  )

  if (!academy) return notFound()

  let turmas: any[] = []
  try {
    const { data } = await supabaseAdmin
      .from('class_sessions')
      .select('*')
      .eq('academy_id', academy.id)
      .order('horario')
      .limit(20)
    turmas = data || []
  } catch {
    turmas = []
  }

  const planoInfo = {
    Prata: { preco: 'R$ 99/mês', cor: 'text-slate-500 border-slate-300', bg: 'bg-slate-50' },
    Ouro: { preco: 'R$ 199/mês', cor: 'text-amber-600 border-amber-300', bg: 'bg-amber-50' },
    BlackBelt: { preco: 'R$ 349/mês', cor: 'text-zinc-900 border-zinc-400', bg: 'bg-zinc-100' },
  }[academy.plan as string] || { preco: 'Consultar', cor: 'text-slate-500 border-slate-300', bg: 'bg-slate-50' }

  const cadastroUrl = `/aluno/cadastro?academyId=${academy.id}`

  return (
    <main className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Hero */}
      <div className="bg-zinc-950 text-white px-6 py-16 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          {academy.logo_url ? (
            <img src={academy.logo_url} alt={academy.name} className="h-20 w-20 rounded-2xl mx-auto object-cover border-4 border-red-600" />
          ) : (
            <div className="h-20 w-20 bg-red-600 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-white font-black text-3xl italic">JP</span>
            </div>
          )}
          <h1 className="text-3xl font-black tracking-tight">{academy.name}</h1>
          <p className="text-slate-400 text-sm">Academia de Jiu-Jitsu • Gerenciada pelo JiuPro</p>
          {academy.professor_grade && (
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest">{academy.professor_grade}</p>
          )}
          <Link
            href={cadastroUrl}
            className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3 rounded-xl text-sm transition-all shadow-lg"
          >
            🥋 Matricular-se Agora
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* Plano / Mensalidade */}
        <div className={`rounded-2xl border-2 p-6 ${planoInfo.bg} ${planoInfo.cor.split(' ')[1]} text-center space-y-2`}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Plano {academy.plan}</p>
          <p className={`text-4xl font-black ${planoInfo.cor.split(' ')[0]}`}>{planoInfo.preco}</p>
          <p className="text-xs text-slate-500">Mensalidade com pagamento via cartão ou PIX</p>
        </div>

        {/* Horários */}
        {turmas && turmas.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Horários das Aulas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {turmas.map((t: any, i: number) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="font-bold text-slate-900 text-sm">{t.horario}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.title || 'Aula de Jiu-Jitsu'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefícios */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">O que está incluído</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              '🥋 Acesso a todas as aulas',
              '📊 Área do aluno no JiuPro',
              '📅 Controle de frequência',
              '🏆 Histórico de campeonatos',
              '📓 Diário técnico de treinos',
              '🎖️ Sistema de graduação',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center space-y-3">
          <Link
            href={cadastroUrl}
            className="inline-block bg-zinc-950 hover:bg-zinc-800 text-white font-black px-10 py-4 rounded-2xl text-sm transition-all shadow-lg w-full"
          >
            🥋 Fazer Matrícula — {academy.name}
          </Link>
          <p className="text-[10px] text-slate-400">Cadastro rápido e gratuito. Pagamento seguro via Stripe.</p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-[10px] text-slate-400">
            Gerenciado com{' '}
            <a href="/" className="font-bold text-red-600">JiuPro</a>
            {' '}— Sistema de Gestão para Academias de Jiu-Jitsu
          </p>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return {
    title: `Academia — JiuPro`,
    description: 'Matrícula online para academia de Jiu-Jitsu',
  }
}
