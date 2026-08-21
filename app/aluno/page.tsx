// app/aluno/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { db, Student, Academy, ClassSession, Post, TournamentResult, Announcement, JournalEntry } from '../lib/db'
import { supabase } from '../lib/supabase'
import PwaBanner from '../components/PwaBanner'
import BeltVisual from '../components/BeltVisual'

function AreaDoAlunoContent() {
  const router = useRouter()
  
  const [student, setStudent] = useState<Student | null>(null)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [checkins, setCheckins] = useState<any[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'treinos' | 'feed' | 'performance' | 'financeiro' | 'carteirinha'>('treinos')
  
  // Post states
  const [newPostContent, setNewPostContent] = useState('')
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  // Journal entries states
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [showNewJournalForm, setShowNewJournalForm] = useState(false)
  const [journalPosicao, setJournalPosicao] = useState('')
  const [journalNotas, setJournalNotas] = useState('')
  const [journalCat, setJournalCat] = useState<'Kimono' | 'NoGi'>('Kimono')

  // Top Attendance Leaderboard calculation
  const getTopFrequencia = () => {
    if (!student) return []
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const all = db.getStudents(student.academyId)
    
    const ranking = all.map(s => {
      const presencesInMonth = s.presencas.filter(p => {
        const d = new Date(p.data + 'T00:00:00')
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }).length
      return {
        nome: s.nome,
        faixa: s.faixa,
        quantidade: presencesInMonth
      }
    })
    
    return ranking.sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
  }

  // Journal Entry Save handler
  const handleSaveJournalEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !journalPosicao || !journalNotas) return
    
    db.addJournalEntry(student.id, journalCat, journalPosicao, journalNotas)
    
    // Refresh list
    setJournals(db.getJournals(student.id))
    setJournalPosicao('')
    setJournalNotas('')
    setShowNewJournalForm(false)
  }

  // Share Badge
  const handleShareBadge = (badgeName: string, badgeDesc: string) => {
    if (!student) return
    const content = `Desbloqueei uma conquista no JiuPro! 🏆\n\nMedalha: "${badgeName}" (${badgeDesc})\n\nConstância e evolução a cada treino! Oss! 🥋💪`
    db.addPost(student.academyId, student.id, student.nome, student.faixa, content)
    
    // Auto switch to community tab
    setActiveTab('feed')
    setPosts(db.getPosts(student.academyId))
  }

  // Share Tournament Result
  const handleShareTournament = (t: TournamentResult) => {
    if (!student) return
    const medalText = t.resultado === 'Ouro' ? '🥇 Ouro' : t.resultado === 'Prata' ? '🥈 Prata' : t.resultado === 'Bronze' ? '🥉 Bronze' : '🏅 Participação'
    const content = `Subi no pódio! Conquistei o resultado de ${medalText} no campeonato "${t.campeonato}" (Categoria: ${t.categoria})!\n\nMuito obrigado a todos os parceiros de treino da ${academy?.name || 'JiuPro'}! Oss! 🥋💪`
    db.addPost(student.academyId, student.id, student.nome, student.faixa, content)
    
    // Auto switch to community tab
    setActiveTab('feed')
    setPosts(db.getPosts(student.academyId))
  }

  // Weekday Presence counts helper
  const getWeekdayPresenceCounts = () => {
    if (!student) return { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0 }
    const counts = { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0 }
    student.presencas.forEach(p => {
      const d = new Date(p.data + 'T00:00:00')
      const day = d.getDay()
      if (day === 1) counts.Seg++
      else if (day === 2) counts.Ter++
      else if (day === 3) counts.Qua++
      else if (day === 4) counts.Qui++
      else if (day === 5) counts.Sex++
      else if (day === 6) counts.Sáb++
    })
    return counts
  }

  // Month Calendar Details helper
  const getMonthCalendarDetails = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const firstDayWeekday = firstDay.getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    const monthName = today.toLocaleDateString('pt-BR', { month: 'long' })
    const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    return { year, month, totalDays, firstDayWeekday, formattedMonth }
  }

  // Presence Days Set helper
  const getPresenceDaysSet = () => {
    const daysSet = new Set<number>()
    if (!student) return daysSet
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    student.presencas.forEach(p => {
      const pDate = new Date(p.data + 'T00:00:00')
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        daysSet.add(pDate.getDate())
      }
    })
    return daysSet
  }

  // Notifications Bell
  const [showNotifications, setShowNotifications] = useState(false)

  // Performance inputs
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [tourName, setTourName] = useState('')
  const [tourDate, setTourDate] = useState('')
  const [tourCategory, setTourCategory] = useState('')
  const [tourResult, setTourResult] = useState<'Ouro' | 'Prata' | 'Bronze' | 'Participação'>('Participação')

  // PIX Modal
  const [showPixModal, setShowPixModal] = useState(false)
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Feedback states
  const [perfError, setPerfError] = useState('')
  const [perfSuccess, setPerfSuccess] = useState('')
  const [tourError, setTourError] = useState('')
  const [tourSuccess, setTourSuccess] = useState('')

  const handleCheckoutCartao = async () => {
    if (!student || !academy) return
    setIsProcessingCheckout(true)
    try {
      // Buscar email fresco do Supabase para garantir que nunca seja nulo/indefinido
      let emailParaCheckout = student.email

      if (!emailParaCheckout || !emailParaCheckout.includes('@')) {
        const { data: freshStudent } = await supabase
          .from('students')
          .select('email')
          .eq('id', student.id)
          .single()
        
        if (freshStudent?.email) {
          emailParaCheckout = freshStudent.email
        }
      }

      if (!emailParaCheckout || !emailParaCheckout.includes('@')) {
        alert('Não foi possível identificar seu e-mail para o pagamento. Por favor, faça login novamente.')
        setIsProcessingCheckout(false)
        return
      }

      const response = await fetch('/api/checkout/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student.id,
          plano: academy.plan,
          academyId: academy.id,
          email: emailParaCheckout,
        }),
      })

      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao gerar sessão de pagamento no cartão.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão ao processar checkout de cartão.')
    } finally {
      setIsProcessingCheckout(false)
    }
  }

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !student) return

    setIsUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('studentId', student.id)

    try {
      const res = await fetch('/api/aluno/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        // Atualizar localStorage local
        const s = db.getLoggedInStudent()
        if (s) {
          s.avatarUrl = data.url
          // Salvar de volta no localStorage
          const allStds = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
          const idx = allStds.findIndex((st: any) => st.id === student.id)
          if (idx !== -1) {
            allStds[idx] = s
            localStorage.setItem('jiupro_students', JSON.stringify(allStds))
          }
          // Forçar recarregamento local
          setStudent({ ...student, avatarUrl: data.url } as any)
        }
        alert('Foto de perfil atualizada com sucesso!')
      } else {
        alert(data.error || 'Erro ao carregar imagem de perfil.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão ao enviar imagem.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const loadData = () => {
    const s = db.getLoggedInStudent()
    if (!s) {
      router.push('/aluno/login')
      return
    }
    
    setStudent(s)
    setPeso(s.peso || '')
    setAltura(s.altura || '')
    setNotifications(db.getNotifications(s.id))

    const ac = db.getAcademy(s.academyId)
    if (ac) setAcademy(ac)

    const classList = db.getClasses(s.academyId)
    setClasses(classList)

    const activeCheckins = db.getCheckIns(s.academyId)
    setCheckins(activeCheckins)

    // Load social posts
    const socialPosts = db.getPosts(s.academyId)
    setPosts(socialPosts)

    // Load announcements & journals
    setAnnouncements(db.getAnnouncements(s.academyId))
    setJournals(db.getJournals(s.id))
    
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
    const loggedStudent = db.getLoggedInStudent()
    
    // Checar status do pagamento vindo do Stripe Checkout
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const payStatus = params.get('status')
      if (payStatus === 'success_payment') {
        if (loggedStudent) {
          // 1. Dar baixa na fatura em atraso no estado local
          const updated = { ...loggedStudent }
          const pendingIdx = updated.financeiro.findIndex(f => f.status === 'Atrasado')
          if (pendingIdx !== -1) {
            updated.financeiro[pendingIdx].status = 'Pago'
            const allStds = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
            const sIdx = allStds.findIndex((st: any) => st.id === loggedStudent.id)
            if (sIdx !== -1) {
              allStds[sIdx] = updated
              localStorage.setItem('jiupro_students', JSON.stringify(allStds))
            }
            // 2. Dar baixa no Supabase
            supabase
              .from('invoices')
              .update({ status: 'Pago' })
              .eq('student_id', loggedStudent.id)
              .eq('status', 'Atrasado')
              .then(() => {
                db.syncWithSupabase(loggedStudent.academyId).then(() => loadData())
              })
          }
        }
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
        alert('Pagamento confirmado com sucesso! Sua mensalidade já foi quitada. Oss!')
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (payStatus === 'cancel_payment') {
        alert('Pagamento cancelado.')
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    if (loggedStudent) {
      db.syncWithSupabase(loggedStudent.academyId).then(() => {
        loadData()
      })
    }
  }, [])

  // Check if checking-in is expired (more than 15 minutes after class start)
  const isCheckInExpired = (classTime: string) => {
    const [hours, minutes] = classTime.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return false

    const now = new Date()
    const classDateTime = new Date()
    classDateTime.setHours(hours, minutes, 0, 0)

    const limitDateTime = new Date(classDateTime.getTime() + 15 * 60 * 1000)
    return now.getTime() > limitDateTime.getTime()
  }

  // Alterna o agendamento da aula (check-in)
  const handleCheckInToggle = (classTime: string, classTitle: string) => {
    if (!student || !academy) return

    const jaCheckedIn = checkins.some(c => c.id === student.id && c.horario === classTime)

    if (jaCheckedIn) {
      db.studentCancelCheckIn(academy.id, student.id, classTime)
      setTimeout(() => {
        loadData()
      }, 300)
    } else {
      if (isCheckInExpired(classTime)) {
        alert('Este treino já iniciou há mais de 15 minutos. Não é mais possível realizar o check-in.')
        return
      }
      db.studentCheckIn(academy.id, student.id, classTime)
      
      // Auto confirm the checkin for simulation and award badges immediately
      setTimeout(() => {
        db.confirmCheckIn(academy.id, student.id, 'Confirmado', classTime)
        
        // Rewrite manual treino name if class title is available
        const updatedStudent = db.getLoggedInStudent()
        if (updatedStudent && updatedStudent.presencas.length > 0) {
          const pIdx = updatedStudent.presencas.findIndex(p => p.data === new Date().toISOString().split('T')[0] && p.horario === classTime)
          if (pIdx !== -1) {
            updatedStudent.presencas[pIdx].treino = classTitle
          } else {
            updatedStudent.presencas[0].treino = classTitle
          }
          // Save it back
          const allStds = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
          const idx = allStds.findIndex((st: any) => st.id === student.id)
          if (idx !== -1) {
            allStds[idx] = updatedStudent
            localStorage.setItem('jiupro_students', JSON.stringify(allStds))
          }
        }
        
        db.checkAndAwardBadges(student.id)
        loadData()
      }, 1000)
    }

    // Reload checkins
    const updated = db.getCheckIns(academy.id)
    setCheckins(updated)
  }

  const handleLogout = () => {
    db.logoutStudent()
    router.push('/aluno/login')
  }

  // Social feed Handlers
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !newPostContent.trim()) return

    db.addPost(student.academyId, student.id, student.nome, student.faixa, newPostContent.trim())
    setNewPostContent('')
    setPosts(db.getPosts(student.academyId))
  }

  const handleLikePost = (postId: string) => {
    if (!student) return
    db.likePost(postId, student.id)
    setPosts(db.getPosts(student.academyId))
  }

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault()
    if (!student) return
    const content = commentInputs[postId] || ''
    if (!content.trim()) return

    db.addComment(postId, student.id, student.nome, content.trim())
    
    // Clear comment input
    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }))
    
    setPosts(db.getPosts(student.academyId))
  }

  const handleCommentChange = (postId: string, val: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: val
    }))
  }

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault()
    setPerfError('')
    setPerfSuccess('')

    if (!student) return

    try {
      db.updateStudentPerformance(student.id, peso, altura)
      setPerfSuccess('Métricas atualizadas com sucesso!')
      loadData()
    } catch (err) {
      setPerfError('Erro ao atualizar métricas.')
    }
  }

  const handleAddTournament = (e: React.FormEvent) => {
    e.preventDefault()
    setTourError('')
    setTourSuccess('')

    if (!student) return
    if (!tourName || !tourDate || !tourCategory) {
      setTourError('Preencha todos os campos do campeonato.')
      return
    }

    try {
      db.addTournamentResult(student.id, tourName, tourDate, tourCategory, tourResult)
      setTourSuccess('Resultado esportivo lançado!')
      setTourName('')
      setTourDate('')
      setTourCategory('')
      setTourResult('Participação')
      loadData()
    } catch (err) {
      setTourError('Erro ao salvar torneio.')
    }
  }

  const handleMarkNotificationsRead = () => {
    if (!student) return
    db.markNotificationsRead(student.id)
    setNotifications(db.getNotifications(student.id))
  }

  const handleOpenPixModal = (index: number) => {
    setSelectedInvoiceIndex(index)
    setShowPixModal(true)
  }

  const handleSimulatePixConfirm = () => {
    if (!student || selectedInvoiceIndex === null) return
    setIsProcessingPayment(true)

    setTimeout(() => {
      // Get student copy
      const studentsList = JSON.parse(localStorage.getItem('jiupro_students') || '[]')
      const sIdx = studentsList.findIndex((s: any) => s.id === student.id)
      if (sIdx !== -1) {
        studentsList[sIdx].financeiro[selectedInvoiceIndex].status = 'Pago'
        localStorage.setItem('jiupro_students', JSON.stringify(studentsList))
      }

      // Add Notification
      db.addNotification(
        student.id,
        'Pagamento Confirmado',
        `Sua mensalidade de ${student.financeiro[selectedInvoiceIndex].mes} foi compensada com sucesso.`
      )

      setIsProcessingPayment(false)
      setShowPixModal(false)
      
      // Trigger confetti animation
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3500)
      
      loadData()
    }, 1200)
  }

  const handleBaixarTermoMatriculaPDF = async () => {
    if (!student || !academy) return
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      const academyName = academy?.name || 'Academia de Jiu-Jitsu'
      const masterName = academy?.ownerName || 'Professor Responsável'

      // Header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS & TERMO DE MATRÍCULA', 14, 18)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Unidade / Academia: ${academyName}`, 14, 25)
      doc.text(`Responsável Técnico: ${masterName}`, 14, 30)
      doc.text(`Data de Emissão (2ª Via): ${new Date().toLocaleDateString('pt-BR')}`, 14, 35)

      doc.setDrawColor(200, 200, 200)
      doc.line(14, 38, 196, 38)

      // Section 1: Qualificação do Atleta
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('1. DADOS DO(A) ATLETA / CONTRATANTE', 14, 45)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text(`Nome Completo: ${student.nome}`, 14, 52)
      doc.text(`E-mail: ${student.email}`, 14, 57)
      doc.text(`Graduação Atual: Faixa ${student.faixa} (${student.graus} Graus)`, 14, 62)
      doc.text(`Data de Matrícula: ${student.dataMatricula || new Date().toLocaleDateString('pt-BR')}`, 14, 67)
      doc.text(`Valor da Mensalidade: R$ ${student.mensalidade}`, 14, 72)

      doc.line(14, 76, 196, 76)

      // Section 2: Cláusulas do Contrato
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('2. CLÁUSULAS CONTRATUAIS E REGULAMENTO DO TATAME', 14, 83)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      const clausulas = [
        'CLÁUSULA 1ª (DO OBJETO): O presente contrato tem por objeto a ministração de aulas práticas e teóricas de Jiu-Jitsu e artes marciais pela CONTRATADA ao(à) ALUNO(A).',
        'CLÁUSULA 2ª (DAS MENSALIDADES): O pagamento das mensalidades deverá ser efetuado até a data de vencimento estipulada neste termo, sob pena de suspensão do acesso às dependências e treinos da academia.',
        'CLÁUSULA 3ª (DA APTIDÃO FÍSICA E ISENÇÃO DE RESPONSABILIDADE): O(a) ATLETA declara estar em perfeitas condições físicas e de saúde para a prática de artes marciais de contato. A CONTRATADA e seus instrutores não se responsabilizam por lesões decorrentes da prática natural esportiva ou de desrespeito às orientações.',
        'CLÁUSULA 4ª (DAS NORMAS DE CONDUTA E HIGIENE): É obrigatório o uso de kimono oficial limpo, unhas cortadas, higiene pessoal adequada e total respeito aos mestres, instrutores e colegas de treino, zelando pela integridade moral e física de todos.',
        'CLÁUSULA 5ª (DO USO DE IMAGEM): O(a) CONTRATANTE autoriza a utilização de sua imagem e voz, colhidas no ambiente de treino ou eventos esportivos, para fins de divulgação da academia nas redes sociais e mídias institucionais.',
        'CLÁUSULA 6ª (DO CANCELAMENTO OU TRANCAMENTO): O cancelamento ou trancamento da matrícula deverá ser comunicado formalmente à recepção da academia com antecedência mínima de 30 (trinta) dias.'
      ]

      let yPos = 90
      clausulas.forEach(c => {
        const splitText = doc.splitTextToSize(c, 182)
        doc.text(splitText, 14, yPos)
        yPos += (splitText.length * 4) + 2
      })

      // Section 3: Assinaturas
      yPos = Math.max(yPos + 8, 230)
      doc.line(14, yPos - 5, 196, yPos - 5)

      doc.text('Declaro que li, compreendi e concordo plenamente com todas as cláusulas e regulamentos descritos acima.', 14, yPos)

      yPos += 20
      doc.line(20, yPos, 90, yPos)
      doc.line(120, yPos, 190, yPos)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(`${student.nome}`, 55, yPos + 4, { align: 'center' })
      doc.text('Assinatura Digital do(a) Aluno(a)', 55, yPos + 8, { align: 'center' })

      doc.text(`${academyName}`, 155, yPos + 4, { align: 'center' })
      doc.text('Diretoria / Mestre Responsável', 155, yPos + 8, { align: 'center' })

      doc.save(`Termo_Matricula_${student.nome.replace(/\s+/g, '_')}.pdf`)
    } catch (err: any) {
      console.error(err)
      alert('Erro ao gerar documento.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-slate-400">Acessando tatame...</div>
      </div>
    )
  }

  if (!student || !academy) return null

  // Evolução do aluno
  const getMetaAulas = (faixa: string) => {
    const metaMap: Record<string, number> = {
      'Branca': 50,
      'Cinza e Branca': 55,
      'Cinza': 60,
      'Cinza e Preta': 60,
      'Amarela e Branca': 60,
      'Amarela': 60,
      'Amarela e Preta': 60,
      'Laranja e Branca': 60,
      'Laranja': 60,
      'Laranja e Preta': 60,
      'Verde e Branca': 60,
      'Verde': 60,
      'Verde e Preta': 60,
      'Azul': 100,
      'Roxa': 150,
      'Marrom': 200,
      'Preta': 250,
      'Vermelha e Preta': 300,
      'Vermelha e Branca': 350,
      'Vermelha': 400
    }
    return metaMap[faixa] || 50
  }

  const getEstatisticasAluno = () => {
    if (!student) return { total: 0, esteMes: 0, ultimoParceiro: 'Nenhum parceiro recente' }

    const total = student.presencas.length
    
    // Count this month's presences
    const now = new Date()
    const currentMonth = now.getMonth() // 0-11
    const currentYear = now.getFullYear()
    
    const esteMes = student.presencas.filter(p => {
      if (!p.data) return false
      const parts = p.data.split('-') // "YYYY-MM-DD"
      const pYear = parseInt(parts[0])
      const pMonth = parseInt(parts[1]) - 1
      return pYear === currentYear && pMonth === currentMonth
    }).length

    // Find classmates from last check-in
    let ultimoParceiro = 'Nenhum parceiro recente'
    if (student.presencas.length > 0) {
      const ultimaPresenca = student.presencas[student.presencas.length - 1]
      // Get check-ins for the same class on that date
      const todosAgendamentos = db.getCheckIns(student.academyId)
      const parceiros = todosAgendamentos.filter(c => 
        c.horario === ultimaPresenca.horario &&
        c.id !== student.id &&
        c.status === 'Confirmado'
      )
      if (parceiros.length > 0) {
        ultimoParceiro = parceiros[0].nome
      }
    }

    return { total, esteMes, ultimoParceiro }
  }

  const { total: totalAulas, esteMes: aulasEsteMes, ultimoParceiro } = getEstatisticasAluno()

  const aulasConcluidas = student.presencas.length
  const aulasParaProximoGrau = getMetaAulas(student.faixa)
  const percentualProgresso = Math.min(
    Math.round((aulasConcluidas / aulasParaProximoGrau) * 100),
    100
  )

  // Achievements/Badges definitions
  const badgeGallery = [
    { id: 'primeiro-passo', name: 'Primeiro Passo', emoji: '🥋', desc: 'Concluiu a primeira aula na academia' },
    { id: 'frequencia-ferro', name: 'Frequência de Ferro', emoji: '🔥', desc: 'Acumulou 3 ou mais presenças nos treinos' },
    { id: 'nogi', name: 'Sem Kimono', emoji: '🤼', desc: 'Realizou check-in em uma aula NoGi' },
    { id: 'campeao', name: 'Campeão de Tatame', emoji: '🥇', desc: 'Conquistou Ouro em um campeonato' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12">
      
      {/* Confetti Overlay */}
      {showConfetti && (
        <>
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .confetti-piece {
              position: fixed;
              top: -20px;
              width: 8px;
              height: 12px;
              animation: fall 3s linear forwards;
              z-index: 100;
              pointer-events: none;
            }
          `}</style>
          {Array.from({ length: 40 }).map((_, i) => {
            const randomLeft = Math.random() * 100
            const randomDelay = Math.random() * 2
            const randomDuration = 2 + Math.random() * 1.5
            const colors = ['#e11d48', '#fbbf24', '#3b82f6', '#10b981', '#a855f7']
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            
            return (
              <div 
                key={i} 
                className="confetti-piece"
                style={{
                  left: `${randomLeft}%`,
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                  backgroundColor: randomColor
                }}
              />
            )
          })}
        </>
      )}

      {/* Perfil Superior */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Styled Belt Ribbon in Header */}
            <BeltVisual belt={student.faixa} degrees={student.graus} size="sm" showLabel={true} />
            {/* Foto de perfil / Avatar clicável */}
            <div className="relative group cursor-pointer flex-shrink-0">
              <label htmlFor="avatar-input" className="cursor-pointer block relative">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.nome}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 font-black text-xs">
                    {student.nome.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/45 rounded-full flex items-center justify-center">
                    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">{student.nome}</h1>
              <p className="text-[10px] text-slate-400 font-bold truncate">{academy.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Bell sininho dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all relative flex items-center justify-center bg-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.013 9.013 0 0 1-2.355-1.147M9.143 17.082a9.013 9.013 0 0 0 2.355-1.147m0 0a8.966 8.966 0 0 1-5.127-5.02L5.25 7.5A4.5 4.5 0 0 1 9.75 3h4.5a4.5 4.5 0 0 1 4.5 4.5l-.216 3.415a8.967 8.967 0 0 1-5.127 5.02m0 0V21m-2.102-1.378a1.5 1.5 0 0 0 4.204 0M8.625 12h7.5" />
                </svg>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2.5 z-20 space-y-2">
                  <div className="flex justify-between items-center px-3 border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-900 uppercase">Notificações</span>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={handleMarkNotificationsRead}
                        className="text-[9px] font-bold text-red-600 hover:underline"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto px-1 divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2 rounded text-[10px] leading-relaxed transition-all ${n.read ? 'text-slate-450' : 'bg-red-50/20 text-slate-800 font-medium'}`}>
                          <p className="font-bold text-slate-900">{n.title}</p>
                          <p className="mt-0.5">{n.description}</p>
                          <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
                            {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 text-center py-4">Nenhum aviso recebido.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg px-2 py-1.5 flex items-center gap-1 bg-white hover:bg-slate-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Abas de Navegação */}
      <div className="bg-white border-b border-slate-250/50 sticky top-[73px] z-10 flex text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('treinos')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'treinos' ? 'border-red-600 text-zinc-950' : 'border-transparent hover:text-slate-700'
          }`}
        >
          Evolução
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 min-w-[85px] py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'performance' ? 'border-red-600 text-zinc-950' : 'border-transparent hover:text-slate-700'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'feed' ? 'border-red-600 text-zinc-950' : 'border-transparent hover:text-slate-700'
          }`}
        >
          Comunidade
        </button>
        <button
          onClick={() => setActiveTab('financeiro')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'financeiro' ? 'border-red-600 text-zinc-950' : 'border-transparent hover:text-slate-700'
          }`}
        >
          Financeiro
        </button>
        {/* Carteirinha Digital temporarily removed */}
      </div>

      <main className="max-w-md mx-auto p-4 space-y-5">
        
        {/* Mural de Avisos Oficiais */}
        {announcements.length > 0 && (
          <div className="space-y-2.5">
            {announcements.map(ann => (
              <div 
                key={ann.id} 
                className={`p-3.5 rounded-xl border relative shadow-sm transition-all ${
                  ann.categoria === 'Alerta' ? 'bg-rose-50 border-rose-200 text-rose-950' :
                  ann.categoria === 'Evento' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                  'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex justify-between items-start gap-2 border-b border-dashed pb-1.5 mb-1.5 border-black/10">
                  <h4 className="text-[9px] font-black tracking-wider leading-none uppercase flex items-center gap-1">
                    {ann.categoria === 'Alerta' ? '🚨 Aviso Importante' : ann.categoria === 'Evento' ? '🎓 Evento / Seminário' : '📢 Comunicado'}
                  </h4>
                  <span className="text-[8px] font-bold opacity-60 flex-shrink-0 leading-none">
                    {new Date(ann.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h5 className="text-xs font-bold leading-tight text-slate-950">{ann.titulo}</h5>
                <p className="text-[10px] mt-1 leading-relaxed opacity-90">{ann.conteudo}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* ABA: TREINOS & EVOLUÇÃO */}
        {activeTab === 'treinos' && (
          <>
            {/* Progresso de Graus / Faixa (Visual 2.0) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Graduação Atual & Evolução</h3>
              
              {/* Belt representation */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-lg p-3">
                <div className="flex-shrink-0">
                  <BeltVisual belt={student.faixa} degrees={student.graus} size="md" showLabel={false} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Graduação</span>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Faixa {student.faixa} • {student.graus} Grau{student.graus !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>Aulas Assistidas: {aulasConcluidas}/{aulasParaProximoGrau}</span>
                  <span>{Math.round(percentualProgresso)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentualProgresso}%` }}
                  />
                </div>
              </div>
              
              <p className="text-[11px] text-slate-400 font-medium">
                {aulasConcluidas >= aulasParaProximoGrau ? (
                  <span className="text-emerald-600 font-semibold">Parabéns! Você concluiu a meta mínima de aulas para avaliação técnica.</span>
                ) : (
                  <>Faltam apenas <span className="font-bold text-slate-700">{aulasParaProximoGrau - aulasConcluidas} presenças</span> para avaliação.</>
                )}
              </p>
            </div>

            {/* Estatísticas Avançadas do Tatame */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Minhas Estatísticas no Tatame</h3>
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Presenças no Mês</span>
                  <p className="text-lg font-black text-slate-800 mt-1">{aulasEsteMes} treinos</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Acumulado</span>
                  <p className="text-lg font-black text-slate-800 mt-1">{totalAulas} aulas</p>
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Último Colega de Treino</span>
                  <p className="text-xs font-semibold text-slate-850 mt-0.5">{ultimoParceiro}</p>
                </div>
                <span className="text-base">🤝</span>
              </div>
            </div>


            {/* Quadro de Badges / Conquistas */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Minhas Conquistas</h3>
              
              <div className="grid grid-cols-4 gap-2.5">
                {badgeGallery.map(bg => {
                  const hasBadge = student.badges?.includes(bg.id)
                  return (
                    <div 
                      key={bg.id}
                      title={bg.desc}
                      className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[90px] ${
                        hasBadge 
                          ? 'bg-amber-50/50 border-amber-200 opacity-100' 
                          : 'bg-slate-50 border-slate-150 opacity-40 grayscale'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{bg.emoji}</span>
                        <span className="text-[7.5px] font-black tracking-tight mt-1 truncate w-full text-slate-950">{bg.name}</span>
                      </div>
                      {hasBadge && (
                        <button
                          type="button"
                          onClick={() => handleShareBadge(bg.name, bg.desc)}
                          className="mt-1 text-[7px] text-red-600 hover:text-red-800 transition-colors font-bold uppercase tracking-wide hover:underline cursor-pointer"
                        >
                          Compartilhar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Listagem de Treinos Disponíveis */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Treinos Disponíveis</h2>
              
              {classes.map((treino) => {
                const statusCheckin = checkins.find(c => c.id === student.id && c.horario === treino.id)
                const checkInFeito = !!statusCheckin
                const isConfirmed = statusCheckin?.status === 'Confirmado'
                const parceiros = checkins.filter(c => c.horario === treino.id && c.id !== student.id)

                return (
                  <div 
                    key={treino.id}
                    className={`p-4 rounded-xl border transition-all space-y-4 ${
                      checkInFeito 
                        ? isConfirmed 
                          ? 'bg-emerald-950 border-emerald-900 text-white shadow-md' 
                          : 'bg-zinc-950 border-zinc-950 text-white shadow-md' 
                        : 'bg-white border-slate-200/70 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          checkInFeito ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {treino.horario}h
                        </span>
                        <h3 className="text-sm font-semibold tracking-tight pt-1">{treino.nome}</h3>
                        <p className={`text-[11px] ${checkInFeito ? 'text-zinc-400' : 'text-slate-400'}`}>
                          {treino.dias} • Semanal
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCheckInToggle(treino.id, treino.nome)}
                        disabled={!checkInFeito && isCheckInExpired(treino.horario)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                          checkInFeito
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer'
                            : isCheckInExpired(treino.horario)
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm cursor-pointer'
                        }`}
                      >
                        {checkInFeito ? 'Desistir' : isCheckInExpired(treino.horario) ? 'Expirado' : 'Agendar'}
                      </button>
                    </div>

                    {parceiros.length > 0 && (
                      <div className={`pt-3 border-t text-xs ${
                        checkInFeito ? 'border-zinc-800' : 'border-slate-100'
                      }`}>
                        <p className={`text-[10px] font-bold pb-2 ${checkInFeito ? 'text-zinc-400' : 'text-slate-400'}`}>
                          Parceiros escalados:
                        </p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {parceiros.map((p, idx) => {
                            const getBeltColorClass = (faixa: string) => {
                              const f = (faixa || '').toLowerCase()
                              if (f === 'branca') return 'bg-white border border-slate-300'
                              if (f === 'azul') return 'bg-blue-600'
                              if (f === 'roxa') return 'bg-purple-600'
                              if (f === 'marrom') return 'bg-amber-800'
                              if (f === 'preta') return 'bg-zinc-950 border border-zinc-800'
                              if (f.includes('laranja')) return 'bg-orange-500'
                              if (f.includes('amarela')) return 'bg-yellow-400'
                              if (f.includes('verde')) return 'bg-emerald-600'
                              if (f.includes('cinza')) return 'bg-slate-400'
                              if (f.includes('vermelha') || f.includes('coral')) return 'bg-red-650'
                              return 'bg-slate-300'
                            }

                            return (
                              <div 
                                key={idx} 
                                className={`h-6 px-2.5 rounded-md flex items-center gap-1.5 font-bold text-[9px] border ${
                                  checkInFeito 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                                    : 'bg-slate-50 border-slate-200/60 text-slate-700'
                                }`}
                              >
                                <span>{p.nome} <span className="opacity-60 font-medium">({p.faixa})</span></span>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getBeltColorClass(p.faixa)}`} />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Calendário de Frequência Mensal (Habit Tracker) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Frequência Mensal</h3>
                {(() => {
                  const { formattedMonth, year } = getMonthCalendarDetails()
                  return (
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-full">
                      📅 {formattedMonth} / {year}
                    </span>
                  )
                })()}
              </div>

              {(() => {
                const { totalDays, firstDayWeekday } = getMonthCalendarDetails()
                const presenceDays = getPresenceDaysSet()
                const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                
                // Adjusting grid array to pre-pad start weekday offset
                const calendarCells = []
                for (let i = 0; i < firstDayWeekday; i++) {
                  calendarCells.push(null)
                }
                for (let i = 1; i <= totalDays; i++) {
                  calendarCells.push(i)
                }

                return (
                  <div className="space-y-2">
                    {/* Header weekdays label */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[8.5px] font-bold text-slate-400 uppercase">
                      {weekdays.map(d => <div key={d}>{d}</div>)}
                    </div>
                    {/* Grid days */}
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {calendarCells.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="h-7" />
                        }
                        const hasTrained = presenceDays.has(day)
                        return (
                          <div 
                            key={`day-${day}`}
                            className={`h-7 w-7 rounded-lg text-[10px] font-black flex items-center justify-center mx-auto transition-all ${
                              hasTrained 
                                ? 'bg-emerald-600 border border-emerald-700 text-white shadow-sm scale-105' 
                                : 'bg-slate-50 border border-slate-200/50 text-slate-400'
                            }`}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-end gap-3 pt-2 text-[8px] font-bold text-slate-400 uppercase border-t border-slate-50 mt-1">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-600 block border border-emerald-700" /> Presença</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-slate-50 block border border-slate-200/50" /> Sem Registro</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Gráfico de Assiduidade Semanal (CSS Premium) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assiduidade Semanal</h3>
              
              {(() => {
                const weekdayCounts = getWeekdayPresenceCounts()
                const maxCount = Math.max(...Object.values(weekdayCounts), 1)
                const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                
                return (
                  <div className="grid grid-cols-6 gap-2 pt-2 items-end">
                    {days.map(d => {
                      const val = (weekdayCounts as any)[d]
                      const pct = Math.max(10, Math.round((val / maxCount) * 100))
                      return (
                        <div key={d} className="flex flex-col items-center gap-2">
                          <span className="text-[8px] font-bold text-slate-400">{val}x</span>
                          <div className="w-4 h-16 bg-slate-50 rounded-full flex flex-col justify-end overflow-hidden border border-slate-100">
                            <div 
                              className="w-full bg-gradient-to-t from-red-600 to-rose-500 rounded-full transition-all duration-500 shadow-sm"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-700">{d}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            {/* Hall da Fama - Leaderboard do Mês */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.75a1.125 1.125 0 0 1-1.125-1.125V3.375c0-.621-.503-1.125-1.125-1.125h-1.5a1.125 1.125 0 0 0-1.125 1.125v3.375M16.5 18.75V15.75M12 3v1.5m0 3v1.5m0 3v1.5m-3-6h6m-6 3h6" />
                </svg>
                Hall da Fama (Frequência no Mês)
              </h3>
              
              <div className="space-y-2">
                {(() => {
                  const leaderboard = getTopFrequencia()
                  const medals = ['🥇', '🥈', '🥉', '🥋', '🥋']
                  
                  return leaderboard.map((row, index) => (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs font-semibold border ${
                        index === 0 ? 'bg-amber-50/50 border-amber-200 text-amber-900' :
                        index === 1 ? 'bg-slate-50 border-slate-200 text-slate-900' :
                        index === 2 ? 'bg-orange-50/50 border-orange-200 text-orange-900' :
                        'bg-white border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{medals[index]}</span>
                        <span className="font-bold">{row.nome}</span>
                        <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1 py-0.2 rounded uppercase">
                          {row.faixa}
                        </span>
                      </div>
                      <span className="font-black font-mono">{row.quantidade} treinos</span>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* Histórico Recente */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Presenças Históricas</h3>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {student.presencas.length > 0 ? (
                  student.presencas.map((p, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between text-xs items-center">
                      <span className="font-semibold text-slate-800">{p.treino}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 py-2 text-center">Nenhum treino confirmado.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ABA: PERFORMANCE & SAÚDE */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            
            {/* Ficha Física */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Parâmetros Biométricos</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Informe seu peso e altura para cálculo e controle.</p>
              </div>

              {perfError && <p className="text-[11px] text-red-600">{perfError}</p>}
              {perfSuccess && <p className="text-[11px] text-emerald-600 font-bold">{perfSuccess}</p>}

              <form onSubmit={handleSaveMetrics} className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Peso (kg)</label>
                  <input
                    type="number"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ex: 82"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 font-bold text-slate-800 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Altura (m)</label>
                  <input
                    type="text"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="Ex: 1.80"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 font-bold text-slate-800 mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 shadow-sm"
                  >
                    Salvar Métricas
                  </button>
                </div>
              </form>
            </div>

            {/* Cadastro de Resultado de Torneios */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Adicionar Medalha / Torneio</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Registre suas lutas e conquistas externas de kimono ou nogi.</p>
              </div>

              {tourError && <p className="text-[11px] text-red-600">{tourError}</p>}
              {tourSuccess && <p className="text-[11px] text-emerald-600 font-bold">{tourSuccess}</p>}

              <form onSubmit={handleAddTournament} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nome do Campeonato</label>
                  <input
                    type="text"
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                    placeholder="Ex: Campeonato Estadual IBJJF"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-850 mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Data</label>
                    <input
                      type="date"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-850 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoria</label>
                    <input
                      type="text"
                      value={tourCategory}
                      onChange={(e) => setTourCategory(e.target.value)}
                      placeholder="Ex: Master 1 Médio"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-850 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resultado Obtido</label>
                  <select
                    value={tourResult}
                    onChange={(e) => setTourResult(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-850 mt-1 font-bold"
                  >
                    <option value="Ouro">🥇 Ouro (Campeão)</option>
                    <option value="Prata">🥈 Prata (Vice-campeão)</option>
                    <option value="Bronze">🥉 Bronze (3º lugar)</option>
                    <option value="Participação">Participação</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 shadow-sm"
                >
                  Registrar Torneio
                </button>
              </form>
            </div>

            {/* Listagem de Torneios do Atleta */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850">Seu Histórico de Competições</h3>
                
                {/* Medal board */}
                <div className="flex gap-2">
                  <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                    🥇 {student.tournaments?.filter(t => t.resultado === 'Ouro').length || 0}
                  </span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                    🥈 {student.tournaments?.filter(t => t.resultado === 'Prata').length || 0}
                  </span>
                  <span className="text-[10px] bg-orange-50 border border-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">
                    🥉 {student.tournaments?.filter(t => t.resultado === 'Bronze').length || 0}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {student.tournaments && student.tournaments.length > 0 ? (
                  student.tournaments.map((t) => (
                    <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50/40 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{t.campeonato}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')} • {t.categoria}</p>
                        <button
                          type="button"
                          onClick={() => handleShareTournament(t)}
                          className="mt-1 text-[8px] text-red-600 hover:underline font-bold uppercase tracking-wider block"
                        >
                          Compartilhar no Feed
                        </button>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                        t.resultado === 'Ouro' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        t.resultado === 'Prata' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        t.resultado === 'Bronze' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {t.resultado}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-xs text-slate-400">Nenhum torneio cadastrado.</p>
                )}
              </div>
            </div>

            {/* Seção: Diário de Treino (Caderno de Posições) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  Diário de Treinos
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewJournalForm(!showNewJournalForm)}
                  className="px-2.5 py-1 bg-zinc-950 text-white font-bold rounded text-[10px] uppercase hover:bg-zinc-850 transition-colors shadow-sm cursor-pointer"
                >
                  {showNewJournalForm ? 'Fechar' : 'Anotar Posição'}
                </button>
              </div>

              {showNewJournalForm && (
                <form onSubmit={handleSaveJournalEntry} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Tipo de Treino</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setJournalCat('Kimono')}
                        className={`flex-1 py-1 text-xs font-bold rounded border transition-all ${
                          journalCat === 'Kimono' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        🥋 Kimono
                      </button>
                      <button
                        type="button"
                        onClick={() => setJournalCat('NoGi')}
                        className={`flex-1 py-1 text-xs font-bold rounded border transition-all ${
                          journalCat === 'NoGi' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        🤼 NoGi
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Posição / Técnica Estudada</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Raspagem de gancho, passagem de meia guarda..."
                      value={journalPosicao}
                      onChange={(e) => setJournalPosicao(e.target.value)}
                      className="w-full px-2.5 py-1.5 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Detalhes / Notas Técnicas</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Anotações sobre pegadas, alavancas e ajuste de peso..."
                      value={journalNotas}
                      onChange={(e) => setJournalNotas(e.target.value)}
                      className="w-full px-2.5 py-1.5 mt-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Salvar no Diário
                  </button>
                </form>
              )}

              {/* Timeline of Journals */}
              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {journals.length > 0 ? (
                  journals.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-slate-200 pl-3.5 relative space-y-1">
                      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400 border border-white" />
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[8px] border ${
                          entry.categoria === 'Kimono' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {entry.categoria}
                        </span>
                        <span className="text-slate-400 font-bold">
                          {new Date(entry.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{entry.posicao}</h4>
                      <p className="text-[10px] text-slate-500 font-medium whitespace-pre-wrap leading-relaxed italic bg-slate-50/50 p-2 rounded border border-slate-100/50">
                        {entry.notas}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">Você ainda não tem anotações em seu caderno técnico. Comece anotando o que aprendeu hoje!</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ABA: REDE SOCIAL */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            
            {/* Criar Postagem */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Compartilhe algo com a galera da academia! Treino de hoje pago? Oss!"
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 transition-colors text-slate-800 font-medium placeholder-slate-400 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                  >
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    Publicar
                  </button>
                </div>
              </form>
            </div>

            {/* Listagem de Posts */}
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => {
                  const hasLiked = post.likes.includes(student.id)
                  
                  return (
                    <div key={post.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                      {/* Cabeçalho do Post */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const authorStudent = db.getStudent(post.authorId)
                            if (authorStudent && authorStudent.avatarUrl) {
                              return (
                                <img
                                  src={authorStudent.avatarUrl}
                                  alt={post.authorName}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200"
                                />
                              )
                            }
                            return (
                              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                                {post.authorName.substring(0, 2)}
                              </div>
                            )
                          })()}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 leading-none">{post.authorName}</span>
                              {post.authorFaixa && (
                                <span className="text-[8px] font-black uppercase bg-zinc-900 text-white px-1.5 py-0.5 rounded leading-none">
                                  {post.authorFaixa}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(post.timestamp).toLocaleDateString('pt-BR')} às {new Date(post.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* Botão de Like */}
                      <div className="flex items-center border-t border-b border-slate-100 py-1.5 text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
                            hasLiked ? 'text-red-600' : 'hover:text-zinc-950'
                          }`}
                        >
                          <svg className="h-4 w-4" fill={hasLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                          {post.likes.length} {post.likes.length === 1 ? 'Curtida' : 'Curtidas'}
                        </button>
                      </div>

                      {/* Comentários */}
                      <div className="space-y-3.5">
                        {post.comments.length > 0 && (
                          <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-h-40 overflow-y-auto">
                            {post.comments.map((comm) => (
                              <div key={comm.id} className="text-[10px] leading-relaxed">
                                <span className="font-bold text-slate-900">{comm.authorName}: </span>
                                <span className="text-slate-750 font-medium">{comm.content}</span>
                                <span className="block text-[8px] text-slate-400 font-bold mt-0.5">
                                  {new Date(comm.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Criar Comentário */}
                        <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            placeholder="Escreva um comentário..."
                            required
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-zinc-950 transition-colors text-slate-900 font-medium placeholder-slate-400"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            Enviar
                          </button>
                        </form>
                      </div>

                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">Nenhum post publicado na comunidade desta unidade ainda.</p>
              )}
            </div>

          </div>
        )}

        {/* ABA: PAINEL FINANCEIRO */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Mensalidades & Faturas</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Histórico completo de pagamentos. PIX ou Cartão.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleBaixarTermoMatriculaPDF}
                    className="text-[10px] font-bold text-zinc-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    2ª Via do Contrato (PDF)
                  </button>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                      ✅ Pagas: {student.financeiro.filter(i => i.status === 'Pago').length}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded font-bold">
                      ❌ Atrasadas: {student.financeiro.filter(i => i.status === 'Atrasado').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {[...student.financeiro].reverse().map((inv, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900 capitalize">{inv.mes}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Vencimento: {inv.vencimento} • R$ {inv.valor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        inv.status === 'Pago'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {inv.status === 'Pago' ? '✅ Pago' : '❌ Atrasado'}
                      </span>
                      {inv.status === 'Atrasado' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenPixModal(student.financeiro.indexOf(inv))}
                            className="bg-zinc-100 text-zinc-800 border border-zinc-200 text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-zinc-200 transition-colors"
                          >
                            PIX
                          </button>
                          {academy?.stripeConnectId && (
                            <button
                              onClick={handleCheckoutCartao}
                              disabled={isProcessingCheckout}
                              className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                              {isProcessingCheckout ? '...' : 'Cartão'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {student.financeiro.length === 0 && (
                  <p className="py-6 text-center text-[10px] text-slate-400">Nenhuma fatura registrada ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA: CARTEIRINHA DIGITAL */}
        {activeTab === 'carteirinha' && (
          <div className="space-y-4 animate-fade-in font-sans">
            {/* Card Premium */}
            <div className="w-full bg-zinc-950 text-white rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden p-6 space-y-6">
              {/* Background gradient effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Top Row: Brand & Academy */}
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-white rounded flex items-center justify-center border-r-[2.5px] border-red-600 shadow-sm flex-shrink-0">
                    <span className="text-zinc-950 font-black text-[10px] italic tracking-tighter">JP</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">Carteirinha Digital Atleta</span>
                </div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                  {academy?.name || 'JiuPro'}
                </span>
              </div>

              {/* Middle Row: Photo, Belt Visual and Name */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xl text-white shadow-inner flex-shrink-0 relative overflow-hidden">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.nome} className="h-full w-full object-cover" />
                  ) : (
                    student.nome.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <h2 className="text-base font-bold tracking-tight truncate text-white">{student.nome}</h2>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Graus & Graduação:</span>
                    <div className="flex items-center gap-2">
                      <BeltVisual belt={student.faixa} degrees={student.graus} size="sm" />
                      <span className="text-[10px] font-bold text-zinc-350">{student.faixa} • {student.graus}G</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Date & QR Code Scan */}
              <div className="flex justify-between items-end pt-2 border-t border-zinc-900">
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide block">Membro Desde</span>
                  <span className="text-[10px] text-zinc-200 font-bold">{student.dataMatricula || '10/08/2026'}</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide block text-right">Validação Presencial</span>
                  <div className="h-20 w-20 bg-white p-1 rounded-lg border border-zinc-800 flex items-center justify-center">
                    <img 
                      src={`https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=jiupro:checkin:${student.id}:${student.academyId}&choe=UTF-8`} 
                      alt="Check-in QR" 
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ficha Médica e de Segurança de Acesso rápido */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                🩺 Histórico de Saúde & Prontuário
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Alergias</span>
                  <p className="font-bold text-slate-700">{student.alergias || 'Nenhuma alergia relatada'}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Lesões e Restrições</span>
                  <p className="font-bold text-rose-600">{student.lesoes || 'Nenhuma lesão ativa'}</p>
                </div>
              </div>

              {student.observacoesMedicas && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Observações do Mestre</span>
                  <p className="font-semibold text-slate-600">{student.observacoesMedicas}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL PIX PAGAMENTO */}
      {showPixModal && selectedInvoiceIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4 relative animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-650"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <h3 className="font-bold text-sm text-slate-900">Pagamento de Mensalidade</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                Referente a {student.financeiro[selectedInvoiceIndex].mes}
              </p>
            </div>

            {/* Fictional QR Code SVG */}
            <div className="h-40 w-40 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-center mx-auto relative p-2 shadow-inner">
              <svg className="h-full w-full text-zinc-900" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="20" height="20" />
                <rect x="14" y="14" width="12" height="12" fill="white" />
                <rect x="70" y="10" width="20" height="20" />
                <rect x="74" y="14" width="12" height="12" fill="white" />
                <rect x="10" y="70" width="20" height="20" />
                <rect x="14" y="74" width="12" height="12" fill="white" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="45" y="45" width="10" height="10" fill="white" />
                <rect x="42" y="12" width="6" height="15" />
                <rect x="15" y="42" width="15" height="6" />
                <rect x="75" y="45" width="12" height="6" />
                <rect x="52" y="75" width="25" height="15" />
              </svg>
            </div>

            {/* Pix Copy Key */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-center flex flex-col items-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Código Pix Copia e Cola</span>
              <span className="text-[10px] font-mono font-bold text-slate-700 truncate w-full max-w-[280px] mt-1 select-all">
                00020126580014BR.GOV.BCB.PIX0114{student.chavePix}5204000053039865406{student.financeiro[selectedInvoiceIndex].valor}5802BR5915JiuProTatame6009SAO_PAULO62070503***6304CA1F
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSimulatePixConfirm}
                disabled={isProcessingPayment}
                className="w-full py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-850 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
              >
                {isProcessingPayment ? (
                  'Processando compensação...'
                ) : (
                  <>
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Simular Compensação PIX
                  </>
                )}
              </button>
              <p className="text-[9px] text-slate-400 font-semibold">O status será atualizado na hora em ambos os painéis.</p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default function AreaDoAlunoPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-400">Carregando tatame do aluno...</div>}>
        <AreaDoAlunoContent />
      </Suspense>
      <PwaBanner />
    </>
  )
}
