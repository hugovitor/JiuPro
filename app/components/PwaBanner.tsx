'use client'
// app/components/PwaBanner.tsx
import { useState, useEffect } from 'react'

export default function PwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Verifica se já foi dispensado ou está instalado
    const dismissed = localStorage.getItem('jiupro_pwa_dismissed')
    if (dismissed) return

    // Detecta se já está rodando como PWA instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (isInstalled) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      localStorage.setItem('jiupro_pwa_dismissed', '1')
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('jiupro_pwa_dismissed', '1')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-zinc-950 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-zinc-800 animate-slide-up">
      <div className="flex-shrink-0 h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-black text-sm italic">JP</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Instale o JiuPro</p>
        <p className="text-xs text-zinc-400">Acesse o app direto da tela inicial do seu celular</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
