import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  status: 'streaming' | 'done' | 'error' | 'idle'
}

const statusConfig = {
  streaming: { dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse-dot', label: 'Investigating…' },
  done:      { dot: 'bg-indigo-400 shadow-[0_0_6px_#6366f1]',                    label: 'Investigation complete' },
  error:     { dot: 'bg-red-400 shadow-[0_0_6px_#ef4444]',                       label: 'Error' },
  idle:      { dot: 'bg-slate-600',                                               label: '' },
}

export default function ResultsPanel({ content, status }: Props) {
  if (status === 'idle') return null

  const cfg = statusConfig[status]

  const copyReport = () => {
    navigator.clipboard.writeText(content)
    const btn = document.getElementById('copy-btn')
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy report' }, 2000) }
  }

  return (
    <div className="w-full max-w-4xl mt-7">

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {cfg.label}
          </span>
        </div>
        {status !== 'error' && content && (
          <button
            id="copy-btn"
            onClick={copyReport}
            className="text-[11px] font-semibold px-3 py-1 rounded-lg border border-white/[0.07] text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all"
          >
            Copy report
          </button>
        )}
      </div>

      {/* Content box */}
      <div className="bg-surface border border-white/[0.07] rounded-2xl px-8 py-7 min-h-[120px]">
        {status === 'error' ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/25 rounded-xl p-4">
            ⚠ {content}
          </div>
        ) : (
          <div className="prose-dark">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || ' '}
            </ReactMarkdown>
          </div>
        )}
      </div>

    </div>
  )
}
