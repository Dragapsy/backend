import type { ChapterDTO } from '../types'

interface ChapterCardProps {
  chapter: ChapterDTO
  onVote: (chapterId: number) => Promise<void>
  votingId: number | null
  disabled?: boolean
}

function truncateContent(content: string, limit: number) {
  if (content.length <= limit) {
    return content
  }
  return `${content.slice(0, limit)}...`
}

export function ChapterCard({ chapter, onVote, votingId, disabled = false }: ChapterCardProps) {
  const remainingVotes = Math.max(0, chapter.threshold - chapter.voteCount)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Chapitre {chapter.orderIndex}</p>
          <p className="text-sm text-slate-600">Auteur: {chapter.authorName}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          {chapter.voteCount}/{chapter.threshold} votes
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">
        {truncateContent(chapter.content, chapter.charLimit || 320)}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {chapter.unlocked
            ? 'Chapitre debloque'
            : `Encore ${remainingVotes} vote${remainingVotes > 1 ? 's' : ''} pour debloquer`}
        </p>
        <button
          type="button"
          onClick={() => void onVote(chapter.id)}
          disabled={disabled || votingId === chapter.id}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {votingId === chapter.id ? 'Vote...' : 'Voter'}
        </button>
      </div>
    </article>
  )
}
