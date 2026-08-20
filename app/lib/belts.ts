// app/lib/belts.ts

export interface BeltDefinition {
  id: string
  name: string
  category: 'Infantil' | 'Adulto' | 'Mestre'
  bgColor: string // CSS background color or gradient
  borderColor: string
  sleeveBg: string // Tarja: red for black belt, black for standard, white for red/white coral, gold/red for red
  maxDegrees: number
  hasCenterStripe?: 'white' | 'black' | 'coral'
}

export const IBJJF_BELTS: BeltDefinition[] = [
  // 1. INFANTIL / JUVENIL (4 a 15 anos)
  {
    id: 'branca',
    name: 'Branca',
    category: 'Infantil',
    bgColor: '#ffffff',
    borderColor: '#cbd5e1',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'cinza-branca',
    name: 'Cinza e Branca',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #94a3b8 30%, #ffffff 30%, #ffffff 70%, #94a3b8 70%)',
    borderColor: '#64748b',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'white'
  },
  {
    id: 'cinza',
    name: 'Cinza',
    category: 'Infantil',
    bgColor: '#94a3b8',
    borderColor: '#64748b',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'cinza-preta',
    name: 'Cinza e Preta',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #94a3b8 30%, #09090b 30%, #09090b 70%, #94a3b8 70%)',
    borderColor: '#64748b',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'black'
  },
  {
    id: 'amarela-branca',
    name: 'Amarela e Branca',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #eab308 30%, #ffffff 30%, #ffffff 70%, #eab308 70%)',
    borderColor: '#ca8a04',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'white'
  },
  {
    id: 'amarela',
    name: 'Amarela',
    category: 'Infantil',
    bgColor: '#eab308',
    borderColor: '#ca8a04',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'amarela-preta',
    name: 'Amarela e Preta',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #eab308 30%, #09090b 30%, #09090b 70%, #eab308 70%)',
    borderColor: '#ca8a04',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'black'
  },
  {
    id: 'laranja-branca',
    name: 'Laranja e Branca',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #f97316 30%, #ffffff 30%, #ffffff 70%, #f97316 70%)',
    borderColor: '#ea580c',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'white'
  },
  {
    id: 'laranja',
    name: 'Laranja',
    category: 'Infantil',
    bgColor: '#f97316',
    borderColor: '#ea580c',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'laranja-preta',
    name: 'Laranja e Preta',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #f97316 30%, #09090b 30%, #09090b 70%, #f97316 70%)',
    borderColor: '#ea580c',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'black'
  },
  {
    id: 'verde-branca',
    name: 'Verde e Branca',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #16a34a 30%, #ffffff 30%, #ffffff 70%, #16a34a 70%)',
    borderColor: '#15803d',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'white'
  },
  {
    id: 'verde',
    name: 'Verde',
    category: 'Infantil',
    bgColor: '#16a34a',
    borderColor: '#15803d',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'verde-preta',
    name: 'Verde e Preta',
    category: 'Infantil',
    bgColor: 'linear-gradient(to bottom, #16a34a 30%, #09090b 30%, #09090b 70%, #16a34a 70%)',
    borderColor: '#15803d',
    sleeveBg: '#09090b',
    maxDegrees: 4,
    hasCenterStripe: 'black'
  },

  // 2. ADULTO / MASTER (16+ anos)
  {
    id: 'azul',
    name: 'Azul',
    category: 'Adulto',
    bgColor: '#2563eb',
    borderColor: '#1d4ed8',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'roxa',
    name: 'Roxa',
    category: 'Adulto',
    bgColor: '#9333ea',
    borderColor: '#7e22ce',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'marrom',
    name: 'Marrom',
    category: 'Adulto',
    bgColor: '#78350f',
    borderColor: '#451a03',
    sleeveBg: '#09090b',
    maxDegrees: 4
  },
  {
    id: 'preta',
    name: 'Preta',
    category: 'Adulto',
    bgColor: '#09090b',
    borderColor: '#18181b',
    sleeveBg: '#dc2626', // Tarja vermelha
    maxDegrees: 6
  },

  // 3. MESTRES / GRANDES MESTRES
  {
    id: 'vermelha-preta',
    name: 'Vermelha e Preta',
    category: 'Mestre',
    bgColor: 'repeating-linear-gradient(90deg, #dc2626 0px, #dc2626 12px, #09090b 12px, #09090b 24px)',
    borderColor: '#991b1b',
    sleeveBg: '#ffffff', // Tarja branca com ponteira vermelha
    maxDegrees: 7
  },
  {
    id: 'vermelha-branca',
    name: 'Vermelha e Branca',
    category: 'Mestre',
    bgColor: 'repeating-linear-gradient(90deg, #dc2626 0px, #dc2626 12px, #ffffff 12px, #ffffff 24px)',
    borderColor: '#991b1b',
    sleeveBg: '#09090b',
    maxDegrees: 8
  },
  {
    id: 'vermelha',
    name: 'Vermelha',
    category: 'Mestre',
    bgColor: '#dc2626',
    borderColor: '#b91c1c',
    sleeveBg: '#eab308', // Tarja dourada/branca
    maxDegrees: 10
  }
]

export function getBeltDefinition(beltName: string): BeltDefinition {
  const normalized = (beltName || '').trim().toLowerCase()
  const found = IBJJF_BELTS.find(b => 
    b.name.toLowerCase() === normalized || 
    b.id === normalized
  )
  if (found) return found

  // Partial matches
  if (normalized.includes('laranja') && normalized.includes('branca')) return IBJJF_BELTS.find(b => b.id === 'laranja-branca')!
  if (normalized.includes('laranja') && normalized.includes('preta')) return IBJJF_BELTS.find(b => b.id === 'laranja-preta')!
  if (normalized.includes('laranja')) return IBJJF_BELTS.find(b => b.id === 'laranja')!

  if (normalized.includes('cinza') && normalized.includes('branca')) return IBJJF_BELTS.find(b => b.id === 'cinza-branca')!
  if (normalized.includes('cinza') && normalized.includes('preta')) return IBJJF_BELTS.find(b => b.id === 'cinza-preta')!
  if (normalized.includes('cinza')) return IBJJF_BELTS.find(b => b.id === 'cinza')!

  if (normalized.includes('amarela') && normalized.includes('branca')) return IBJJF_BELTS.find(b => b.id === 'amarela-branca')!
  if (normalized.includes('amarela') && normalized.includes('preta')) return IBJJF_BELTS.find(b => b.id === 'amarela-preta')!
  if (normalized.includes('amarela')) return IBJJF_BELTS.find(b => b.id === 'amarela')!

  if (normalized.includes('verde') && normalized.includes('branca')) return IBJJF_BELTS.find(b => b.id === 'verde-branca')!
  if (normalized.includes('verde') && normalized.includes('preta')) return IBJJF_BELTS.find(b => b.id === 'verde-preta')!
  if (normalized.includes('verde')) return IBJJF_BELTS.find(b => b.id === 'verde')!

  if (normalized.includes('azul')) return IBJJF_BELTS.find(b => b.id === 'azul')!
  if (normalized.includes('roxa')) return IBJJF_BELTS.find(b => b.id === 'roxa')!
  if (normalized.includes('marrom')) return IBJJF_BELTS.find(b => b.id === 'marrom')!
  if (normalized.includes('preta')) return IBJJF_BELTS.find(b => b.id === 'preta')!

  if (normalized.includes('coral') || (normalized.includes('vermelha') && normalized.includes('preta'))) {
    return IBJJF_BELTS.find(b => b.id === 'vermelha-preta')!
  }
  if (normalized.includes('vermelha') && normalized.includes('branca')) {
    return IBJJF_BELTS.find(b => b.id === 'vermelha-branca')!
  }
  if (normalized.includes('vermelha')) return IBJJF_BELTS.find(b => b.id === 'vermelha')!

  return IBJJF_BELTS[0]
}

export function getMaxDegreesForBelt(beltName: string): number {
  const def = getBeltDefinition(beltName)
  return def.maxDegrees || 4
}
