// app/components/BeltVisual.tsx
'use client'

import React from 'react'
import { getBeltDefinition } from '../lib/belts'

interface BeltVisualProps {
  belt: string
  degrees: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function BeltVisual({
  belt,
  degrees,
  size = 'md',
  showLabel = true,
  className = ''
}: BeltVisualProps) {
  const def = getBeltDefinition(belt)

  // Size configurations
  const dimensions = {
    xs: { belt: 'h-4 w-14 rounded-sm', sleeve: 'w-4', stripe: 'w-[1.5px] h-2.5', text: 'text-[7px]' },
    sm: { belt: 'h-6 w-20 rounded', sleeve: 'w-6', stripe: 'w-[2px] h-3.5', text: 'text-[8px]' },
    md: { belt: 'h-8 w-28 rounded', sleeve: 'w-8', stripe: 'w-[3px] h-5', text: 'text-[9px]' },
    lg: { belt: 'h-10 w-36 rounded-md', sleeve: 'w-10', stripe: 'w-[3.5px] h-6', text: 'text-[10px]' }
  }[size]

  const totalDegreesToShow = Math.min(Math.max(0, degrees || 0), def.maxDegrees || 4)
  const maxSlots = Math.min(def.maxDegrees || 4, 6)

  return (
    <div className={`inline-flex flex-col items-center flex-shrink-0 ${className}`}>
      {/* Belt Bar */}
      <div 
        className={`${dimensions.belt} border relative flex items-center shadow-inner overflow-hidden`}
        style={{
          background: def.bgColor,
          borderColor: def.borderColor
        }}
      >
        {/* Sleeve (Tarja) */}
        <div 
          className={`absolute right-0 top-0 bottom-0 ${dimensions.sleeve} flex items-center justify-around px-0.5 shadow-sm`}
          style={{ backgroundColor: def.sleeveBg }}
        >
          {Array.from({ length: maxSlots }).map((_, i) => (
            <span 
              key={i} 
              className={`${dimensions.stripe} rounded-xs block transition-all ${
                i < totalDegreesToShow ? (def.sleeveBg === '#ffffff' ? 'bg-red-600' : 'bg-white') : 'bg-transparent'
              }`} 
            />
          ))}
        </div>
      </div>

      {showLabel && (
        <span className={`${dimensions.text} font-black text-zinc-500 uppercase tracking-widest mt-1 text-center`}>
          Faixa {def.name} {totalDegreesToShow > 0 ? `• ${totalDegreesToShow}º Grau` : ''}
        </span>
      )}
    </div>
  )
}
