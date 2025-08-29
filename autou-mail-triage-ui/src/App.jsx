import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import UploadCard from './components/UploadCard.jsx'
import ResultCard from './components/ResultCard.jsx'
import HistoryPie from './components/HistoryPie.jsx'
import ProcessingOverlay from './components/ProcessingOverlay.jsx'   
import Footer from './components/Footer.jsx'

export default function App() {
  const [mockResult, setMockResult] = useState(null)
  const [loading, setLoading] = useState(false)                      
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('history') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history))
  }, [history])

  function handleMockProcess(res) {
    setMockResult(res)
    setHistory(h => [...h, { date: new Date().toISOString(), category: res.category }])
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1 flex items-start justify-center px-4 py-24">
        <div className="w-full max-w-3xl space-y-6">
          <UploadCard onMockProcess={handleMockProcess} setLoading={setLoading} /> 
          <ResultCard data={mockResult} />
          <HistoryPie history={history} />
        </div>
      </main>
      <Footer />

      {loading && <ProcessingOverlay text="Processando e classificando..." />} 
    </div>
  )
}
