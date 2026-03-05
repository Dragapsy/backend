import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import { createStory } from '../api/storyApi'

export function CreateStoryPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const story = await createStory({
        title,
        summary,
        content,
        isAnonymous,
      })
      navigate(`/stories/${story.story.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Creation impossible.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Creation de story</h1>

      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Titre</span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="Le Royaume Oublie"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Resume</span>
          <textarea
            required
            maxLength={2000}
            rows={3}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="De quoi parle votre histoire ?"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Contenu du chapitre 1</span>
          <textarea
            required
            maxLength={2000}
            rows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            placeholder="Commencez votre chapitre..."
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="h-4 w-4"
          />
          Publier anonymement
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? 'Publication...' : 'Publier la story'}
        </button>
      </form>
    </section>
  )
}
