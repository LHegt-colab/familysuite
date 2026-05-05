import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './AuthContext'

export interface Workspace {
  id: string
  name: string
  description: string | null
  owner_id: string
  invite_code: string
  created_at: string
  role: 'owner' | 'member'
}

interface WorkspaceContextValue {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  loading: boolean
  switchWorkspace: (id: string) => void
  createWorkspace: (name: string, description?: string) => Promise<Workspace>
  reload: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setWorkspaces([])
      setActiveWorkspace(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .schema('familysuite')
      .from('workspace_members')
      .select(`role, workspaces(id, name, description, owner_id, invite_code, created_at)`)
      .eq('user_id', user.id)

    if (!error && data) {
      const list: Workspace[] = data
        .filter((m: any) => m.workspaces)
        .map((m: any) => ({ ...m.workspaces, role: m.role }))
      setWorkspaces(list)

      const savedId = localStorage.getItem('activeWorkspaceId')
      const saved = list.find((w) => w.id === savedId)
      const active = saved ?? list[0] ?? null
      setActiveWorkspace(active)
      if (active) localStorage.setItem('activeWorkspaceId', active.id)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  function switchWorkspace(id: string) {
    const ws = workspaces.find((w) => w.id === id)
    if (ws) {
      setActiveWorkspace(ws)
      localStorage.setItem('activeWorkspaceId', ws.id)
    }
  }

  async function createWorkspace(name: string, description = ''): Promise<Workspace> {
    if (!user) throw new Error('Niet ingelogd')

    const { data: ws, error: wsErr } = await supabase
      .schema('familysuite')
      .from('workspaces')
      .insert({ name, description: description || null, owner_id: user.id })
      .select()
      .single()

    if (wsErr) throw wsErr

    const { error: memberErr } = await supabase
      .schema('familysuite')
      .from('workspace_members')
      .insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' })

    if (memberErr) throw memberErr

    const newWs: Workspace = { ...ws, role: 'owner' }
    setWorkspaces((prev) => [...prev, newWs])
    setActiveWorkspace(newWs)
    localStorage.setItem('activeWorkspaceId', ws.id)
    return newWs
  }

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, loading, switchWorkspace, createWorkspace, reload: load }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
