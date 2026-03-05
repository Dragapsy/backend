import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import { useUser } from '../context/UserContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useUser()

  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await registerUser({ pseudo, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Inscription impossible.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Inscription</h1>
      <p className="mt-2 text-sm text-slate-600">Creez votre compte pour publier des stories et des chapitres.</p>

      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Pseudo</span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={30}
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="DragonWriter"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="vous@storyngo.dev"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Mot de passe</span>
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="Minimum 8 caracteres"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Confirmer le mot de passe</span>
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="Retapez votre mot de passe"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Inscription...' : 'Creer mon compte'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Deja inscrit ?{' '}
        <Link to="/login" className="font-semibold text-emerald-700 underline">
          Se connecter
        </Link>
      </p>
    </section>
  )
}
