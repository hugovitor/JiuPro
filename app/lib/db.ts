// app/lib/db.ts

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
    graus: 2,
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
    { id: '1', nome: 'Carlos Silva', faixa: 'Azul', graus: 2, status: 'Pendente', horario: '19:30' },
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
}

// Expose APIs
export const db = {
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
    return target
  },

  updateStudentBelt(id: string, belt: string, degrees: number) {
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = all.findIndex(s => s.id === id)
    if (idx !== -1) {
      all[idx].faixa = belt
      all[idx].graus = degrees
      localStorage.setItem('jiupro_students', JSON.stringify(all))
    }
  },

  updateStudentInvoices(id: string, invoices: Invoice[]) {
    initializeStorage()
    const all: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
    const idx = all.findIndex(s => s.id === id)
    if (idx !== -1) {
      all[idx].financeiro = invoices
      localStorage.setItem('jiupro_students', JSON.stringify(all))
    }
  },

  saveClass(academyId: string, classData: Omit<ClassSession, 'id'> & { id?: string }): ClassSession {
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
    initializeStorage()
    const all: Record<string, ClassSession[]> = JSON.parse(localStorage.getItem('jiupro_turmas') || '{}')
    if (all[academyId]) {
      all[academyId] = all[academyId].filter(c => c.id !== classId)
      localStorage.setItem('jiupro_turmas', JSON.stringify(all))
    }
  },

  confirmCheckIn(academyId: string, studentId: string, status: 'Confirmado' | 'Faltou') {
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

    // If confirmed, add presence to student record
    if (status === 'Confirmado') {
      const students: Student[] = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
      const sIdx = students.findIndex(s => s.id === studentId)
      if (sIdx !== -1) {
        const student = students[sIdx]
        const today = new Date().toISOString().split('T')[0]
        
        // Avoid duplicate presences on the same day/time
        const alreadyRegistered = student.presencas.some(p => p.data === today)
        if (!alreadyRegistered) {
          student.presencas.unshift({
            data: today,
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'h',
            treino: 'Treino Validado'
          })
          localStorage.setItem('jiupro_students', JSON.stringify(students))
          this.checkAndAwardBadges(studentId)
        }
      }
    }
  },

  studentCheckIn(academyId: string, studentId: string, classTime: string) {
    initializeStorage()
    const allCheckins: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    if (!allCheckins[academyId]) allCheckins[academyId] = []

    const student = this.getStudent(studentId)
    if (!student) return

    // Avoid duplicate checkins for same student in the check-in list
    const exists = allCheckins[academyId].some(c => c.id === studentId)
    if (!exists) {
      allCheckins[academyId].push({
        id: studentId,
        nome: student.nome,
        faixa: student.faixa,
        graus: student.graus,
        status: 'Pendente',
        horario: classTime
      })
      localStorage.setItem('jiupro_checkins', JSON.stringify(allCheckins))
    }
  },

  studentCancelCheckIn(academyId: string, studentId: string) {
    initializeStorage()
    const allCheckins: Record<string, CheckIn[]> = JSON.parse(localStorage.getItem('jiupro_checkins') || '{}')
    if (allCheckins[academyId]) {
      allCheckins[academyId] = allCheckins[academyId].filter(c => c.id !== studentId)
      localStorage.setItem('jiupro_checkins', JSON.stringify(allCheckins))
    }
  },

  updateAcademySettings(academyId: string, settings: { mensalidadePadrao: string; diaVencimento: string; whatsappTemplate?: string }) {
    initializeStorage()
    const academies: Academy[] = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
    const idx = academies.findIndex(a => a.id === academyId)
    if (idx !== -1) {
      academies[idx].mensalidadePadrao = settings.mensalidadePadrao
      academies[idx].diaVencimento = settings.diaVencimento
      if (settings.whatsappTemplate !== undefined) {
        academies[idx].whatsappTemplate = settings.whatsappTemplate
      }
      localStorage.setItem('jiupro_academies', JSON.stringify(academies))
    }
  },

  addManualPresence(studentId: string, date: string, classTitle: string) {
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
  }
}
