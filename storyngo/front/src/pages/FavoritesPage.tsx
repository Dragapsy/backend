import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { getMyBookmarks } from '../api/storyApi'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import { StoryCard } from '../components/StoryCard'
import type { StoryDTO } from '../types'

export function FavoritesPage() {
  const [stories, setStories] = useState<StoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getMyBookmarks()
        setStories(data)
      } catch {
        setError('Impossible de charger vos histoires favorites.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return <LoadingState label="Chargement de vos favoris..." />
  }

  return (
    <Box sx={{ display: 'grid', gap: 3.2 }}>
      <SectionTitle
        title="Mes Histoires Favorites"
        subtitle="Les histoires que vous avez mises en favori."
      />

      {error && <ErrorBanner message={error} />}

      {!error && stories.length === 0 && (
        <EmptyState
          title="Aucun favori pour l'instant"
          description="Ajoutez une histoire a vos favoris depuis sa page de detail."
        />
      )}

      {stories.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary">
            {stories.length} histoire{stories.length > 1 ? 's' : ''} en favori
          </Typography>

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
        </>
      )}
    </Box>
  )
}
