import { Box, Button, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyStories } from '../api/storyApi'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import { StoryGridCard } from '../components/StoryGridCard'
import type { StoryDTO } from '../types'

export function DraftsPage() {
  const [drafts, setDrafts] = useState<StoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const all = await getMyStories()
        setDrafts(all.filter((story) => story.status === 'DRAFT'))
      } catch {
        setError('Impossible de charger vos brouillons.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return <LoadingState label="Chargement de vos brouillons..." />
  }

  return (
    <Box sx={{ display: 'grid', gap: 3.2 }}>
      <SectionTitle
        title="Mes Brouillons"
        subtitle="Histoires créées mais pas encore soumises à la review."
      />

      {error && <ErrorBanner message={error} />}

      {!error && drafts.length === 0 && (
        <EmptyState
          title="Aucun brouillon en cours"
          description="Créez une nouvelle histoire pour commencer à écrire."
          actionLabel="Créer une histoire"
          onAction={() => { window.location.href = '/stories/create' }}
        />
      )}

      {drafts.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {drafts.length} brouillon{drafts.length > 1 ? 's' : ''}
            </Typography>
            <Button component={Link} to="/stories/create" variant="contained" size="small">
              Nouvelle histoire
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
            }}
          >
            {drafts.map((story) => (
              <StoryGridCard key={story.id} story={story} actionLabel="Reprendre l'ecriture" />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}
