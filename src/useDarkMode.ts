import { useEffect, useState } from 'react'

type Mode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'nft-theme'

function getSystemDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useDarkMode() {
  const [mode, setMode] = useState<Mode>(() => {
    const s = localStorage.getItem(STORAGE_KEY) as Mode | null
    return s === 'light' || s === 'dark' || s === 'system' ? s : 'system'
  })

  const resolvedDark = mode === 'system' ? getSystemDark() : mode === 'dark'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
    document.documentElement.classList.toggle('dark', resolvedDark)
  }, [mode, resolvedDark])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      document.documentElement.classList.toggle('dark', mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  return { mode, setMode, resolvedDark }
}
