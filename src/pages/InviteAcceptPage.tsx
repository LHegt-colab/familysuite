import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import toast from 'react-hot-toast'

type Status = 'loading' | 'valid' | 'accepting' | 'success' | 'error'

export default function InviteAcceptPage() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()
  const { reload } = useWorkspace()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [workspace, setWorkspace] = useState<{ id: string; name: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!code) { setStatus('error'); setErrorMsg('Geen geldige uitnodigingscode.'); return }
    validate()
  }, [code])

  async function validate() {
    const { data, error } = await supabase
      .schema('familysuite')
      .from('workspaces')
      .select('id, name')
      .eq('invite_code', code)
      .single()

    if (error || !data) {
      setStatus('error')
      setErrorMsg('Uitnodiging niet gevonden of verlopen.')
      return
    }
    setWorkspace(data)
    setStatus('valid')
  }

  async function handleAccept() {
    if (!user) {
      sessionStorage.setItem('pendingInviteCode', code!)
      navigate('/login')
      return
    }
    if (!workspace) return
    setStatus('accepting')

    const { error } = await supabase
      .schema('familysuite')
      .from('workspace_members')
      .upsert({ workspace_id: workspace.id, user_id: user.id, role: 'member' }, { onConflict: 'workspace_id,user_id' })

    if (error) {
      setStatus('error')
      setErrorMsg('Kon niet als lid worden toegevoegd: ' + error.message)
      return
    }

    await reload()
    toast.success(`Je bent nu lid van "${workspace.name}"!`)
    setStatus('success')
    setTimeout(() => navigate('/'), 2000)
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-slate-100">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-lg font-bold text-slate-800 mt-4 mb-2">Uitnodiging ongeldig</h2>
        <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium">
          Naar home
        </button>
      </div>
    </div>
  )

  if (status === 'success') return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-slate-100">
        <span className="text-4xl">🎉</span>
        <h2 className="text-lg font-bold text-slate-800 mt-4">Welkom bij {workspace?.name}!</h2>
        <p className="text-slate-500 text-sm mt-2">Je wordt doorgestuurd...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-slate-100">
        <span className="text-4xl">🏠</span>
        <h2 className="text-xl font-bold text-slate-800 mt-4 mb-2">Je bent uitgenodigd!</h2>
        <p className="text-slate-600 mb-6">
          Kom lid worden van <strong>{workspace?.name}</strong>.
          {!user && <span className="block text-sm text-slate-400 mt-2">Je moet eerst inloggen.</span>}
        </p>
        <button
          onClick={handleAccept}
          disabled={status === 'accepting'}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60"
        >
          {status === 'accepting' ? 'Bezig...' : user ? 'Uitnodiging accepteren' : 'Inloggen & accepteren'}
        </button>
      </div>
    </div>
  )
}
