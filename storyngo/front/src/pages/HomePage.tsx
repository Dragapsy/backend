import { useEffect, useState } from 'react'
import { getStories, getTrendingStories, getUpcomingChapters, voteChapter } from '../api/storyApi'
import { ChapterCard } from '../components/ChapterCard'
import { SectionTitle } from '../components/SectionTitle'
import { StoryCard } from '../components/StoryCard'
import { useUser } from '../context/UserContext'
import type { ChapterDTO, StoryDTO } from '../types'

export function HomePage() {
  const [stories, setStories] = useState<StoryDTO[]>([])
  const [trendingStories, setTrendingStories] = useState<StoryDTO[]>([])
  const [upcomingChapters, setUpcomingChapters] = useState<ChapterDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<number | null>(null)

  const { isAuthenticated } = useUser()

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError(null)

      try {
        const [drops, trending, upcoming] = await Promise.all([
          getStories(),
          getTrendingStories(),
          getUpcomingChapters(),
        ])
        setStories(drops)
        setTrendingStories(trending)
        setUpcomingChapters(upcoming)
      } catch {
        setError('Impossible de charger le dashboard pour le moment.')
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  async function handleVote(chapterId: number) {
    setVotingId(chapterId)

    try {
      const result = await voteChapter(chapterId)
      setUpcomingChapters((prev) =>
        prev.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                voteCount: chapter.voteCount + 1,
                unlocked: chapter.unlocked || result.unlocked,
              }
            : chapter,
        ),
      )
    } catch {
      setError('Vote impossible. Verifiez que le backend tourne avec les comptes de test.')
    } finally {
      setVotingId(null)
    }
  }

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-100 via-lime-50 to-sky-100 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Storyn'Go Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Derniers Drops, tendances et votes</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">
          Explorez les stories et les chapitres en tendance. Connectez-vous pour voter, commenter et publier.
        </p>
        {!isAuthenticated && (
          <p className="mt-3 text-xs text-slate-600">Vous devez etre connecte pour voter et commenter.</p>
        )}
      </header>

      {loading && <p className="text-sm text-slate-600">Chargement des donnees...</p>}
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <section>
        <SectionTitle title="Derniers Drops" subtitle="Stories recemment publiees" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Trending" subtitle="Stories les plus chaudes du moment" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trendingStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Upcoming Chapters"
          subtitle="Votez pour debloquer les prochains chapitres avant tout le monde"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {upcomingChapters.map((chapter) => (
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
    </div>
  )
}
