import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={dark}
        onChange={() => setDark(v => !v)}
        aria-label="Alternar tema claro/escuro"
      />
      <div
        className="
          relative h-6 w-11 rounded-full transition-colors
          bg-slate-300 dark:bg-slate-700
          peer-checked:bg-brand-600
          before:content-[''] before:absolute before:top-0.5 before:left-0.5
          before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow
          before:transition-transform peer-checked:before:translate-x-5
          flex items-center justify-between px-1
        "
      >
        <Sun size={14} className="text-yellow-400" />
        <Moon size={14} className="text-slate-200" />
      </div>
    </label>
  )
}
