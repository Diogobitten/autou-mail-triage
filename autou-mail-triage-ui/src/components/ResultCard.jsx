import EmailButton from './EmailButton.jsx'
import CopyButton from './CopyButton.jsx'

export default function ResultCard({ data }) {
  if (!data) return null
  const isProd = data.category === 'Produtivo'

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-3">
        <span
          className={`badge ${
            isProd
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          {data.category}
        </span>
        <span className="text-slate-500 text-sm">
          confiança: {(data.confidence * 100).toFixed(1)}%
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Resposta sugerida
          </h3>
          <CopyButton text={data.suggested_reply} />
        </div>

        <pre
          className="whitespace-pre-wrap bg-slate-100 dark:bg-slate-800 
                     text-slate-900 dark:text-slate-100 p-3 rounded-lg mb-5"
        >
          {data.suggested_reply}
        </pre>

        <EmailButton
          to="suporte@autou.com"
          subject="Resposta automática do sistema AutoU"
          body={data.suggested_reply}
        />
      </div>

      <div className="text-sm text-slate-500 grid sm:grid-cols-3 gap-2">
        <div>
          Idioma: <span className="text-slate-700">{data.language}</span>
        </div>
      </div>
    </section>
  )
}
