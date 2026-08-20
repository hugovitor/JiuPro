// app/lib/db.ts
import { supabase } from './supabase'

export interface Academy {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  plan: 'Prata' | 'Ouro' | 'BlackBelt'
  status: 'Ativo' | 'Suspenso'
  professorGrade: string // e.g. "Faixa Preta 3º Grau"
  mensalidadePadrao: string
  diaVencimento: string
  whatsappTemplate?: string
  stripeConnectId?: string
}

export interface User {
  id: string
  academyId: string
  name: string
  email: string
  role: 'Professor' | 'Dono'
  grade: string
  password?: string
}

export interface Invoice {
  mes: string
  vencimento: string
  valor: string
  status: 'Pago' | 'Atrasado'
}

export interface Attendance {
  data: string
  horario: string
  treino: string
}

export interface TournamentResult {
  id: string
  campeonato: string
  data: string
  categoria: string
  resultado: 'Ouro' | 'Prata' | 'Bronze' | 'Participação'
}

export interface Announcement {
  id: string
  academyId: string
  titulo: string
  conteudo: string
  categoria: 'Informativo' | 'Alerta' | 'Evento'
  data: string
}

export interface JournalEntry {
  id: string
  studentId: string
  data: string
  categoria: 'Kimono' | 'NoGi'
  posicao: string
  notas: string
}

export interface Student {
  id: string
  academyId: string
  nome: string
  faixa: string
  graus: number
  status: 'Ativo' | 'Inativo'
  dataMatricula: string
  mensalidade: string
  chavePix: string
  email: string
  graduadoPor: string
  mestreOriginal: string
  financeiro: Invoice[]
  presencas: Attendance[]
  password?: string
  badges?: string[]
  tournaments?: TournamentResult[]
  peso?: string
  altura?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  description: string
  timestamp: string
  read: boolean
}

export interface Product {
  id: string
  academyId: string
  nome: string
  preco: string
  estoque: number
}

export interface Sale {
  id: string
  academyId: string
  studentId: string
  studentName: string
  productName: string
  valor: string
  data: string
}

export interface ClassSession {
  id: string
  horario: string
  nome: string
  dias: string
}

export interface CheckIn {
  id: string // student ID
  nome: string
  faixa: string
  graus: number
  status: 'Pendente' | 'Confirmado' | 'Faltou'
  horario: string // e.g. "19:30"
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  content: string
  timestamp: string
}

export interface Post {
  id: string
  academyId: string
  authorId: string
  authorName: string
  authorFaixa?: string
  content: string
  timestamp: string
  likes: string[] // studentIds or userIds
  comments: Comment[]
}

// Initial mockup data
const DEFAULT_WHATSAPP_TEMPLATE = 'Olá, {aluno}! Consta em aberto no JiuPro a mensalidade de {mes} (Vencimento: {vencimento}) no valor de R$ {valor}.\n\nVocê pode pagar via PIX.\nChave: {chavePix}\n\nObrigado! Oss.';

const DEFAULT_ACADEMIAS: Academy[] = [
  {
    id: 'gb-centro',
    name: 'Gracie Barra Centro',
    ownerName: 'Prof. Ricardo Ramos',
    ownerEmail: 'ricardo@graciebarra.com.br',
    plan: 'Ouro',
    status: 'Ativo',
    professorGrade: 'Faixa Preta 3º Grau',
    mensalidadePadrao: '150,00',
    diaVencimento: '10',
    whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE
  },
  {
    id: 'alliance-pinheiros',
    name: 'Alliance Pinheiros',
    ownerName: 'Prof. Fábio Gurgel',
    ownerEmail: 'fabio@alliance.com.br',
    plan: 'Prata',
    status: 'Ativo',
    professorGrade: 'Faixa Preta 6º Grau',
    mensalidadePadrao: '180,00',
    diaVencimento: '05',
    whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE
  },
  {
    id: 'atos-sp',
    name: 'Atos SP',
    ownerName: 'Prof. André Galvão',
    ownerEmail: 'andre@atos.com',
    plan: 'BlackBelt',
    status: 'Suspenso',
    professorGrade: 'Faixa Preta 4º Grau',
    mensalidadePadrao: '200,00',
    diaVencimento: '15',
    whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE
  }
]

const DEFAULT_USERS: User[] = [
  {
    id: 'user-ricardo',
    academyId: 'gb-centro',
    name: 'Prof. Ricardo Ramos',
    email: 'ricardo@graciebarra.com.br',
    role: 'Dono',
    grade: 'Faixa Preta 3º Grau'
  },
  {
    id: 'user-fabio',
    academyId: 'alliance-pinheiros',
    name: 'Prof. Fábio Gurgel',
    email: 'fabio@alliance.com.br',
    role: 'Dono',
    grade: 'Faixa Preta 6º Grau'
  },
  {
    id: 'user-andre',
    academyId: 'atos-sp',
    name: 'Prof. André Galvão',
    email: 'andre@atos.com',
    role: 'Dono',
    grade: 'Faixa Preta 4º Grau'
  }
]

const DEFAULT_STUDENTS: Student[] = [
  // Gracie Barra Centro
  {
    id: '1',
    academyId: 'gb-centro',
    nome: 'Carlos Silva',
    faixa: 'Azul',
    graus: 3,
    status: 'Ativo',
    dataMatricula: '2025-03-12',
    mensalidade: '150,00',
    chavePix: 'financeiro@graciebarracentro.com.br',
    email: 'carlos.silva@gmail.com',
    graduadoPor: 'Prof. Ricardo Ramos (Faixa Preta 3º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie Jr.',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '10/08/2026', valor: '150,00', status: 'Atrasado' },
      { mes: 'Julho/2026', vencimento: '10/07/2026', valor: '150,00', status: 'Pago' }
    ],
    presencas: [
      { data: '2026-08-14', horario: '19:30h', treino: 'Avançado — Foco em Competição' },
      { data: '2026-08-12', horario: '19:30h', treino: 'Avançado — Foco em Competição' }
    ]
  },
  {
    id: '2',
    academyId: 'gb-centro',
    nome: 'Mariana Costa',
    faixa: 'Roxa',
    graus: 4,
    status: 'Ativo',
    dataMatricula: '2024-07-10',
    mensalidade: '150,00',
    chavePix: 'financeiro@graciebarracentro.com.br',
    email: 'mariana.costa@hotmail.com',
    graduadoPor: 'Prof. Ricardo Ramos (Faixa Preta 3º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie Jr.',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '10/08/2026', valor: '150,00', status: 'Atrasado' },
      { mes: 'Julho/2026', vencimento: '10/07/2026', valor: '150,00', status: 'Pago' }
    ],
    presencas: [
      { data: '2026-08-14', horario: '19:30h', treino: 'Avançado — Foco em Competição' }
    ]
  },
  {
    id: '3',
    academyId: 'gb-centro',
    nome: 'Rodrigo Lima',
    faixa: 'Branca',
    graus: 1,
    status: 'Ativo',
    dataMatricula: '2026-01-05',
    mensalidade: '150,00',
    chavePix: 'financeiro@graciebarracentro.com.br',
    email: 'rodrigo.lima@outlook.com',
    graduadoPor: 'Prof. Ricardo Ramos (Faixa Preta 3º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie Jr.',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '10/08/2026', valor: '150,00', status: 'Atrasado' },
      { mes: 'Julho/2026', vencimento: '10/07/2026', valor: '150,00', status: 'Pago' }
    ],
    presencas: [
      { data: '2026-08-14', horario: '19:30h', treino: 'Avançado — Foco em Competição' }
    ]
  },
  {
    id: '4',
    academyId: 'gb-centro',
    nome: 'Marcos Oliveira',
    faixa: 'Roxa',
    graus: 2,
    status: 'Inativo',
    dataMatricula: '2024-02-15',
    mensalidade: '150,00',
    chavePix: 'financeiro@graciebarracentro.com.br',
    email: 'marcos.oliveira@gmail.com',
    graduadoPor: 'Prof. Ricardo Ramos (Faixa Preta 3º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie Jr.',
    financeiro: [
      { mes: 'Julho/2026', vencimento: '10/07/2026', valor: '150,00', status: 'Pago' }
    ],
    presencas: []
  },
  {
    id: '5',
    academyId: 'gb-centro',
    nome: 'Felipe Melo',
    faixa: 'Branca',
    graus: 0,
    status: 'Ativo',
    dataMatricula: '2025-11-22',
    mensalidade: '150,00',
    chavePix: 'financeiro@graciebarracentro.com.br',
    email: 'felipe.melo@gmail.com',
    graduadoPor: 'Prof. Ricardo Ramos (Faixa Preta 3º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie Jr.',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '10/08/2026', valor: '150,00', status: 'Pago' }
    ],
    presencas: []
  },
  {
    id: '6',
    academyId: 'gb-centro',
    nome: 'Beatriz Santos',
    faixa: 'Preta',
    graus: 1,
    status: 'Ativo',
    dataMatricula: '2022-09-09',
    mensalidade: '150,00',
    chavePix: 'financeiro@graciebarracentro.com.br',
    email: 'beatriz.santos@gmail.com',
    graduadoPor: 'Prof. Ricardo Ramos (Faixa Preta 3º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie Jr.',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '10/08/2026', valor: '150,00', status: 'Pago' }
    ],
    presencas: []
  },

  // Alliance Pinheiros
  {
    id: '11',
    academyId: 'alliance-pinheiros',
    nome: 'Lucas Almeida',
    faixa: 'Marrom',
    graus: 2,
    status: 'Ativo',
    dataMatricula: '2024-05-15',
    mensalidade: '180,00',
    chavePix: 'pix@alliancepinheiros.com.br',
    email: 'lucas.almeida@gmail.com',
    graduadoPor: 'Prof. Fábio Gurgel (Faixa Preta 6º Grau)',
    mestreOriginal: 'Mestre Rolls Gracie',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '05/08/2026', valor: '180,00', status: 'Pago' }
    ],
    presencas: [
      { data: '2026-08-14', horario: '12:00h', treino: 'Meio-dia — Sem Kimono (NoGi)' }
    ]
  },
  {
    id: '12',
    academyId: 'alliance-pinheiros',
    nome: 'Juliana Ribeiro',
    faixa: 'Azul',
    graus: 3,
    status: 'Ativo',
    dataMatricula: '2025-06-20',
    mensalidade: '180,00',
    chavePix: 'pix@alliancepinheiros.com.br',
    email: 'juliana.rib@hotmail.com',
    graduadoPor: 'Prof. Fábio Gurgel (Faixa Preta 6º Grau)',
    mestreOriginal: 'Mestre Rolls Gracie',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '05/08/2026', valor: '180,00', status: 'Atrasado' }
    ],
    presencas: []
  },

  // Atos SP
  {
    id: '21',
    academyId: 'atos-sp',
    nome: 'Arthur Jorge',
    faixa: 'Marrom',
    graus: 1,
    status: 'Ativo',
    dataMatricula: '2024-03-01',
    mensalidade: '200,00',
    chavePix: 'financeiro@atossp.com',
    email: 'arthur.jorge@gmail.com',
    graduadoPor: 'Prof. André Galvão (Faixa Preta 4º Grau)',
    mestreOriginal: 'Mestre Carlos Gracie',
    financeiro: [
      { mes: 'Agosto/2026', vencimento: '15/08/2026', valor: '200,00', status: 'Atrasado' }
    ],
    presencas: []
  }
]

const DEFAULT_TURMAS: Record<string, ClassSession[]> = {
  'gb-centro': [
    { id: 'gb-1', horario: '07:00', nome: 'Matinal — Todos os Níveis', dias: 'Seg, Qua, Sex' },
    { id: 'gb-2', horario: '12:00', nome: 'Meio-dia — Sem Kimono (NoGi)', dias: 'Ter, Qui' },
    { id: 'gb-3', horario: '18:30', nome: 'Infantil — Até 12 anos', dias: 'Seg, Qua, Sex' },
    { id: 'gb-4', horario: '19:30', nome: 'Avançado — Foco em Competição', dias: 'Seg, Qua, Sex' },
    { id: 'gb-5', horario: '21:00', nome: 'Iniciantes — Fundamentos', dias: 'Seg, Qua' }
  ],
  'alliance-pinheiros': [
    { id: 'al-1', horario: '12:00', nome: 'Meio-dia — Sem Kimono (NoGi)', dias: 'Ter, Qui' },
    { id: 'al-2', horario: '19:00', nome: 'Classe Geral', dias: 'Seg, Ter, Qua, Qui, Sex' }
  ],
  'atos-sp': [
    { id: 'at-1', horario: '19:30', nome: 'Treino de Competição', dias: 'Seg, Ter, Qua, Qui, Sex' }
  ]
}

const DEFAULT_CHECKINS: Record<string, CheckIn[]> = {
  'gb-centro': [
    { id: '1', nome: 'Carlos Silva', faixa: 'Azul', graus: 4, status: 'Pendente', horario: '19:30' },
    { id: '2', nome: 'Mariana Costa', faixa: 'Roxa', graus: 4, status: 'Pendente', horario: '19:30' },
    { id: '3', nome: 'Rodrigo Lima', faixa: 'Branca', graus: 1, status: 'Confirmado', horario: '19:30' }
  ],
  'alliance-pinheiros': [
    { id: '11', nome: 'Lucas Almeida', faixa: 'Marrom', graus: 2, status: 'Pendente', horario: '12:00' }
  ],
  'atos-sp': []
}

// LocalStorage Check and Setup helper
function initializeStorage() {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem('jiupro_academies')) {
    localStorage.setItem('jiupro_academies', JSON.stringify(DEFAULT_ACADEMIAS))
  }
  if (!localStorage.getItem('jiupro_users')) {
    const usersWithPwd = DEFAULT_USERS.map(u => ({ ...u, password: u.password || '123456' }))
    localStorage.setItem('jiupro_users', JSON.stringify(usersWithPwd))
  } else {
    const users: User[] = JSON.parse(localStorage.getItem('jiupro_users') || '[]')
    let changed = false
    users.forEach(u => {
      if (!u.password) {
        u.password = '123456'
        changed = true
      }
    })
    if (changed) {
      localStorage.setItem('jiupro_users', JSON.stringify(users))
    }
  }

  if (!localStorage.getItem('jiupro_students')) {
    const studentsWithPwd = DEFAULT_STUDENTS.map(s => ({
      ...s,
      password: s.password || '123456',
      badges: s.badges || ['frequencia-ferro'], // start Carlos/Mariana with standard badge
      tournaments: s.tournaments || [
        { id: 't-1', campeonato: 'Copa Gracie Barra SP', data: '2026-05-10', categoria: 'Adulto Leve', resultado: 'Ouro' }
      ],
      peso: s.peso || '78',
      altura: s.altura || '1.75'
    }))
    localStorage.setItem('jiupro_students', JSON.stringify(studentsWithPwd))
  } else {
    const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    let changed = false
    students.forEach(s => {
      if (!s.password) {
        s.password = '123456'
        changed = true
      }
      if (!s.badges) {
        s.badges = ['frequencia-ferro']
        changed = true
      }
      if (!s.tournaments) {
        s.tournaments = [
          { id: 't-1', campeonato: 'Copa Gracie Barra SP', data: '2026-05-10', categoria: 'Adulto Leve', resultado: 'Ouro' }
        ]
        changed = true
      }
      if (!s.peso) {
        s.peso = '78'
        changed = true
      }
      if (!s.altura) {
        s.altura = '1.75'
        changed = true
      }
    })
    if (changed) {
      localStorage.setItem('jiupro_students', JSON.stringify(students))
    }
  }

  if (!localStorage.getItem('jiupro_turmas')) {
    localStorage.setItem('jiupro_turmas', JSON.stringify(DEFAULT_TURMAS))
  }
  if (!localStorage.getItem('jiupro_checkins')) {
    localStorage.setItem('jiupro_checkins', JSON.stringify(DEFAULT_CHECKINS))
  }

  // Initialize products stock
  if (!localStorage.getItem('jiupro_products')) {
    const defaultProducts: Product[] = [
      { id: 'prod-1', academyId: 'gb-centro', nome: 'Kimono Oficial GB', preco: '390,00', estoque: 15 },
      { id: 'prod-2', academyId: 'gb-centro', nome: 'Faixa Vermelha/Branca', preco: '70,00', estoque: 8 },
      { id: 'prod-3', academyId: 'gb-centro', nome: 'Açaí Turbinado', preco: '15,00', estoque: 40 },
      { id: 'prod-4', academyId: 'gb-centro', nome: 'Garrafa de Água', preco: '5,00', estoque: 85 },
      { id: 'prod-5', academyId: 'alliance-pinheiros', nome: 'Kimono Alliance', preco: '420,00', estoque: 10 },
      { id: 'prod-6', academyId: 'alliance-pinheiros', nome: 'Faixa Marcial', preco: '60,00', estoque: 20 },
      { id: 'prod-7', academyId: 'alliance-pinheiros', nome: 'Água Mineral', preco: '5,00', estoque: 100 }
    ]
    localStorage.setItem('jiupro_products', JSON.stringify(defaultProducts))
  }

  // Initialize sales list
  if (!localStorage.getItem('jiupro_sales')) {
    localStorage.setItem('jiupro_sales', JSON.stringify([]))
  }

  // Initialize notifications
  if (!localStorage.getItem('jiupro_notifications')) {
    const defaultNotifications: Notification[] = [
      {
        id: 'notif-1',
        userId: 'user-ricardo',
        title: 'Novo Aluno Matriculado',
        description: 'Rodrigo Lima realizou o cadastro via link de convite.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false
      },
      {
        id: 'notif-2',
        userId: '1',
        title: 'Matrícula Ativa',
        description: 'Bem-vindo ao JiuPro! Seu plano Mensal Ouro foi iniciado.',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: false
      }
    ]
    localStorage.setItem('jiupro_notifications', JSON.stringify(defaultNotifications))
  }

  // Initialize social posts
  if (!localStorage.getItem('jiupro_posts')) {
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        academyId: 'gb-centro',
        authorId: '1',
        authorName: 'Carlos Silva',
        authorFaixa: 'Azul',
        content: 'Treino de hoje pago! Foco total nos campeonatos do próximo mês. Oss! 🥋🔥',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        likes: ['2'],
        comments: [
          {
            id: 'c-1',
            authorId: '2',
            authorName: 'Mariana Costa',
            content: 'Excelente treino! Parabéns!',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      },
      {
        id: 'post-2',
        academyId: 'gb-centro',
        authorId: '2',
        authorName: 'Mariana Costa',
        authorFaixa: 'Roxa',
        content: 'Mais um treino de fundamentos concluído com sucesso. A evolução é diária!',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        likes: ['1', '3'],
        comments: []
      }
    ]
    localStorage.setItem('jiupro_posts', JSON.stringify(mockPosts))
  }

  // Initialize announcements
  if (!localStorage.getItem('jiupro_announcements')) {
    const defaultAnnouncements = {
      'gb-centro': [
        {
          id: 'ann-default-1',
          academyId: 'gb-centro',
          titulo: '🚨 Horário Especial do Feriado',
          conteudo: 'No feriado do dia 07/Setembro, o tatame funcionará apenas para treino livre das 10:00 às 12:00. Não haverá treinos infantis.',
          categoria: 'Alerta',
          data: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 'ann-default-2',
          academyId: 'gb-centro',
          titulo: '🎓 Próximo Exame de Graus e Faixas',
          conteudo: 'Atenção alunos: confiram se suas presenças mínimas estão em dia na Área do Aluno. A avaliação oficial de graduação ocorrerá no dia 28/Setembro.',
          categoria: 'Evento',
          data: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ]
    }
    localStorage.setItem('jiupro_announcements', JSON.stringify(defaultAnnouncements))
  }

  // Initialize journals
  if (!localStorage.getItem('jiupro_journals')) {
    localStorage.setItem('jiupro_journals', JSON.stringify({}))
  }
}

export function isDemoAcademy(academyId: string): boolean {
  return ['gb-centro', 'alliance-pinheiros', 'atos-sp'].includes(academyId)
}

function checkDemoBlock(academyId: string): boolean {
  if (isDemoAcademy(academyId)) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jiupro_demo_block', {
        detail: { message: 'Esta ação está desativada no modo de demonstração. Assine um plano para liberar!' }
      }))
    }
    return true
  }
  return false
}

// Expose APIs
export const db = {
  async seedDatabase() {
    try {
      const { count } = await supabase.from('academies').select('*', { count: 'exact', head: true })
      if (count === 0) {
        console.log('Populando banco de dados Supabase com dados padrão...')
        
        // 1. Seed Academies
        const academiesList = this.getAcademies()
        for (const a of academiesList) {
          await supabase.from('academies').upsert({
            id: a.id,
            name: a.name,
            mensalidade_padrao: a.mensalidadePadrao,
            dia_vencimento: a.diaVencimento,
            whatsapp_template: a.whatsappTemplate || '',
            owner_name: a.ownerName,
            owner_email: a.ownerEmail,
            plan: a.plan,
            status: a.status,
            professor_grade: a.professorGrade
          })
        }

        // 2. Seed Users
        const usersList = this.getUsers()
        for (const u of usersList) {
          await supabase.from('users').upsert({
            id: u.id,
            academy_id: u.academyId,
            name: u.name,
            email: u.email,
            password: u.password || '123456',
            role: u.role,
            grade: u.grade || ''
          })
        }

        // 3. Seed Students
        const studentsList = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
        for (const s of studentsList) {
          await supabase.from('students').upsert({
            id: s.id,
            academy_id: s.academyId,
            nome: s.nome,
            email: s.email,
            password: s.password || '123456',
            faixa: s.faixa,
            graus: s.graus,
            status: s.status,
            data_matricula: s.dataMatricula,
            mensalidade: s.mensalidade,
            dia_vencimento: s.diaVencimento || '10',
            chave_pix: s.chavePix,
            peso: s.peso || '',
            altura: s.altura || '',
            badges: s.badges || []
          })

          // Invoices
          if (s.financeiro) {
            for (const f of s.financeiro) {
              await supabase.from('invoices').insert({
                student_id: s.id,
                mes: f.mes,
                vencimento: f.vencimento,
                valor: f.valor,
                status: f.status
              })
            }
          }

          // Attendances
          if (s.presencas) {
            for (const p of s.presencas) {
              await supabase.from('attendances').insert({
                student_id: s.id,
                data: p.data,
                horario: p.horario,
                treino: p.treino
              })
            }
          }

          // Tournaments
          if (s.tournaments) {
            for (const t of s.tournaments) {
              await supabase.from('tournaments').insert({
                id: t.id,
                student_id: s.id,
                campeonato: t.campeonato,
                data: t.data,
                categoria: t.categoria,
                resultado: t.resultado
              })
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  },

  async syncWithSupabase(academyId: string) {
    if (typeof window === 'undefined') return
    try {
      await this.seedDatabase()

      // 1. Sync Academy
      const { data: acData } = await supabase.from('academies').select('*').eq('id', academyId).single()
      if (acData) {
        const academies = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
        const updatedAcademy = {
          id: acData.id,
          name: acData.name,
          mensalidadePadrao: acData.mensalidade_padrao,
          diaVencimento: acData.dia_vencimento,
          whatsappTemplate: acData.whatsapp_template,
          logoUrl: acData.logo_url,
          ownerName: acData.owner_name,
          ownerEmail: acData.owner_email,
          plan: acData.plan,
          status: acData.status,
          professorGrade: acData.professor_grade,
          stripeConnectId: acData.stripe_connect_id
        }
        const idx = academies.findIndex((a: any) => a.id === academyId)
        if (idx !== -1) {
          academies[idx] = updatedAcademy
        } else {
          academies.push(updatedAcademy)
        }
        localStorage.setItem('jiupro_academies', JSON.stringify(academies))
      }

      // 2. Sync Students
      const { data: stdData } = await supabase
        .from('students')
        .select('*, invoices(*), attendances(*), tournaments(*)')
        .eq('academy_id', academyId)

      if (stdData) {
        const mapped: Student[] = stdData.map((s: any) => ({
          id: s.id,
          academyId: s.academy_id,
          nome: s.nome,
          email: s.email,
          password: s.password,
          faixa: s.faixa,
          graus: s.graus,
          status: s.status,
          dataMatricula: s.data_matricula,
          mensalidade: s.mensalidade,
          diaVencimento: s.dia_vencimento || '10',
          chavePix: s.chave_pix,
          peso: s.peso || '',
          altura: s.altura || '',
          graduadoPor: 'Auto-cadastro',
          mestreOriginal: '',
          badges: s.badges || [],
          financeiro: (s.invoices || []).map((i: any) => ({ mes: i.mes, vencimento: i.vencimento, valor: i.valor, status: i.status })),
          presencas: (s.attendances || []).map((a: any) => ({ data: a.data, horario: a.horario, treino: a.treino })),
          tournaments: (s.tournaments || []).map((t: any) => ({ id: t.id, campeonato: t.campeonato, data: t.data, categoria: t.categoria, resultado: t.resultado }))
        }))
        localStorage.setItem('jiupro_students', JSON.stringify(mapped))
      }

      // 3. Sync Checkins
      const { data: chkData } = await supabase.from('checkins').select('*').eq('academy_id', academyId)
      if (chkData) {
        const chks = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
        chks[academyId] = chkData.map((c: any) => ({
          id: c.student_id,
          nome: c.nome,
          faixa: c.faixa,
          graus: c.graus,
          status: c.status,
          horario: c.horario,
          data: c.data
        }))
        localStorage.setItem('jiupro_checkins', JSON.stringify(chks))
      }

      // 4. Sync Announcements
      const { data: annData } = await supabase.from('announcements').select('*').eq('academy_id', academyId)
      if (annData) {
        const anns = JSON.parse(localStorage.getItem('jiupro_announcements') || '{}')
        anns[academyId] = annData.map(a => ({
          id: a.id,
          academyId: a.academy_id,
          titulo: a.titulo,
          conteudo: a.conteudo,
          categoria: a.categoria,
          data: a.data
        }))
        localStorage.setItem('jiupro_announcements', JSON.stringify(anns))
      }

      // 5. Sync Journals
      if (stdData) {
        const ids = stdData.map((s: any) => s.id)
        if (ids.length > 0) {
          const { data: jData } = await supabase.from('journals').select('*').in('student_id', ids)
          if (jData) {
            const journs = JSON.parse(localStorage.getItem('jiupro_journals') || '{}')
            ids.forEach(id => { journs[id] = [] })
            jData.forEach((j: any) => {
              if (!journs[j.student_id]) journs[j.student_id] = []
              journs[j.student_id].push({
                id: j.id,
                studentId: j.student_id,
                data: j.data,
                categoria: j.categoria,
                posicao: j.posicao,
                notas: j.notas
              })
            })
            localStorage.setItem('jiupro_journals', JSON.stringify(journs))
          }
        }
      }

      // 6. Sync Products
      const { data: pData } = await supabase.from('products').select('*').eq('academy_id', academyId)
      if (pData) {
        localStorage.setItem('jiupro_products', JSON.stringify(pData))
      }

      // 7. Sync Sales
      const { data: sData } = await supabase.from('sales').select('*').eq('academy_id', academyId)
      if (sData) {
        localStorage.setItem('jiupro_sales', JSON.stringify(sData.map((s: any) => ({
          id: s.id,
          academyId: s.academy_id,
          studentId: s.student_id || undefined,
          studentName: s.student_name,
          productId: s.product_id || undefined,
          productName: s.product_name,
          valor: s.valor,
          data: s.data
        }))))
      }

      // 8. Sync Social Posts
      const { data: postData } = await supabase.from('posts').select('*').eq('academy_id', academyId)
      if (postData) {
        localStorage.setItem('jiupro_posts', JSON.stringify(postData.map((p: any) => ({
          id: p.id,
          academyId: p.academy_id,
          authorId: p.author_id,
          authorName: p.author_name,
          authorFaixa: p.author_faixa,
          content: p.content,
          timestamp: p.timestamp,
          likes: p.likes || [],
          comments: p.comments || []
        }))))
      }

      // 9. Sync Notifications
      const { data: notifData } = await supabase.from('notifications').select('*')
      if (notifData) {
        localStorage.setItem('jiupro_notifications', JSON.stringify(notifData))
      }
    } catch (e) {
      console.error(e)
    }
  },

  // Read Lists
  getAcademies(): Academy[] {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_ACADEMIAS
    return JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
  },

  getAcademy(id: string): Academy | undefined {
    return this.getAcademies().find((a) => a.id === id)
  },

  getUsers(): User[] {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_USERS
    return JSON.parse(localStorage.getItem('jiupro_users') || '[]')
  },

  getStudents(academyId: string): Student[] {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_STUDENTS.filter(s => s.academyId === academyId)
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    return all.filter((s) => s.academyId === academyId)
  },

  getStudent(id: string): Student | undefined {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_STUDENTS.find(s => s.id === id)
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    return all.find((s) => s.id === id)
  },

  getClasses(academyId: string): ClassSession[] {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_TURMAS[academyId] || []
    const all: Record<string, ClassSession[]> = JSON.parse(localStorage.getItem('jiupro_turmas') || '{}')
    return all[academyId] || []
  },

  getCheckIns(academyId: string): CheckIn[] {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_CHECKINS[academyId] || []
    const all: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    return all[academyId] || []
  },

  // Mutators
  saveStudent(student: Omit<Student, 'id' | 'financeiro' | 'presencas'> & { id?: string }): Student {
    if (student.academyId && checkDemoBlock(student.academyId)) {
      return student as Student;
    }
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    
    let target: Student
    if (student.id) {
      const idx = all.findIndex(s => s.id === student.id)
      const existing = all[idx]
      target = {
        ...existing,
        ...student,
        id: student.id
      }
      if (idx !== -1) all[idx] = target
    } else {
      const newId = Date.now().toString()
      target = {
        ...student,
        id: newId,
        financeiro: [
          { mes: 'Agosto/2026', vencimento: '10/08/2026', valor: student.mensalidade, status: 'Atrasado' }
        ],
        presencas: []
      }
      all.push(target)
    }

    localStorage.setItem('jiupro_students', JSON.stringify(all))

    // Background push to Supabase
    supabase.from('students').upsert({
      id: target.id,
      academy_id: target.academyId,
      nome: target.nome,
      email: target.email,
      password: target.password || '123456',
      faixa: target.faixa,
      graus: target.graus,
      status: target.status,
      data_matricula: target.dataMatricula,
      mensalidade: target.mensalidade,
      dia_vencimento: '10',
      chave_pix: target.chavePix,
      peso: target.peso || '',
      altura: target.altura || '',
      badges: target.badges || []
    }).then(({ error }) => {
      if (error) console.error('Erro ao salvar atleta no Supabase:', error)
    })

    return target
  },

  updateStudentBelt(id: string, belt: string, degrees: number) {
    const student = this.getStudent(id)
    if (student && checkDemoBlock(student.academyId)) return
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = all.findIndex(s => s.id === id)
    if (idx !== -1) {
      all[idx].faixa = belt
      all[idx].graus = degrees
      localStorage.setItem('jiupro_students', JSON.stringify(all))
    }
    // Background push to Supabase
    supabase.from('students').update({ faixa: belt, graus: degrees }).eq('id', id).then(({ error }) => {
      if (error) console.error('Erro ao salvar faixa no Supabase:', error)
    })
  },

  updateStudentInvoices(id: string, invoices: Invoice[]) {
    const student = this.getStudent(id)
    if (student && checkDemoBlock(student.academyId)) return
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = all.findIndex(s => s.id === id)
    if (idx !== -1) {
      all[idx].financeiro = invoices
      localStorage.setItem('jiupro_students', JSON.stringify(all))
    }
    // Background push to Supabase
    supabase.from('invoices').delete().eq('student_id', id).then(() => {
      if (invoices.length > 0) {
        supabase.from('invoices').insert(invoices.map(inv => ({
          student_id: id,
          mes: inv.mes,
          vencimento: inv.vencimento,
          valor: inv.valor,
          status: inv.status
        }))).then(({ error }) => {
          if (error) console.error('Erro ao inserir faturas no Supabase:', error)
        })
      }
    })
  },

  saveClass(academyId: string, classData: Omit<ClassSession, 'id'> & { id?: string }): ClassSession {
    if (checkDemoBlock(academyId)) return classData as ClassSession
    initializeStorage()
    const all: Record<string, ClassSession[]> = JSON.parse(localStorage.getItem('jiupro_turmas') || '{}')
    if (!all[academyId]) all[academyId] = []

    let target: ClassSession
    if (classData.id) {
      const idx = all[academyId].findIndex(c => c.id === classData.id)
      target = { ...classData, id: classData.id }
      if (idx !== -1) all[academyId][idx] = target
    } else {
      target = { ...classData, id: Date.now().toString() }
      all[academyId].push(target)
    }

    localStorage.setItem('jiupro_turmas', JSON.stringify(all))
    return target
  },

  removeClass(academyId: string, classId: string) {
    if (checkDemoBlock(academyId)) return
    initializeStorage()
    const all: Record<string, ClassSession[]> = JSON.parse(localStorage.getItem('jiupro_turmas') || '{}')
    if (all[academyId]) {
      all[academyId] = all[academyId].filter(c => c.id !== classId)
      localStorage.setItem('jiupro_turmas', JSON.stringify(all))
    }
  },

  confirmCheckIn(academyId: string, studentId: string, status: 'Confirmado' | 'Faltou') {
    if (checkDemoBlock(academyId)) return
    initializeStorage()
    
    // Update check-ins list
    const allCheckins: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    if (allCheckins[academyId]) {
      const idx = allCheckins[academyId].findIndex(c => c.id === studentId)
      if (idx !== -1) {
        allCheckins[academyId][idx].status = status
        localStorage.setItem('jiupro_checkins', JSON.stringify(allCheckins))
      }
    }

    const today = new Date().toISOString().split('T')[0]
    // Supabase check-in status update
    supabase.from('checkins').update({ status }).eq('student_id', studentId).eq('data', today).then(() => {
      console.log('Sync checkin status success')
    })

    // If confirmed, add presence to student record
    if (status === 'Confirmado') {
      const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
      const sIdx = students.findIndex(s => s.id === studentId)
      if (sIdx !== -1) {
        const student = students[sIdx]
        
        // Avoid duplicate presences on the same day/time
        const alreadyRegistered = student.presencas.some(p => p.data === today)
        if (!alreadyRegistered) {
          const newAtt = {
            data: today,
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'h',
            treino: 'Treino Validado'
          }
          student.presencas.unshift(newAtt)
          localStorage.setItem('jiupro_students', JSON.stringify(students))
          this.checkAndAwardBadges(studentId)

          // Supabase attendance insert
          supabase.from('attendances').insert({
            student_id: studentId,
            data: newAtt.data,
            horario: newAtt.horario,
            treino: newAtt.treino
          }).then(({ error }) => {
            if (error) console.error('Erro ao salvar presença no Supabase:', error)
          })
        }
      }
    }
  },

  studentCheckIn(academyId: string, studentId: string, classTime: string) {
    if (checkDemoBlock(academyId)) return
    initializeStorage()
    const allCheckins: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    if (!allCheckins[academyId]) allCheckins[academyId] = []

    const student = this.getStudent(studentId)
    if (!student) return

    // Avoid duplicate checkins for same student in the check-in list
    const exists = allCheckins[academyId].some(c => c.id === studentId)
    if (!exists) {
      const today = new Date().toISOString().split('T')[0]
      allCheckins[academyId].push({
        id: studentId,
        nome: student.nome,
        faixa: student.faixa,
        graus: student.graus,
        status: 'Pendente',
        horario: classTime
      })
      localStorage.setItem('jiupro_checkins', JSON.stringify(allCheckins))

      // Supabase Check-in insert
      supabase.from('checkins').insert({
        academy_id: academyId,
        student_id: studentId,
        nome: student.nome,
        faixa: student.faixa,
        graus: student.graus,
        status: 'Pendente',
        horario: classTime,
        data: today
      }).then(({ error }) => {
        if (error) console.error('Erro ao fazer checkin no Supabase:', error)
      })
    }
  },

  studentCancelCheckIn(academyId: string, studentId: string) {
    if (checkDemoBlock(academyId)) return
    initializeStorage()
    const allCheckins: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    if (allCheckins[academyId]) {
      allCheckins[academyId] = allCheckins[academyId].filter(c => c.id !== studentId)
      localStorage.setItem('jiupro_checkins', JSON.stringify(allCheckins))
    }

    const today = new Date().toISOString().split('T')[0]
    // Supabase delete check-in
    supabase.from('checkins').delete().eq('student_id', studentId).eq('data', today).then(({ error }) => {
      if (error) console.error('Erro ao cancelar checkin no Supabase:', error)
    })
  },

  updateAcademySettings(academyId: string, settings: { mensalidadePadrao: string; diaVencimento: string; whatsappTemplate?: string; stripeConnectId?: string }) {
    if (checkDemoBlock(academyId)) return
    initializeStorage()
    const academies: Academy[] = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
    const idx = academies.findIndex(a => a.id === academyId)
    
    if (idx !== -1) {
      academies[idx].mensalidadePadrao = settings.mensalidadePadrao
      academies[idx].diaVencimento = settings.diaVencimento
      if (settings.whatsappTemplate !== undefined) {
        academies[idx].whatsappTemplate = settings.whatsappTemplate
      }
      if (settings.stripeConnectId !== undefined) {
        academies[idx].stripeConnectId = settings.stripeConnectId
      }
    } else {
      academies.push({
        id: academyId,
        name: '',
        ownerName: '',
        ownerEmail: '',
        professorGrade: '',
        mensalidadePadrao: settings.mensalidadePadrao,
        diaVencimento: settings.diaVencimento,
        whatsappTemplate: settings.whatsappTemplate || '',
        stripeConnectId: settings.stripeConnectId || '',
        plan: 'Ouro',
        status: 'Ativo'
      })
    }
    localStorage.setItem('jiupro_academies', JSON.stringify(academies))

    // Supabase update academy settings
    const updatePayload: any = {
      mensalidade_padrao: settings.mensalidadePadrao,
      dia_vencimento: settings.diaVencimento,
      whatsapp_template: settings.whatsappTemplate || ''
    }
    if (settings.stripeConnectId !== undefined) {
      updatePayload.stripe_connect_id = settings.stripeConnectId
    }

    supabase.from('academies').update(updatePayload).eq('id', academyId).then(({ error }) => {
      if (error) console.error('Erro ao salvar configurações no Supabase:', error)
    })
  },

  addManualPresence(studentId: string, date: string, classTitle: string) {
    const student = this.getStudent(studentId)
    if (student && checkDemoBlock(student.academyId)) return
    initializeStorage()
    const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = students.findIndex(s => s.id === studentId)
    if (idx !== -1) {
      students[idx].presencas.unshift({
        data: date,
        horario: 'Manual',
        treino: classTitle
      })
      localStorage.setItem('jiupro_students', JSON.stringify(students))
      this.checkAndAwardBadges(studentId)
      
      // Notify student about manual presence
      this.addNotification(
        studentId,
        'Presença Lançada',
        `Uma presença manual no treino "${classTitle}" foi creditada em sua ficha pelo professor.`
      )
    }
  },

  addManualInvoice(studentId: string, mes: string, vencimento: string, valor: string) {
    const student = this.getStudent(studentId)
    if (student && checkDemoBlock(student.academyId)) return
    initializeStorage()
    const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = students.findIndex(s => s.id === studentId)
    if (idx !== -1) {
      students[idx].financeiro.unshift({
        mes,
        vencimento,
        valor,
        status: 'Atrasado'
      })
      localStorage.setItem('jiupro_students', JSON.stringify(students))

      // Notify student about manual invoice
      this.addNotification(
        studentId,
        'Mensalidade Lançada',
        `Uma mensalidade para o mês de ${mes} (Vencimento: ${vencimento}) no valor de R$ ${valor} foi gerada.`
      )
    }
  },

  reactivateAcademy(academyId: string) {
    initializeStorage()
    const academies: Academy[] = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
    const idx = academies.findIndex(a => a.id === academyId)
    if (idx !== -1) {
      academies[idx].status = 'Ativo'
      localStorage.setItem('jiupro_academies', JSON.stringify(academies))
    }
  },

  // Auth Session Simulate
  registerAcademy(academyName: string, ownerName: string, email: string, plan: 'Prata' | 'Ouro' | 'BlackBelt'): User {
    initializeStorage()
    const academies: Academy[] = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
    const users: User[] = JSON.parse(localStorage.getItem('jiupro_users') || '[]')

    const academyId = academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
    const newAcademy: Academy = {
      id: academyId,
      name: academyName,
      ownerName,
      ownerEmail: email,
      plan,
      status: 'Ativo',
      professorGrade: 'Faixa Preta',
      mensalidadePadrao: '150,00',
      diaVencimento: '10',
      whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE
    }

    const userId = 'user-' + Math.floor(Math.random() * 100000)
    const newUser: User = {
      id: userId,
      academyId,
      name: ownerName,
      email,
      role: 'Dono',
      grade: 'Faixa Preta'
    }

    academies.push(newAcademy)
    users.push(newUser)

    localStorage.setItem('jiupro_academies', JSON.stringify(academies))
    localStorage.setItem('jiupro_users', JSON.stringify(users))

    // Initialize blank turmas and checkins
    const turmas: Record<string, ClassSession[]> = JSON.parse(localStorage.getItem('jiupro_turmas') || '{}')
    turmas[academyId] = [
      { id: academyId + '-t1', horario: '19:30', nome: 'Treino Principal', dias: 'Seg, Qua, Sex' }
    ]
    localStorage.setItem('jiupro_turmas', JSON.stringify(turmas))

    const checkins: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    checkins[academyId] = []
    localStorage.setItem('jiupro_checkins', JSON.stringify(checkins))

    // Create session cookie
    document.cookie = `jiupro_session=${newUser.id}; path=/; max-age=86400; SameSite=Strict;`

    return newUser
  },

  getLoggedInUser(): User | null {
    if (typeof window === 'undefined') return null
    initializeStorage()
    
    // Simple cookie parser
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith('jiupro_session='))
    if (!sessionCookie) return null
    
    const userId = sessionCookie.split('=')[1]
    const users = this.getUsers()
    return users.find(u => u.id === userId) || null
  },

  // Student Auth Session
  loginStudent(email: string, password: string): Student | null {
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const student = all.find(s => s.email.toLowerCase() === email.toLowerCase() && (s.password || '123456') === password)
    if (student) {
      document.cookie = `jiupro_student_session=${student.id}; path=/; max-age=86400; SameSite=Strict;`
      return student
    }
    return null
  },

  logoutStudent() {
    document.cookie = 'jiupro_student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;'
  },

  getLoggedInStudent(): Student | null {
    if (typeof window === 'undefined') return null
    initializeStorage()
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith('jiupro_student_session='))
    if (!sessionCookie) return null
    
    const studentId = sessionCookie.split('=')[1]
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    return all.find(s => s.id === studentId) || null
  },

  registerStudent(academyId: string, nome: string, email: string, passwordStr: string): Student | null {
    initializeStorage()
    const academy = this.getAcademy(academyId)
    if (!academy) return null

    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    
    // Check if email already exists
    if (all.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('E-mail já cadastrado!')
    }

    const newId = Date.now().toString()
    const newStudent: Student = {
      id: newId,
      academyId,
      nome,
      email,
      faixa: 'Branca',
      graus: 0,
      status: 'Ativo',
      dataMatricula: new Date().toISOString().split('T')[0],
      mensalidade: academy.mensalidadePadrao,
      chavePix: academy.ownerEmail,
      graduadoPor: 'Auto-cadastro',
      mestreOriginal: academy.ownerName,
      password: passwordStr,
      financeiro: [
        {
          mes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          vencimento: new Date(Date.now() + 86400000 * 5).toLocaleDateString('pt-BR'), // 5 days from now
          valor: academy.mensalidadePadrao,
          status: 'Atrasado'
        }
      ],
      presencas: []
    }

    all.push(newStudent)
    localStorage.setItem('jiupro_students', JSON.stringify(all))

    // Background push to Supabase - Student
    supabase.from('students').upsert({
      id: newStudent.id,
      academy_id: newStudent.academyId,
      nome: newStudent.nome,
      email: newStudent.email,
      password: newStudent.password || '123456',
      faixa: newStudent.faixa,
      graus: newStudent.graus,
      status: newStudent.status,
      data_matricula: newStudent.dataMatricula,
      mensalidade: newStudent.mensalidade,
      dia_vencimento: '10',
      chave_pix: newStudent.chavePix,
      peso: '',
      altura: '',
      badges: []
    }).then(({ error }) => {
      if (error) console.error('Erro ao registrar atleta no Supabase:', error)
    })

    // Background push to Supabase - Default Invoice
    if (newStudent.financeiro.length > 0) {
      supabase.from('invoices').insert({
        student_id: newStudent.id,
        mes: newStudent.financeiro[0].mes,
        vencimento: newStudent.financeiro[0].vencimento,
        valor: newStudent.financeiro[0].valor,
        status: newStudent.financeiro[0].status
      }).then(({ error }) => {
        if (error) console.error('Erro ao cadastrar fatura inicial no Supabase:', error)
      })
    }

    // Notify academy owner (find user of that academy)
    const users: User[] = JSON.parse(localStorage.getItem('jiupro_users') || '[]')
    const admin = users.find(u => u.academyId === academyId)
    if (admin) {
      this.addNotification(
        admin.id,
        'Novo Auto-Cadastro',
        `${nome} se cadastrou na sua academia pelo link de convite.`
      )
    }

    return newStudent
  },

  // Password Recovery
  resetUserPassword(email: string, isStudent: boolean, newPasswordStr: string): boolean {
    initializeStorage()
    if (isStudent) {
      const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
      const idx = all.findIndex(s => s.email.toLowerCase() === email.toLowerCase())
      if (idx !== -1) {
        all[idx].password = newPasswordStr
        localStorage.setItem('jiupro_students', JSON.stringify(all))
        return true
      }
    } else {
      const all: User[] = JSON.parse(localStorage.getItem('jiupro_users') || '[]')
      const idx = all.findIndex(u => u.email.toLowerCase() === email.toLowerCase())
      if (idx !== -1) {
        all[idx].password = newPasswordStr
        localStorage.setItem('jiupro_users', JSON.stringify(all))
        return true
      }
    }
    return false
  },

  // Social Feed functions
  getPosts(academyId: string): Post[] {
    initializeStorage()
    const all: Post[] = JSON.parse(localStorage.getItem('jiupro_posts') || '[]')
    return all
      .filter(p => p.academyId === academyId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  addPost(academyId: string, authorId: string, authorName: string, authorFaixa: string | undefined, content: string): Post {
    initializeStorage()
    const all: Post[] = JSON.parse(localStorage.getItem('jiupro_posts') || '[]')
    const newPost: Post = {
      id: 'post-' + Date.now(),
      academyId,
      authorId,
      authorName,
      authorFaixa,
      content,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    }
    all.push(newPost)
    localStorage.setItem('jiupro_posts', JSON.stringify(all))
    return newPost
  },

  likePost(postId: string, userId: string) {
    initializeStorage()
    const all: Post[] = JSON.parse(localStorage.getItem('jiupro_posts') || '[]')
    const idx = all.findIndex(p => p.id === postId)
    if (idx !== -1) {
      const post = all[idx]
      const likeIdx = post.likes.indexOf(userId)
      if (likeIdx === -1) {
        post.likes.push(userId)
      } else {
        post.likes.splice(likeIdx, 1)
      }
      all[idx] = post
      localStorage.setItem('jiupro_posts', JSON.stringify(all))
    }
  },

  addComment(postId: string, authorId: string, authorName: string, content: string): Comment {
    initializeStorage()
    const all: Post[] = JSON.parse(localStorage.getItem('jiupro_posts') || '[]')
    const idx = all.findIndex(p => p.id === postId)
    if (idx !== -1) {
      const comment: Comment = {
        id: 'comment-' + Date.now(),
        authorId,
        authorName,
        content,
        timestamp: new Date().toISOString()
      }
      all[idx].comments.push(comment)
      localStorage.setItem('jiupro_posts', JSON.stringify(all))

      // Notify post author if it is a different student
      if (all[idx].authorId !== authorId) {
        this.addNotification(
          all[idx].authorId,
          'Comentário na sua Publicação',
          `${authorName} comentou no seu post: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
        )
      }

      return comment
    }
    throw new Error('Post não encontrado')
  },

  // checkAndAwardBadges helper
  checkAndAwardBadges(studentId: string) {
    const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = students.findIndex(s => s.id === studentId)
    if (idx === -1) return
    
    const student = students[idx]
    if (!student.badges) student.badges = []

    let changed = false

    // Badge 1: Primeiro Passo
    if (student.presencas.length >= 1 && !student.badges.includes('primeiro-passo')) {
      student.badges.push('primeiro-passo')
      this.addNotification(studentId, 'Nova Conquista Desbloqueada!', 'Parabéns! Você ganhou a medalha "Primeiro Passo" ao concluir seu primeiro treino!')
      changed = true
    }

    // Badge 2: Frequência de Ferro
    if (student.presencas.length >= 3 && !student.badges.includes('frequencia-ferro')) {
      student.badges.push('frequencia-ferro')
      this.addNotification(studentId, 'Nova Conquista Desbloqueada!', 'Incrível! Você ganhou a medalha "Frequência de Ferro" ao acumular 3 treinos!')
      changed = true
    }

    // Badge 3: Sem Kimono (NoGi)
    const hasNoGi = student.presencas.some(p => p.treino.toLowerCase().includes('nogi'))
    if (hasNoGi && !student.badges.includes('nogi')) {
      student.badges.push('nogi')
      this.addNotification(studentId, 'Nova Conquista Desbloqueada!', 'Técnica apurada! Você ganhou a medalha "Sem Kimono" ao treinar NoGi!')
      changed = true
    }

    if (changed) {
      students[idx] = student
      localStorage.setItem('jiupro_students', JSON.stringify(students))
    }
  },

  // Notifications
  getNotifications(userId: string): Notification[] {
    initializeStorage()
    const all: Notification[] = JSON.parse(localStorage.getItem('jiupro_notifications') || '[]')
    return all
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  addNotification(userId: string, title: string, description: string): Notification {
    initializeStorage()
    const all: Notification[] = JSON.parse(localStorage.getItem('jiupro_notifications') || '[]')
    const newNotif: Notification = {
      id: 'notif-' + Date.now() + Math.random().toString().substring(2, 6),
      userId,
      title,
      description,
      timestamp: new Date().toISOString(),
      read: false
    }
    all.push(newNotif)
    localStorage.setItem('jiupro_notifications', JSON.stringify(all))
    return newNotif
  },

  markNotificationsRead(userId: string) {
    initializeStorage()
    const all: Notification[] = JSON.parse(localStorage.getItem('jiupro_notifications') || '[]')
    let changed = false
    all.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true
        changed = true
      }
    })
    if (changed) {
      localStorage.setItem('jiupro_notifications', JSON.stringify(all))
    }
  },

  // Products and Sales (Store)
  getProducts(academyId: string): Product[] {
    initializeStorage()
    const all: Product[] = JSON.parse(localStorage.getItem('jiupro_products') || '[]')
    return all.filter(p => p.academyId === academyId)
  },

  getSales(academyId: string): Sale[] {
    initializeStorage()
    const all: Sale[] = JSON.parse(localStorage.getItem('jiupro_sales') || '[]')
    return all
      .filter(s => s.academyId === academyId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  },

  recordSale(academyId: string, studentId: string, productId: string): Sale {
    if (checkDemoBlock(academyId)) return {} as Sale
    initializeStorage()
    const products: Product[] = JSON.parse(localStorage.getItem('jiupro_products') || '[]')
    const sales: Sale[] = JSON.parse(localStorage.getItem('jiupro_sales') || '[]')
    const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')

    const prodIdx = products.findIndex(p => p.id === productId && p.academyId === academyId)
    if (prodIdx === -1) throw new Error('Produto não encontrado')
    const product = products[prodIdx]

    if (product.estoque <= 0) throw new Error('Produto fora de estoque')

    const student = students.find(s => s.id === studentId)
    if (!student) throw new Error('Atleta não encontrado')

    // Decrement stock
    products[prodIdx].estoque -= 1
    localStorage.setItem('jiupro_products', JSON.stringify(products))

    // Record sale
    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      academyId,
      studentId,
      studentName: student.nome,
      productName: product.nome,
      valor: product.preco,
      data: new Date().toISOString()
    }
    sales.push(newSale)
    localStorage.setItem('jiupro_sales', JSON.stringify(sales))

    // Notify student about product purchase
    this.addNotification(
      studentId,
      'Compra Registrada',
      `Você adquiriu o item "${product.nome}" no valor de R$ ${product.preco}.`
    )

    return newSale
  },

  // Performance and Tournament Logging
  updateStudentPerformance(studentId: string, peso: string, altura: string) {
    const student = this.getStudent(studentId)
    if (student && checkDemoBlock(student.academyId)) return
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = all.findIndex(s => s.id === studentId)
    if (idx !== -1) {
      all[idx].peso = peso
      all[idx].altura = altura
      localStorage.setItem('jiupro_students', JSON.stringify(all))
    }
  },

  addTournamentResult(studentId: string, campeonato: string, data: string, categoria: string, resultado: 'Ouro' | 'Prata' | 'Bronze' | 'Participação'): TournamentResult {
    const student = this.getStudent(studentId)
    if (student && checkDemoBlock(student.academyId)) return {} as TournamentResult
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = all.findIndex(s => s.id === studentId)
    if (idx === -1) throw new Error('Atleta não encontrado')

    const newResult: TournamentResult = {
      id: 'tour-' + Date.now(),
      campeonato,
      data,
      categoria,
      resultado
    }

    if (!all[idx].tournaments) all[idx].tournaments = []
    all[idx].tournaments!.push(newResult)

    // Check for medals achievements
    const countGold = all[idx].tournaments!.filter(t => t.resultado === 'Ouro').length
    if (countGold >= 1 && !all[idx].badges?.includes('campeao')) {
      if (!all[idx].badges) all[idx].badges = []
      all[idx].badges!.push('campeao')
      
      this.addNotification(
        studentId,
        'Nova Conquista Desbloqueada!',
        'Parabéns! Você ganhou a medalha "Campeão de Tatame" ao conquistar um Ouro!'
      )
    }

    localStorage.setItem('jiupro_students', JSON.stringify(all))
    return newResult
  },

  // Announcements methods
  getAnnouncements(academyId: string): Announcement[] {
    initializeStorage()
    if (typeof window === 'undefined') return []
    const all: Record<string, Announcement[]> = JSON.parse(localStorage.getItem('jiupro_announcements') || '{}')
    return all[academyId] || []
  },

  addAnnouncement(academyId: string, titulo: string, conteudo: string, categoria: 'Informativo' | 'Alerta' | 'Evento'): Announcement {
    if (checkDemoBlock(academyId)) return {} as Announcement
    initializeStorage()
    if (typeof window === 'undefined') return {} as Announcement
    const all: Record<string, Announcement[]> = JSON.parse(localStorage.getItem('jiupro_announcements') || '{}')
    if (!all[academyId]) all[academyId] = []
    
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      academyId,
      titulo,
      conteudo,
      categoria,
      data: new Date().toISOString()
    }
    
    all[academyId].unshift(newAnn)
    localStorage.setItem('jiupro_announcements', JSON.stringify(all))
    return newAnn
  },

  removeAnnouncement(academyId: string, id: string): Announcement[] {
    if (checkDemoBlock(academyId)) return []
    initializeStorage()
    if (typeof window === 'undefined') return []
    const all: Record<string, Announcement[]> = JSON.parse(localStorage.getItem('jiupro_announcements') || '{}')
    if (all[academyId]) {
      all[academyId] = all[academyId].filter(a => a.id !== id)
      localStorage.setItem('jiupro_announcements', JSON.stringify(all))
    }
    return all[academyId] || []
  },

  // Training Journal methods
  getJournals(studentId: string): JournalEntry[] {
    initializeStorage()
    if (typeof window === 'undefined') return []
    const all: Record<string, JournalEntry[]> = JSON.parse(localStorage.getItem('jiupro_journals') || '{}')
    return all[studentId] || []
  },

  addJournalEntry(studentId: string, categoria: 'Kimono' | 'NoGi', posicao: string, notas: string): JournalEntry {
    const student = this.getStudent(studentId)
    if (student && checkDemoBlock(student.academyId)) return {} as JournalEntry
    initializeStorage()
    if (typeof window === 'undefined') return {} as JournalEntry
    const all: Record<string, JournalEntry[]> = JSON.parse(localStorage.getItem('jiupro_journals') || '{}')
    if (!all[studentId]) all[studentId] = []
    
    const newEntry: JournalEntry = {
      id: 'journ-' + Date.now(),
      studentId,
      data: new Date().toISOString(),
      categoria,
      posicao,
      notas
    }
    
    all[studentId].unshift(newEntry)
    localStorage.setItem('jiupro_journals', JSON.stringify(all))
    return newEntry
  },

  // Superadmin Utility Methods
  superadminGetAcademies(): Academy[] {
    initializeStorage()
    if (typeof window === 'undefined') return DEFAULT_ACADEMIAS
    return JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
  },

  superadminSetAcademyStatus(academyId: string, status: 'Ativo' | 'Suspenso') {
    initializeStorage()
    const academies = this.superadminGetAcademies()
    const idx = academies.findIndex(a => a.id === academyId)
    if (idx !== -1) {
      academies[idx].status = status
      localStorage.setItem('jiupro_academies', JSON.stringify(academies))
    }
    // Update on Supabase
    supabase.from('academies').update({ status }).eq('id', academyId).then(({ error }) => {
      if (error) console.error('Erro ao atualizar status da academia no Supabase:', error)
    })
  },

  superadminSetAcademyPlan(academyId: string, plan: 'Prata' | 'Ouro' | 'BlackBelt') {
    initializeStorage()
    const academies = this.superadminGetAcademies()
    const idx = academies.findIndex(a => a.id === academyId)
    if (idx !== -1) {
      academies[idx].plan = plan
      localStorage.setItem('jiupro_academies', JSON.stringify(academies))
    }
    // Update on Supabase
    supabase.from('academies').update({ plan }).eq('id', academyId).then(({ error }) => {
      if (error) console.error('Erro ao atualizar plano no Supabase:', error)
    })
  }
}
