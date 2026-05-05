import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface FormData { email: string; password: string }

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  async function onSubmit({ email, password }: FormData) {
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Inloggen mislukt: ' + error.message)
    } else {
      toast.success('Welkom terug!')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🏠</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">FamilySuite</h1>
          <p className="text-slate-500 mt-1">Log in op je account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mailadres</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="jij@voorbeeld.nl"
                {...register('email', { required: 'E-mail is verplicht' })}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wachtwoord</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="••••••••"
                {...register('password', { required: 'Wachtwoord is verplicht' })}
              />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Nog geen account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Registreer je hier
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
