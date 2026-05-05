import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface FormData { fullName: string; email: string; password: string; confirmPassword: string }

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()

  async function onSubmit({ fullName, email, password }: FormData) {
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    if (error) {
      toast.error('Registratie mislukt: ' + error.message)
    } else {
      toast.success('Account aangemaakt! Controleer je e-mail om te bevestigen.')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🏠</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">FamilySuite</h1>
          <p className="text-slate-500 mt-1">Maak een nieuw account aan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Naam</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="Jan de Vries"
                {...register('fullName', { required: 'Naam is verplicht' })}
              />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>

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
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="Minimaal 6 tekens"
                {...register('password', { required: 'Wachtwoord is verplicht', minLength: { value: 6, message: 'Minimaal 6 tekens' } })}
              />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bevestig wachtwoord</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="Herhaal wachtwoord"
                {...register('confirmPassword', {
                  required: 'Verplicht',
                  validate: (v) => v === watch('password') || 'Wachtwoorden komen niet overeen',
                })}
              />
              {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Account aanmaken...' : 'Account aanmaken'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Al een account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
