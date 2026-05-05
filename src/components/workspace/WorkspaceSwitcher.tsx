import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Check } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useNavigate } from 'react-router-dom'

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-100 text-primary-700 font-medium text-sm transition-colors max-w-[200px]"
      >
        <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
        <span className="truncate">{activeWorkspace?.name ?? 'Kies workspace'}</span>
        <ChevronDown size={14} className="flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
          <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspaces</p>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left transition-colors"
            >
              <span className="flex-1 truncate text-slate-700">{ws.name}</span>
              <span className="text-xs text-slate-400">{ws.role}</span>
              {ws.id === activeWorkspace?.id && <Check size={14} className="text-primary flex-shrink-0" />}
            </button>
          ))}
          <hr className="my-1 border-slate-100" />
          <button
            onClick={() => { navigate('/workspace/new'); setOpen(false) }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-primary-50 transition-colors"
          >
            <Plus size={14} />
            Nieuwe workspace
          </button>
        </div>
      )}
    </div>
  )
}
