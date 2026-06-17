import { useState } from 'react'

interface Props {
  onSubmit: (uuid: string, region: 'NA' | 'EU') => void
  loading: boolean
}

export default function ShipmentForm({ onSubmit, loading }: Props) {
  const [uuid, setUuid]     = useState('')
  const [region, setRegion] = useState<'NA' | 'EU'>('NA')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uuid.trim()) return
    onSubmit(uuid.trim(), region)
  }

  return (
    <div className="w-full max-w-xl bg-surface border border-white/[0.07] rounded-2xl p-8 relative overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* UUID */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Shipment UUID
          </label>
          <input
            type="text"
            value={uuid}
            onChange={e => setUuid(e.target.value)}
            placeholder="e.g. 3f7a9b2c-1d4e-4f8a-b6c3-2e5d7f9a0b1c"
            className="
              w-full bg-surface2 border border-white/[0.07] rounded-xl
              px-4 py-3 text-sm text-slate-100 font-mono
              placeholder:text-slate-600
              outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10
              transition-all
            "
            required
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Region */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Region
          </label>
          <div className="flex gap-3">
            {(['NA', 'EU'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`
                  flex-1 py-3 rounded-xl border text-sm font-bold tracking-wide transition-all
                  ${region === r
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/10'
                    : 'bg-surface2 border-white/[0.07] text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400'
                  }
                `}
              >
                {r === 'NA' ? '🇺🇸 NA — North America' : '🇪🇺 EU — Europe'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !uuid.trim()}
          className="
            w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600
            active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed
            text-white text-sm font-bold
            flex items-center justify-center gap-2
            transition-all
          "
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
              Investigating…
            </>
          ) : (
            '🔍  Run Investigation'
          )}
        </button>

      </form>
    </div>
  )
}
