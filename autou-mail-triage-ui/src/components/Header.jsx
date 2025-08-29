import ThemeToggle from './ThemeToggle.jsx'
import EmailButton from './EmailButton.jsx'

export default function Header() {
  return (
    <header className="border-b bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="container-narrow py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AutoU logo" className="h-9 w-9 rounded-lg" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AutoU Mail Triage</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Classifique emails e gere respostas automáticas</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
