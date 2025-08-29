import { useState } from 'react'
import { Copy, CheckIcon } from 'lucide-react'

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Não foi possível copiar o texto')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="
        ml-2 flex items-center gap-1 text-sm px-2 py-1 rounded-md
        bg-slate-100 hover:bg-slate-200
        text-slate-700 hover:text-slate-900
        dark:bg-slate-700 dark:hover:bg-slate-600
        dark:text-white dark:hover:text-white/90
        transition
      "
    >
      {copied ? (
        <>
          <CheckIcon size={16} /> Copiado
        </>
      ) : (
        <>
          <Copy size={16} /> Copiar
        </>
      )}
    </button>
  )
}
