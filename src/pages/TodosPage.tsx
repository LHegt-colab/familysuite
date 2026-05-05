import { CheckSquare } from 'lucide-react'

export default function TodosPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div className="p-4 bg-indigo-50 rounded-2xl mb-4">
        <CheckSquare size={36} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Taken</h2>
      <p className="text-slate-500 max-w-sm">Taakbeheer module — komt in Fase 2.</p>
    </div>
  )
}
