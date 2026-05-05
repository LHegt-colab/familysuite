import { Columns } from 'lucide-react'

export default function BoardsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div className="p-4 bg-amber-50 rounded-2xl mb-4">
        <Columns size={36} className="text-warning" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Boards</h2>
      <p className="text-slate-500 max-w-sm">Kanban boards module — komt in Fase 5.</p>
    </div>
  )
}
