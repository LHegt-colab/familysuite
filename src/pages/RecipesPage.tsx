import { ChefHat } from 'lucide-react'

export default function RecipesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div className="p-4 bg-pink-50 rounded-2xl mb-4">
        <ChefHat size={36} className="text-secondary" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Recepten</h2>
      <p className="text-slate-500 max-w-sm">Recepten module — komt in Fase 3.</p>
    </div>
  )
}
