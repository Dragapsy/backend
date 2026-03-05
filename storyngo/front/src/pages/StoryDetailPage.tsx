import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import { addChapter, addComment, getComments, getStoryDetails, voteChapter } from '../api/storyApi'
import { ChapterCard } from '../components/ChapterCard'
import { useUser } from '../context/UserContext'
import type { CommentDTO, StoryDetailsDTO } from '../types'

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [storyDetails, setStoryDetails] = useState<StoryDetailsDTO | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [postingComment, setPostingComment] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [chapterContent, setChapterContent] = useState('')
  const [chapterAnonymous, setChapterAnonymous] = useState(false)
  const [addingChapter, setAddingChapter] = useState(false)
  const [chapterError, setChapterError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<number | null>(null)
  const { isAuthenticated, user } = useUser()

  const selectedChapter = useMemo(
    () => storyDetails?.chapters.find((chapter) => chapter.id === selectedChapterId) ?? null,
    [storyDetails, selectedChapterId],
  )

  const canAddChapter = Boolean(
    isAuthenticated && storyDetails?.story.authorName && user?.pseudo === storyDetails.story.authorName,
  )

  async function loadComments(chapterId: number) {
    setLoadingComments(true)
    setCommentsError(null)

    try {
      const data = await getComments(chapterId)
      setComments(data)
    } catch (err) {
      setCommentsError(getApiErrorMessage(err, 'Chargement des commentaires impossible.'))
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    async function loadStory() {
      if (!id) {
        setError('Identifiant de story invalide.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const details = await getStoryDetails(Number(id))
        setStoryDetails(details)
        if (details.chapters.length > 0) {
          const firstChapterId = details.chapters[0].id
          setSelectedChapterId(firstChapterId)
          await loadComments(firstChapterId)
        }
      } catch {
        setError('Impossible de charger cette story.')
      } finally {
        setLoading(false)
      }
    }

    void loadStory()
  }, [id])

  async function handleChapterSelection(chapterId: number) {
    setSelectedChapterId(chapterId)
    await loadComments(chapterId)
  }

  async function handleVote(chapterId: number) {
    if (!storyDetails) {
      return
    }

    setVotingId(chapterId)
    try {
      const result = await voteChapter(chapterId)
      setStoryDetails({
        ...storyDetails,
        chapters: storyDetails.chapters.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                voteCount: chapter.voteCount + 1,
                unlocked: chapter.unlocked || result.unlocked,
              }
            : chapter,
        ),
      })
    } catch {
      setError('Vote impossible pour ce chapitre.')
    } finally {
      setVotingId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Chargement de la story...</p>
  }

  if (error || !storyDetails) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error ?? 'Story introuvable.'}</p>
        <Link to="/" className="text-sm font-semibold text-slate-700 underline">
          Retour au dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-semibold text-slate-700 underline">
        Retour au dashboard
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Story #{storyDetails.story.id}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{storyDetails.story.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{storyDetails.story.summary}</p>
        <p className="mt-3 text-xs text-slate-500">Auteur principal: {storyDetails.story.authorName}</p>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Lecture des chapitres</h2>
        <div className="space-y-4">
          {storyDetails.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onVote={handleVote}
              votingId={votingId}
              disabled={!isAuthenticated}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Commentaires</h2>
        {storyDetails.chapters.length > 0 ? (
          <>
            <label className="mt-3 block">
              <span className="text-sm font-medium text-slate-700">Choisir un chapitre</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={selectedChapterId ?? ''}
                onChange={(event) => {
                  void handleChapterSelection(Number(event.target.value))
                }}
              >
                {storyDetails.chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    Chapitre {chapter.orderIndex}
                  </option>
                ))}
              </select>
            </label>

            {loadingComments && <p className="mt-3 text-sm text-slate-600">Chargement des commentaires...</p>}
            {commentsError && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{commentsError}</p>}

            <div className="mt-4 space-y-3">
              {comments.map((comment) => (
                <article key={comment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm text-slate-800">{comment.content}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {comment.authorName} - {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
              {!loadingComments && comments.length === 0 && (
                <p className="text-sm text-slate-600">Aucun commentaire sur ce chapitre pour le moment.</p>
              )}
            </div>

            {isAuthenticated ? (
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!selectedChapter) {
                    return
                  }

                  void (async () => {
                    setPostingComment(true)
                    setCommentsError(null)
                    try {
                      const created = await addComment(selectedChapter.id, { content: commentContent })
                      setComments((prev) => [created, ...prev])
                      setCommentContent('')
                    } catch (err) {
                      setCommentsError(getApiErrorMessage(err, 'Ajout du commentaire impossible.'))
                    } finally {
                      setPostingComment(false)
                    }
                  })()
                }}
              >
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Partagez votre reaction..."
                />
                <button
                  type="submit"
                  disabled={postingComment || !selectedChapter}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {postingComment ? 'Publication...' : 'Ajouter un commentaire'}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                <Link to="/login" className="font-semibold text-emerald-700 underline">
                  Connectez-vous
                </Link>{' '}
                pour commenter.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Aucun chapitre disponible pour cette story.</p>
        )}
      </section>

      {canAddChapter && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Ajouter un chapitre</h2>

          {chapterError && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{chapterError}</p>}

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!storyDetails) {
                return
              }

              void (async () => {
                setAddingChapter(true)
                setChapterError(null)
                try {
                  const created = await addChapter(storyDetails.story.id, {
                    content: chapterContent,
                    isAnonymous: chapterAnonymous,
                  })

                  setStoryDetails((prev) => {
                    if (!prev) {
                      return prev
                    }
                    return {
                      ...prev,
                      chapters: [...prev.chapters, created],
                    }
                  })
                  setChapterContent('')
                  setChapterAnonymous(false)
                } catch (err) {
                  setChapterError(getApiErrorMessage(err, 'Ajout du chapitre impossible.'))
                } finally {
                  setAddingChapter(false)
                }
              })()
            }}
          >
            <textarea
              required
              maxLength={10000}
              rows={8}
              value={chapterContent}
              onChange={(event) => setChapterContent(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ecrivez le prochain chapitre..."
            />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={chapterAnonymous}
                onChange={(event) => setChapterAnonymous(event.target.checked)}
                className="h-4 w-4"
              />
              Publier anonymement ce chapitre
            </label>

            <button
              type="submit"
              disabled={addingChapter}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {addingChapter ? 'Publication...' : 'Ajouter le chapitre'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
