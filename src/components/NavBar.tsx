export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-14 bg-surface border-b border-white/[0.07]">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
          p44
        </div>
        <span className="font-bold text-[15px] text-slate-100">
          Shipment <span className="text-indigo-400">Tracking</span>
        </span>
      </div>
      <span className="text-[10px] font-bold tracking-wide px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
        AI-Powered Troubleshooting
      </span>
    </nav>
  )
}
