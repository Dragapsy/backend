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
      setStories(drops)
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
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 4 },
        }}
      >
        <Typography variant="overline" color="primary" fontWeight={700}>
          Tableau de Bord de Storyn'Go
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Derniers Histoires, tendances et votes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 760 }}>
          Explorez les stories et les chapitres en tendance. Connectez-vous pour voter, commenter et publier.
        </Typography>
        {!isAuthenticated && (
          <Typography variant="body2" sx={{ mt: 1.5 }} color="primary.dark">
            Vous devez etre connecte pour voter et commenter.
          </Typography>
        )}
      </Paper>

      {loading && (
        <LoadingState
          label="Chargement du dashboard..."
          description="Recuperation des stories, tendances et chapitres a debloquer."
        />
      )}
      {error && <ErrorBanner message={error} actionLabel="Reessayer" onAction={() => void loadDashboard()} />}

      <section>
        <SectionTitle title="Derniers Drops" subtitle="Stories recemment publiees" />
        {stories.length === 0 && !loading ? (
          <EmptyState
            title="Aucune story recente"
            description="Les prochaines publications apparaitront ici des qu'elles seront en ligne."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </Box>
        )}
      </section>

      <section>
        <SectionTitle title="Trending" subtitle="Stories les plus chaudes du moment" />
        {trendingStories.length === 0 && !loading ? (
          <EmptyState
            title="Pas encore de tendance"
            description="Aucune story ne domine actuellement. Revenez apres les prochains votes."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>
            {trendingStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </Box>
        )}
      </section>

      <section>
        <SectionTitle
          title="Upcoming Chapters"
          subtitle="Votez pour debloquer les prochains chapitres avant tout le monde"
        />
        {upcomingChapters.length === 0 && !loading ? (
          <EmptyState
            title="Aucun chapitre en attente"
            description="Tous les chapitres disponibles sont deja debloques."
            actionLabel="Rafraichir"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
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
  )
}
