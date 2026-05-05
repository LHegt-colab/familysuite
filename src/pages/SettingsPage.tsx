import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { activeWorkspace } = useWorkspace()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast.success('Tot ziens!')
    navigate('/login')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Instellingen</h1>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Account</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div><span className="text-slate-400">Naam:</span> {user?.user_metadata?.full_name ?? '—'}</div>
            <div><span className="text-slate-400">E-mail:</span> {user?.email}</div>
          </div>
        </div>

        {/* Workspace */}
        {activeWorkspace && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-700 mb-3">Actieve workspace</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <div><span className="text-slate-400">Naam:</span> {activeWorkspace.name}</div>
              {activeWorkspace.description && (
                <div><span className="text-slate-400">Beschrijving:</span> {activeWorkspace.description}</div>
              )}
              <div><span className="text-slate-400">Jouw rol:</span> {activeWorkspace.role}</div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate('/workspace/invite')}
                className="px-4 py-2 text-sm bg-primary-50 text-primary rounded-lg font-medium hover:bg-primary-100 transition-colors"
              >
                Leden uitnodigen
              </button>
              <button
                onClick={() => navigate('/workspace/new')}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Nieuwe workspace
              </button>
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="font-semibold text-red-600 mb-3">Uitloggen</h2>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  )
}
