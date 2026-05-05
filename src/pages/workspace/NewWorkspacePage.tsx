import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useWorkspace } from '@/context/WorkspaceContext'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

interface FormData { name: string; description: string }

export default function NewWorkspacePage() {
  const { createWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  async function onSubmit({ name, description }: FormData) {
    setLoading(true)
    try {
      await createWorkspace(name, description)
      toast.success(`Workspace "${name}" aangemaakt!`)
      navigate('/')
    } catch (err: any) {
      toast.error('Aanmaken mislukt: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-full p-6 flex items-start justify-center">
      <div className="w-full max-w-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={16} /> Terug
        </button>

        <h1 className="text-xl font-bold text-slate-800 mb-1">Nieuwe workspace</h1>
        <p className="text-slate-500 text-sm mb-6">Maak een gedeelde ruimte voor jou en je familie.</p>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Naam *</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="Bijv. Familie de Vries"
                {...register('name', { required: 'Naam is verplicht' })}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Beschrijving</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm h-20 resize-none"
                placeholder="Optionele beschrijving..."
                {...register('description')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Aanmaken...' : 'Workspace aanmaken'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
