import { useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { getStories, getTrendingStories, getUpcomingChapters, voteChapter } from '../api/storyApi'
import { ChapterCard } from '../components/ChapterCard'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
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
const uniqueUsers = new Set([
  ...stories.map((s) => s.authorName),
  ...trendingStories.map((s) => s.authorName),
  ...upcomingChapters.map((c) => c.authorName),
])
  const { isAuthenticated } = useUser()

  async function loadDashboard() {
    setLoading(true)
    setError(null)

    try {
      const [drops, trending, upcoming] = await Promise.all([
        getStories(),
        getTrendingStories(),
        getUpcomingChapters(),
      ])
      setStories(drops.slice(0, 3))
      setTrendingStories(trending)
      setUpcomingChapters(upcoming)
    } catch {
      setError('Impossible de charger le dashboard pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    <Box sx={{ display: 'grid', gap: 4 }}>

      {/* HEADER */}
      <Box>
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Bienvenue sur Story'N'Go
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 760 }}>
          Explorez les histoires et les chapitres en tendance. Connectez-vous pour voter, commenter et publier.
        </Typography>

        {!isAuthenticated && (
          <Typography variant="body2" sx={{ mt: 1.5 }} color="primary.dark">
            Vous devez etre connecte pour voter et commenter.
          </Typography>
        )}
      </Box>


      <SectionTitle title="Notre objectif" subtitle={''} />

      <Typography color="text.secondary">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </Typography>


      {loading && (
        <LoadingState
          label="Chargement du dashboard..."
          description="Recuperation des stories, tendances et chapitres a debloquer."
        />
      )}

      {error && (
        <ErrorBanner
          message={error}
          actionLabel="Reessayer"
          onAction={() => void loadDashboard()}
        />
      )}

  
      <section>
        <SectionTitle title="Les Dernières Histoires" subtitle="Stories recemment publiees" />

        {stories.length === 0 && !loading ? (
          <EmptyState
            title="Aucune story recente"
            description="Les prochaines publications apparaitront ici des qu'elles seront en ligne."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
            }}
          >
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </Box>
        )}
      </section>


      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        {/* TRENDING */}
        <section>
          <SectionTitle title="Trending" subtitle="Stories les plus chaudes du moment" />

          {trendingStories.length === 0 && !loading ? (
            <EmptyState
              title="Pas encore de tendance"
              description="Aucune story ne domine actuellement."
              actionLabel="Actualiser"
              onAction={() => void loadDashboard()}
            />
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {trendingStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </Box>
          )}
        </section>

        {/* UPCOMING */}
        <section>
          <SectionTitle
            title="Upcoming Chapters"
            subtitle="Votez pour debloquer les prochains chapitres"
          />

          {upcomingChapters.length === 0 && !loading ? (
            <EmptyState
              title="Aucun chapitre en attente"
              description="Tous les chapitres sont debloques."
              actionLabel="Rafraichir"
              onAction={() => void loadDashboard()}
            />
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {upcomingChapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onVote={handleVote}
                  votingId={votingId}
                  disabled={!isAuthenticated}
                />
              ))}
            </Box>
          )}
        </section>
      </Box>
    </Box>
  )
}
