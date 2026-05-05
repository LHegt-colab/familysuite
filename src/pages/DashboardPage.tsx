import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, CheckSquare, ChefHat, ShoppingCart, Columns } from 'lucide-react'

const modules = [
  { to: '/todos',    label: 'Taken',            icon: CheckSquare, color: 'bg-indigo-50 text-indigo-600',   desc: 'Beheer jullie taken en to-do lijsten' },
  { to: '/recipes',  label: 'Recepten',         icon: ChefHat,     color: 'bg-pink-50 text-pink-600',       desc: 'Sla recepten op en plan maaltijden' },
  { to: '/shopping', label: 'Boodschappenlijst', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600', desc: 'Gedeelde boodschappenlijst' },
  { to: '/boards',   label: 'Boards',           icon: Columns,     color: 'bg-amber-50 text-amber-600',     desc: 'Kanban boards voor projecten' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { activeWorkspace, workspaces } = useWorkspace()
  const navigate = useNavigate()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Welkom'

  if (!activeWorkspace && workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
        <span className="text-6xl mb-4">🏠</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Maak je eerste workspace aan</h2>
        <p className="text-slate-500 mb-6 max-w-sm">
          Een workspace is een gedeelde ruimte voor jou en je familie. Maak er één aan om te beginnen.
        </p>
        <button
          onClick={() => navigate('/workspace/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Workspace aanmaken
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Hoi, {firstName}! 👋</h1>
        <p className="text-slate-500 mt-1">
          Workspace: <span className="font-medium text-slate-700">{activeWorkspace?.name}</span>
        </p>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {modules.map(({ to, label, icon: Icon, color, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all text-left group"
          >
            <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors">{label}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Workspace actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          Workspace beheer
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/workspace/invite')}
            className="px-4 py-2 text-sm font-medium bg-primary-50 text-primary rounded-lg hover:bg-primary-100 transition-colors"
          >
            + Iemand uitnodigen
          </button>
          <button
            onClick={() => navigate('/workspace/new')}
            className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Nieuwe workspace
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Instellingen
          </button>
        </div>
      </div>
    </div>
  )
}
