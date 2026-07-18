'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="สลับโหมดมืด/สว่าง"
      className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
    >
      {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  )
}
