import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import NavBar from './components/NavBar'
import ShipmentForm from './components/ShipmentForm'
import ResultsPanel from './components/ResultsPanel'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const supabase     = createClient(supabaseUrl, supabaseAnon)

type Status = 'idle' | 'streaming' | 'done' | 'error'

export default function App() {
  const [content, setContent] = useState('')
  const [status,  setStatus]  = useState<Status>('idle')

  const handleInvestigate = async (uuid: string, region: 'NA' | 'EU') => {
    setContent('')
    setStatus('streaming')

    try {
      const { data, error } = await supabase.functions.invoke('investigate', {
        body: { uuid, region },
      })

      if (error) throw new Error(error.message)

      // data is a ReadableStream from the edge function
      const reader  = (data as ReadableStream<Uint8Array>).getReader()
      const decoder = new TextDecoder()
      let   full    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setContent(full)
      }

      setStatus('done')
    } catch (err) {
      setContent(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <NavBar />

      <main className="flex-1 flex flex-col items-center px-6 py-14">

        {/* Hero */}
        <div className="text-center mb-10 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[2.5px] text-indigo-500 mb-3">
            project44 · Support Engineering
          </p>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Shipment <span className="text-indigo-400">Tracking</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Enter a shipment UUID and select the region to run a full AI-powered investigation —
            Observe logs, Snowflake data, Datadog deployments, and GitHub changes, all in one report.
          </p>
        </div>

        {/* Form */}
        <ShipmentForm
          onSubmit={handleInvestigate}
          loading={status === 'streaming'}
        />

        {/* Results */}
        <ResultsPanel content={content} status={status} />

      </main>

      <footer className="text-center py-5 text-[11px] text-slate-700 border-t border-white/[0.04]">
        project44 · Shipment Tracking · Powered by Claude AI · MCP Protocol
      </footer>
    </div>
  )
}
