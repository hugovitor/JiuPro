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
}

export interface User {
  id: string
  academyId: string
  name: string
  email: string
  role: 'Professor' | 'Dono'
  grade: string
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

// Initial mockup data
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
    diaVencimento: '10'
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
    diaVencimento: '05'
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
    diaVencimento: '15'
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
    localStorage.setItem('jiupro_users', JSON.stringify(DEFAULT_USERS))
  }
  if (!localStorage.getItem('jiupro_students')) {
    localStorage.setItem('jiupro_students', JSON.stringify(DEFAULT_STUDENTS))
  }
  if (!localStorage.getItem('jiupro_turmas')) {
    localStorage.setItem('jiupro_turmas', JSON.stringify(DEFAULT_TURMAS))
  }
  if (!localStorage.getItem('jiupro_checkins')) {
    localStorage.setItem('jiupro_checkins', JSON.stringify(DEFAULT_CHECKINS))
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

  updateAcademySettings(academyId: string, settings: { mensalidadePadrao: string; diaVencimento: string }) {
    initializeStorage()
    const academies: Academy[] = JSON.parse(localStorage.getItem('jiupro_academies') || '[]')
    const idx = academies.findIndex(a => a.id === academyId)
    if (idx !== -1) {
      academies[idx].mensalidadePadrao = settings.mensalidadePadrao
      academies[idx].diaVencimento = settings.diaVencimento
      localStorage.setItem('jiupro_academies', JSON.stringify(academies))
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
      diaVencimento: '10'
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
  }
}
