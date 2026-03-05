import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page introuvable</h1>
      <p className="mt-2 text-sm text-slate-600">La route demandee n'existe pas encore dans Storyn'Go.</p>
      <Link
        to="/"
        className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Retour accueil
      </Link>
    </div>
  )
}
