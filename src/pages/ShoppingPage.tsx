import { ShoppingCart } from 'lucide-react'

export default function ShoppingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div className="p-4 bg-emerald-50 rounded-2xl mb-4">
        <ShoppingCart size={36} className="text-success" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Boodschappenlijst</h2>
      <p className="text-slate-500 max-w-sm">Boodschappenlijst module — komt in Fase 4.</p>
    </div>
  )
}
