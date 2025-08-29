import { useState, useRef } from 'react'

const LANGS = [
  { code: 'pt', label: 'pt' },
  { code: 'en', label: 'en' },
]

export default function UploadCard({ onMockProcess, setLoading }) {
  const [text, setText] = useState('')
  const [mode] = useState('auto')
  const [lang, setLang] = useState('auto')
  const [busy, setBusy] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileObj, setFileObj] = useState(null)

  // --- aviso ao digitar com anexo ---
  const [showAttachWarn, setShowAttachWarn] = useState(false)
  const [pendingText, setPendingText] = useState('') // o que o usuário tentou digitar
  const dragCounter = useRef(0)
  const fileRef = useRef()

  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  function cannedImprodutivo(language) {
    const code = (language || '').toLowerCase()
    if (code.startsWith('en')) {
      return "Thanks for reaching out! We've recorded your message."
    }
    return 'Obrigado pela mensagem! Registramos seu contato.'
  }

  function readTxtFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result || '')
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  async function handleSelectedFile(file) {
    if (!file) return
    setFileName(file.name)
    setFileObj(file)

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'txt') {
      try {
        const content = await readTxtFile(file)
        setText(prev => (prev?.trim()?.length ? prev + '\n\n' + content : content))
      } catch {
        alert('Não foi possível ler o .txt')
      }
    } else if (ext === 'pdf') {
      // backend extrai
    } else {
      alert('Formato não suportado. Use .pdf ou .txt')
      clearAttachment()
    }
  }

  function clearAttachment() {
    setFileObj(null)
    setFileName('')
    if (fileRef.current) fileRef.current.value = null
  }

  // ------- drag & drop -------
  function onDragEnter(e) {
    e.preventDefault()
    dragCounter.current += 1
    setIsDragging(true)
  }
  function onDragOver(e) { e.preventDefault() }
  function onDragLeave(e) {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0 }
  }
  async function handleDrop(e) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    await handleSelectedFile(f)
  }

  // ------- textarea: bloqueia digitação se houver anexo -------
  function handleTextChange(e) {
    const next = e.target.value
    if (fileObj) {
      // guarda o que o usuário tentou digitar e mostra aviso
      setPendingText(next)
      setShowAttachWarn(true)
      return
    }
    setText(next)
  }

  function confirmTypeAndClear() {
    clearAttachment()
    setText(pendingText) // aplica o texto que o usuário tentou digitar
    setPendingText('')
    setShowAttachWarn(false)
  }

  function cancelTypingKeepFile() {
    setPendingText('') // descarta o que tentou digitar
    setShowAttachWarn(false)
  }

  // ------- envio -------
  async function handleSubmit() {
    const chosenLang = lang || 'auto'

    if (mode === 'local') {
      const isImprod = text.toLowerCase().includes('feliz')
      const suggested = isImprod
        ? cannedImprodutivo(chosenLang)
        : (chosenLang.startsWith('en')
            ? 'Hi!\n\nWe got your message. To speed things up, please confirm the ticket number and include a screenshot if available.\n\nBest regards,\nSupport Team'
            : 'Olá,\n\nRecebemos sua mensagem. Para agilizar, confirme o número do protocolo e, se possível, inclua um print do erro.\n\nAtenciosamente,\nEquipe de Atendimento')

      const sample = {
        category: isImprod ? 'Improdutivo' : 'Produtivo',
        confidence: 0.82,
        suggested_reply: suggested,
        language: chosenLang,
        reasoning: 'local-rules',
        extracted: { case_id: '1234-ABCD' },
      }
      setBusy(true); setLoading?.(true)
      await new Promise(r => setTimeout(r, 700))
      onMockProcess?.(sample)
      setBusy(false); setLoading?.(false)
      return
    }

    setBusy(true)
    setLoading?.(true)
    try {
      let data
      if (fileObj) {
        const fd = new FormData()
        fd.append('file', fileObj)
        fd.append('language', chosenLang)
        const controller = new AbortController()
        const t = setTimeout(() => controller.abort(), 25000)
        const res = await fetch(`${API}/classify-file`, {
          method: 'POST',
          body: fd,
          headers: {
            'X-User-Lang': chosenLang,
            'Accept-Language': chosenLang === 'auto' ? '*;q=0.5' : chosenLang,
          },
          signal: controller.signal,
        })
        clearTimeout(t)
        if (!res.ok) throw new Error(await res.text().catch(() => 'Falha no upload'))
        data = await res.json()
      } else {
        if (!text.trim()) {
          alert('Cole o conteúdo do email ou selecione um arquivo .pdf/.txt')
          return
        }
        const controller = new AbortController()
        const t = setTimeout(() => controller.abort(), 25000)
        const res = await fetch(`${API}/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': chosenLang === 'auto' ? '*;q=0.5' : chosenLang,
            'X-User-Lang': chosenLang,
          },
          body: JSON.stringify({ subject: '', body: text, language: chosenLang }),
          signal: controller.signal,
        })
        clearTimeout(t)
        if (!res.ok) throw new Error(await res.text().catch(() => 'Falha na classificação'))
        data = await res.json()
      }

      const category = data.category
      const confidence = data.confidence
      const outLang = data.language || chosenLang
      const suggested = category === 'Improdutivo'
        ? cannedImprodutivo(outLang)
        : data.suggested_reply

      onMockProcess?.({
        category,
        confidence,
        suggested_reply: suggested,
        language: outLang,
        reasoning: 'gpt',
        extracted: data.meta || {},
      })
    } catch (e) {
      console.error(e)
      alert(e.message || 'Erro ao classificar. Verifique se o backend está rodando e a API_URL está correta.')
    } finally {
      setBusy(false)
      setLoading?.(false)
    }
  }

  const dropClasses = isDragging
    ? 'border-brand-600 bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 ring-2 ring-brand-600/30'
    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300'

  return (
    <section className="card space-y-5" aria-busy={busy}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Entrada</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Cole o texto do email ou adicione um arquivo .pdf/.txt
        </p>
      </div>

      <textarea
        className="textarea"
        placeholder="Cole o conteúdo do email aqui..."
        value={text}
        onChange={handleTextChange}
        disabled={busy}
      />

      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-150 ${dropClasses}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click() }}
        aria-label="Solte o arquivo aqui para adicionar"
      >
        {isDragging ? (
          <span className="font-medium">Solte o arquivo para adicionar…</span>
        ) : (
          <>
            Arraste e solte .pdf/.txt aqui ou{' '}
            <label className="underline cursor-pointer text-brand-600 dark:text-brand-500">
              escolha um arquivo
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                disabled={busy}
                onChange={(e) => handleSelectedFile(e.target.files?.[0])}
              />
            </label>
          </>
        )}
      </div>

      {fileName && (
        <div className="text-xs inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-fit">
          Arquivo selecionado: <span className="font-medium">{fileName}</span>
          <button
            type="button"
            className="underline text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={clearAttachment}
          >
            limpar
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select className="select" value={lang} onChange={(e)=>setLang(e.target.value)} disabled={busy} aria-label="Idioma de saída">
          {LANGS.map(l => (<option key={l.code} value={l.code}>{l.label}</option>))}
        </select>

        <button
          type="button"
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
              </svg>
              Processando…
            </span>
          ) : ('Visualizar Resultado')}
        </button>
      </div>


      {showAttachWarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelTypingKeepFile} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Anexo selecionado</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Já existe um arquivo anexado para análise (<span className="font-medium">{fileName}</span>).
              Para digitar manualmente, limpe o anexo primeiro.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded-md text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600"
                onClick={cancelTypingKeepFile}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded-md text-sm bg-brand-600 text-white hover:bg-brand-700"
                onClick={confirmTypeAndClear}
              >
                Limpar anexo e digitar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
