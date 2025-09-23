import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (values) => {
    try {
      setError('')
      console.log('Login: Attempting login with', values.email)
      const loggedInUser = await login(values.email, values.password)
      console.log('Login: Login successful, user data:', loggedInUser)
      
      if (loggedInUser?.userType === 'patient') {
        console.log('Login: Redirecting to patient dashboard')
        navigate('/patient/dashboard', { replace: true })
      } else if (loggedInUser?.userType === 'doctor') {
        console.log('Login: Redirecting to doctor dashboard')
        navigate('/doctor/dashboard', { replace: true })
      } else if (loggedInUser?.userType === 'pharmacist') {
        console.log('Login: Redirecting to pharmacy dashboard')
        navigate('/pharmacy/dashboard', { replace: true })
      } else {
        console.log('Login: Unknown user type, redirecting to patient dashboard as default')
        navigate('/patient/dashboard', { replace: true })
      }
    } catch (e) {
      console.error('Login: Login failed', e)
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900">
            Connexion
          </h2>
          <p className="mt-2 text-secondary-600">
            Accédez à votre compte Dawini
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="label">
                <Mail className="w-4 h-4 inline mr-2" />
                Adresse email
              </label>
              <input
                type="email"
                {...register('email')}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="text-error-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-error-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="link">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn w-full"
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="link font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="card bg-secondary-50">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Comptes de démonstration
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-secondary-200">
              <div>
                <p className="font-medium text-secondary-900">Patient</p>
                <p className="text-sm text-secondary-600">patient@dawini.com</p>
              </div>
              <button
                onClick={async () => {
                  setError('');
                  try {
                    const loggedInUser = await login('patient@dawini.com', 'password123');
                    if (loggedInUser?.userType === 'patient') {
                      navigate('/patient/dashboard', { replace: true });
                    }
                  } catch (e) {
                    setError('Échec de la connexion avec le compte de test patient.');
                  }
                }}
                className="btn btn-sm"
              >
                Tester
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-secondary-200">
              <div>
                <p className="font-medium text-secondary-900">Médecin</p>
                <p className="text-sm text-secondary-600">doctor@dawini.com</p>
              </div>
              <button
                onClick={() => {
                  setError('');
                  login('doctor@dawini.com', 'password123');
                }}
                className="btn btn-sm"
              >
                Tester
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-secondary-200">
              <div>
                <p className="font-medium text-secondary-900">Pharmacien</p>
                <p className="text-sm text-secondary-600">pharmacy@dawini.com</p>
              </div>
              <button
                onClick={() => {
                  setError('');
                  login('pharmacy@dawini.com', 'password123');
                }}
                className="btn btn-sm"
              >
                Tester
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
