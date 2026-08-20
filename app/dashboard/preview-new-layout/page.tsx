// app/dashboard/preview-new-layout/page.tsx
'use client'

import { useState } from 'react'

export default function PreviewNewLayoutPage() {
  const [activeMenu, setActiveMenu] = useState('Dashboard')

  // Dados Mockados baseados na imagem enviada
  const stats = [
    { label: 'Alunos ativos', value: '250', detail: '↑ 12% este mês', icon: '👥' },
    { label: 'Turmas', value: '18', detail: '↑ 2 este mês', icon: '🥋' },
    { label: 'Receita mensal', value: 'R$ 45.680,00', detail: '↑ 8% este mês', icon: '💰', highlight: true },
    { label: 'Mensalidades em aberto', value: '32', detail: '↓ 5% este mês', icon: '⚠️' }
  ]

  const classes = [
    { name: 'Jiu-Jitsu Infantil', time: 'Hoje • 18:00', instructor: 'Professor João', capacity: '12 alunos' },
    { name: 'Jiu-Jitsu Adulto', time: 'Hoje • 19:30', instructor: 'Professor Carlos', capacity: '18 alunos' },
    { name: 'Jiu-Jitsu Avançado', time: 'Amanhã • 07:00', instructor: 'Professor Bruno', capacity: '8 alunos' }
  ]

  const birthdays = [
    { initials: 'LO', name: 'Lucas Oliveira', date: '05/06' },
    { initials: 'RL', name: 'Rafael Lima', date: '12/06' },
    { initials: 'GS', name: 'Gabriel Souza', date: '28/06' }
  ]

  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Alunos', icon: '👥' },
    { name: 'Turmas', icon: '📅' },
    { name: 'Treinos', icon: '🥋' },
    { name: 'Financeiro', icon: '💵' },
    { name: 'Relatórios', icon: '📈' },
    { name: 'Graduações', icon: '🎖️' },
    { name: 'Comunicados', icon: '📢' },
    { name: 'Configurações', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0c0c0e] border-r border-[#1a1a1e] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white italic tracking-tighter text-base shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              JP
            </div>
            <span className="text-lg font-black tracking-tight uppercase">
              Jiu<span className="text-red-500 font-extrabold">Pro</span>
            </span>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeMenu === item.name
                    ? 'bg-[#18181b] text-red-500 shadow-inner border-l-2 border-red-500'
                    : 'text-zinc-400 hover:text-zinc-150 hover:bg-[#121214]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar Banner */}
        <div className="mt-8 pt-6 border-t border-[#1a1a1e] text-center space-y-2">
          <div className="text-red-500 font-black text-2xl italic tracking-tighter">JP</div>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Focado em performance.<br/>Feito para professores.</p>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-[#0c0c0e]/80 border-b border-[#1a1a1e] backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-zinc-400">Dashboard</h1>
            <p className="text-xs font-light text-zinc-500">Visão geral da sua academia</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">🔍</span>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-48 bg-[#121214] border border-[#1a1a1e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            {/* Notification Bell */}
            <button className="p-2 rounded-xl bg-[#121214] border border-[#1a1a1e] text-zinc-400 hover:text-zinc-200 relative">
              🔔
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {/* Profile */}
            <div className="flex items-center gap-2 border-l border-[#1a1a1e] pl-4">
              <div className="h-8 w-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-xs font-black text-red-500">
                HV
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-none">Hugo Vitor</p>
                <p className="text-[9px] text-zinc-500 font-light mt-0.5">Professor</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* QUICK STATS CARDS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0c0c0e] border border-[#1a1a1e] p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-zinc-800 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</span>
                  <span className="text-sm p-1.5 rounded-lg bg-[#121214] border border-[#1a1a1e]">{stat.icon}</span>
                </div>
                <div className="mt-4">
                  <span className={`text-2xl font-black tracking-tight ${stat.highlight ? 'text-emerald-500' : 'text-white'}`}>
                    {stat.value}
                  </span>
                  <p className="text-[9px] text-zinc-500 mt-1 font-semibold">{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* GRAPH SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart (Receita) */}
            <div className="bg-[#0c0c0e] border border-[#1a1a1e] p-6 rounded-2xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Receita dos últimos 6 meses</h3>
                <span className="text-[10px] bg-[#121214] border border-[#1a1a1e] px-2.5 py-1 rounded-lg text-zinc-400 font-bold">6 meses ▾</span>
              </div>

              {/* SVG Mockup Line Chart */}
              <div className="h-44 w-full relative pt-2">
                <svg className="w-full h-full" viewBox="0 0 600 150" fill="none" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#121214" strokeWidth="1" />
                  <line x1="0" y1="70" x2="600" y2="70" stroke="#121214" strokeWidth="1" />
                  <line x1="0" y1="110" x2="600" y2="110" stroke="#121214" strokeWidth="1" />

                  {/* Gradient Area under line */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 110 L 150 90 L 250 100 L 350 70 L 450 65 L 550 40 L 550 140 L 50 140 Z"
                    fill="url(#chartGradient)"
                  />

                  {/* Line */}
                  <path
                    d="M 50 110 L 150 90 L 250 100 L 350 70 L 450 65 L 550 40"
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points */}
                  <circle cx="50" cy="110" r="5" fill="#ef4444" stroke="#09090b" strokeWidth="2" />
                  <circle cx="150" cy="90" r="5" fill="#ef4444" stroke="#09090b" strokeWidth="2" />
                  <circle cx="250" cy="100" r="5" fill="#ef4444" stroke="#09090b" strokeWidth="2" />
                  <circle cx="350" cy="70" r="5" fill="#ef4444" stroke="#09090b" strokeWidth="2" />
                  <circle cx="450" cy="65" r="5" fill="#ef4444" stroke="#09090b" strokeWidth="2" />
                  <circle cx="550" cy="40" r="5" fill="#ef4444" stroke="#09090b" strokeWidth="2" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[9px] font-bold text-zinc-500 mt-2 px-6">
                  <span>Jan</span>
                  <span>Fev</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>Mai</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>

            {/* Donut Chart (Alunos por faixa) */}
            <div className="bg-[#0c0c0e] border border-[#1a1a1e] p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Alunos por faixa</h3>

              <div className="flex items-center justify-between gap-4">
                {/* SVG Donut */}
                <div className="relative h-28 w-28 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#121214" strokeWidth="3" />
                    
                    {/* Branca 40% (stroke-dasharray: 40 60, offset: 0) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeDasharray="40 60" strokeDashoffset="0" />
                    
                    {/* Azul 25% (stroke-dasharray: 25 75, offset: -40) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeDasharray="25 75" strokeDashoffset="-40" />
                    
                    {/* Roxa 15% (stroke-dasharray: 15 85, offset: -65) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="-65" />
                    
                    {/* Marrom 10% (stroke-dasharray: 10 90, offset: -80) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#78350f" strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="-80" />
                    
                    {/* Preta 10% (stroke-dasharray: 10 90, offset: -90) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#18181b" strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-black">250</span>
                    <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-bold">Atletas</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="flex-1 space-y-1.5 text-[9px] font-bold text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-white inline-block border border-zinc-700" /> Branca</span>
                    <span className="text-zinc-300">40%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-600 inline-block" /> Azul</span>
                    <span className="text-zinc-300">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600 inline-block" /> Roxa</span>
                    <span className="text-zinc-300">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-900 inline-block" /> Marrom</span>
                    <span className="text-zinc-300">10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-zinc-900 inline-block border border-zinc-750" /> Preta</span>
                    <span className="text-zinc-300">10%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* LOWER GRID (CLASSES & BIRTHDAYS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Próximas turmas */}
            <div className="bg-[#0c0c0e] border border-[#1a1a1e] p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Próximas turmas</h3>
                <button className="text-[10px] text-red-500 font-bold hover:underline">Ver todas as turmas</button>
              </div>

              <div className="divide-y divide-[#1a1a1e]">
                {classes.map((cls, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm border border-[#1a1a1e]">
                        🥋
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{cls.name}</h4>
                        <p className="text-[9px] text-zinc-500 font-medium mt-0.5">{cls.instructor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{cls.time.split(' • ')[1]}</p>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{cls.capacity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aniversariantes */}
            <div className="bg-[#0c0c0e] border border-[#1a1a1e] p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Aniversariantes do mês</h3>
                <button className="text-[10px] text-red-500 font-bold hover:underline">Ver todos os aniversariantes</button>
              </div>

              <div className="divide-y divide-[#1a1a1e]">
                {birthdays.map((bday, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-[10px] font-black text-red-500">
                        {bday.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{bday.name}</h4>
                        <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Atleta regular</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 bg-[#121214] border border-[#1a1a1e] px-2.5 py-1 rounded-lg">
                      {bday.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  )
}
