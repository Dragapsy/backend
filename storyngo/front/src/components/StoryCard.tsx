import { Link } from 'react-router-dom'
import type { StoryDTO } from '../types'

interface StoryCardProps {
  story: StoryDTO
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs uppercase tracking-wide text-emerald-700">Par {story.authorName}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{story.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-700">{story.summary}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{story.chapterCount} chapitres</span>
        <Link
          to={`/stories/${story.id}`}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Lire
        </Link>
      </div>
    </article>
  )
}
