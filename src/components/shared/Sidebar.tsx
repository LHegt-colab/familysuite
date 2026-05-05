import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, ChefHat, ShoppingCart, Columns, Settings, X } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'

const nav = [
  { to: '/',         label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/todos',    label: 'Taken',            icon: CheckSquare },
  { to: '/recipes',  label: 'Recepten',         icon: ChefHat },
  { to: '/shopping', label: 'Boodschappenlijst', icon: ShoppingCart },
  { to: '/boards',   label: 'Boards',           icon: Columns },
  { to: '/settings', label: 'Instellingen',     icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { activeWorkspace } = useWorkspace()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100
          flex flex-col z-40 transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-lg text-slate-800">FamilySuite</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Workspace indicator */}
        {activeWorkspace && (
          <div className="px-4 py-3 bg-primary-50 mx-3 mt-3 rounded-lg">
            <p className="text-xs text-primary-500 font-medium">Actieve workspace</p>
            <p className="text-sm font-semibold text-primary-700 truncate">{activeWorkspace.name}</p>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 mt-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 text-xs text-slate-400 text-center">
          FamilySuite v0.1
        </div>
      </aside>
    </>
  )
}
