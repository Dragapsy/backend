import { useEffect, useState } from 'react'
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { approveStoryReview, getReviewerDashboard, rejectStoryReview } from '../api/storyApi'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import { StoryCard } from '../components/StoryCard'
import type { StoryDTO } from '../types'

export function ReviewerDashboardPage() {
  const [pendingStories, setPendingStories] = useState<StoryDTO[]>([])
  const [validatedStories, setValidatedStories] = useState<StoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      const data = await getReviewerDashboard()
      setPendingStories(data.pendingStories)
      setValidatedStories(data.validatedStories)
    } catch {
      setError('Impossible de charger la vue reviewer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function handleApprove(storyId: number) {
    setUpdatingId(storyId)
    try {
      await approveStoryReview(storyId)
      await loadDashboard()
    } catch {
      setError('Validation impossible pour le moment.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleReject(storyId: number) {
    setUpdatingId(storyId)
    try {
      await rejectStoryReview(storyId)
      await loadDashboard()
    } catch {
      setError('Rejet impossible pour le moment.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <LoadingState label="Chargement reviewer..." description="Recuperation des stories a traiter." />
  }

  return (
    <Stack spacing={3.5}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 1,
        }}
      >
        <Typography variant="overline" color="primary" fontWeight={700}>
          Dashboard Reviewer
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Validation des histoires
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2 }}>
          Traitez les histoires en attente avec une vue claire des contenus valides.
        </Typography>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <section>
        <SectionTitle title="A valider" subtitle="Histoires actuellement en revue" />
        {pendingStories.length === 0 ? (
          <EmptyState
            title="Aucune histoire en attente"
            description="La file de moderation est vide pour le moment."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Stack spacing={2}>
            {pendingStories.map((story) => (
              <Paper key={story.id} variant="outlined" sx={{ p: 2.2, borderRadius: 1 }}>
                <Box sx={{ display: 'grid', gap: 1.6 }}>
                  <StoryCard story={story} />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => void handleApprove(story.id)}
                      disabled={updatingId === story.id}
                    >
                      Approuver
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => void handleReject(story.id)}
                      disabled={updatingId === story.id}
                    >
                      Rejeter
                    </Button>
                    <Button size="small" component={Link} to={`/stories/${story.id}`}>
                      Ouvrir le detail
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </section>

      <section>
        <SectionTitle title="Histoires validees" subtitle="Contenus deja publies" />
        {validatedStories.length === 0 ? (
          <EmptyState
            title="Aucune histoire validee"
            description="Les histoires approuvees apparaitront ici."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>
            {validatedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </Box>
        )}
      </section>
    </Stack>
  )
}
