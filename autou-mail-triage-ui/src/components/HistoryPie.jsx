import { useState } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts'
import { ChevronDown, Download } from 'lucide-react' 

export default function HistoryPie({ history = [] }) {
  const [open, setOpen] = useState(true)

  
  const today = new Date().toISOString().split('T')[0]
  let produtivo = 0
  let improdutivo = 0
  history.forEach(({ date, category }) => {
    if (date?.startsWith(today)) {
      if (category === 'Produtivo') produtivo++
      else improdutivo++
    }
  })

  const data = [
    { name: 'Produtivo', value: produtivo },
    { name: 'Improdutivo', value: improdutivo },
  ]
  const COLORS = ['#10b981', '#94a3b8']

  if (produtivo + improdutivo === 0) return null

  
  function handleExport() {
    const header = 'Categoria,Quantidade\n'
    const rows = data.map(d => `${d.name},${d.value}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `resumo_${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Resumo da Sessão
        </h3>

        <div className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={handleExport}
            className="btn-ghost px-3 py-1.5 flex items-center gap-1"
            title="Exportar CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </button>

         
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="btn-ghost px-3 py-1.5 "
            aria-expanded={open}
            aria-controls="chart-content"
            title={open ? 'Minimizar' : 'Maximizar'}
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${open ? '' : '-rotate-180'} text-slate-700 dark:text-slate-200`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div id="chart-content" className="h-60 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'white', color: 'white', borderRadius: 8, border: '1px solid #ddd', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
