import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { approveStoryReview, getReviewerDashboard, rejectStoryReview } from '../api/storyApi'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import type { AdminReportDTO, StoryDTO } from '../types'

function formatStoryDate(createdAt?: string) {
  if (!createdAt) {
    return 'Date indisponible'
  }

  return new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ReviewerDashboardPage() {
  const [pendingStories, setPendingStories] = useState<StoryDTO[]>([])
  const [validatedStories, setValidatedStories] = useState<StoryDTO[]>([])
  const [flaggedReports, setFlaggedReports] = useState<AdminReportDTO[]>([])
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
      setFlaggedReports(data.flaggedReports)
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

  function renderCompactStory(story: StoryDTO, withActions = false) {
    const likeCount = story.likeCount ?? 0

    return (
      <Paper key={story.id} variant="outlined" sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '10px 1fr auto' },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              background: '#364e14',
              opacity: 0.5,
            }}
          />

          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip
                size="small"
                icon={<FavoriteBorderIcon />}
                label={`${likeCount} like${likeCount > 1 ? 's' : ''}`}
                sx={{ backgroundColor: '#f8f8f8' }}
              />
              <Chip
                size="small"
                icon={<CalendarTodayOutlinedIcon />}
                label={formatStoryDate(story.createdAt)}
                sx={{ backgroundColor: '#f8f8f8' }}
              />
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, textAlign: 'left' }}>
              {story.title}
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.9, color: 'text.secondary' }}>
              <PersonOutlineIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Par {story.authorName}</Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.1,
                lineHeight: 1.65,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'left',
              }}
            >
              {story.summary}
            </Typography>
          </Box>

          <Stack
            spacing={1}
            justifyContent="center"
            alignItems={{ xs: 'stretch', sm: 'flex-end' }}
            sx={{
              px: { xs: 2, sm: 2 },
              pb: { xs: 2, sm: 0 },
              pr: { xs: 2, sm: 2 },
              minWidth: { sm: 170 },
            }}
          >
            <Chip
              size="small"
              label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />

            {withActions ? (
              <>
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
              </>
            ) : null}

            <Button size="small" component={Link} to={`/stories/${story.id}`}>
              Ouvrir le detail
            </Button>
          </Stack>
        </Box>
      </Paper>
    )
  }

  if (loading) {
    return <LoadingState label="Chargement reviewer..." description="Récupération des stories à traiter." />
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
        <Chip
          icon={<AutoStoriesOutlinedIcon />}
          label="Espace reviewer"
          sx={{
            mb: 1.5,
            backgroundColor: 'rgba(255,255,255,0.72)',
            borderColor: 'rgba(15,23,42,0.08)',
          }}
          variant="outlined"
        />
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Validation des histoires
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2 }}>
          Traitez les histoires en attente avec une vue claire des contenus validés.
        </Typography>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <section>
        <SectionTitle title="A valider" subtitle="Histoires actuellement en revue" />
        {pendingStories.length === 0 ? (
          <EmptyState
            title="Aucune histoire en attente"
            description="La file de modération est vide pour le moment."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Stack spacing={2}>
            {pendingStories.map((story) => renderCompactStory(story, true))}
          </Stack>
        )}
      </section>

      <section>
        <SectionTitle title="Histoires validées" subtitle="Contenus déjà publiés" />
        {validatedStories.length === 0 ? (
          <EmptyState
            title="Aucune histoire validée"
            description="Les histoires approuvées apparaîtront ici."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {validatedStories.map((story) => renderCompactStory(story))}
          </Box>
        )}
      </section>

      <section>
        <SectionTitle title="Signalements ouverts" subtitle="Contenus signalés par les utilisateurs" />
        {flaggedReports.length === 0 ? (
          <EmptyState
            title="Aucun signalement ouvert"
            description="Aucun contenu signalé pour le moment."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Stack spacing={1.5}>
            {flaggedReports.map((report) => (
              <Paper key={report.id} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {report.type} #{report.targetId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.reason}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Signalé par {report.reporterPseudo} · Priorité : {report.priority}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      bgcolor: report.priority === 'CRITICAL' ? 'error.light' : report.priority === 'HIGH' ? 'warning.light' : 'grey.200',
                      color: report.priority === 'CRITICAL' ? 'error.contrastText' : 'text.primary',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {report.status}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </section>
    </Stack>
  )
}
