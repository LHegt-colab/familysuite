import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '@/context/WorkspaceContext'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { ArrowLeft, Copy, Check } from 'lucide-react'

export default function InvitePage() {
  const { activeWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'owner'>('member')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteLink = activeWorkspace
    ? `${window.location.origin}/invite/${activeWorkspace.invite_code}`
    : ''

  async function handleCopyLink() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Link gekopieerd!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!activeWorkspace || !email.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase
        .schema('familysuite')
        .from('invite_tokens')
        .insert({
          workspace_id: activeWorkspace.id,
          token: crypto.randomUUID(),
        })
      if (error) throw error
      toast.success(`Uitnodiging aangemaakt voor ${email}`)
      setEmail('')
    } catch (err: any) {
      toast.error('Mislukt: ' + err.message)
    }
    setLoading(false)
  }

  if (!activeWorkspace) {
    return <div className="p-6 text-slate-500">Geen actieve workspace geselecteerd.</div>
  }

  return (
    <div className="min-h-full p-6 flex items-start justify-center">
      <div className="w-full max-w-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={16} /> Terug
        </button>

        <h1 className="text-xl font-bold text-slate-800 mb-1">Iemand uitnodigen</h1>
        <p className="text-slate-500 text-sm mb-6">
          Workspace: <span className="font-medium">{activeWorkspace.name}</span>
        </p>

        {/* Invite link */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
          <h2 className="font-semibold text-slate-700 mb-3">Uitnodigingslink</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-600"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Deel deze link — iedereen met de link kan lid worden.</p>
        </div>

        {/* Email invite */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Uitnodigen via e-mail</h2>
          <form onSubmit={handleSendInvite} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@voorbeeld.nl"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'member' | 'owner')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            >
              <option value="member">Lid</option>
              <option value="owner">Eigenaar</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Verzenden...' : 'Uitnodiging verzenden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
