import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStories, getTrendingStories, getUpcomingChapters, voteChapter } from '../api/storyApi'
import { ChapterCard } from '../components/ChapterCard'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import { useUser } from '../context/UserContext'
import type { ChapterDTO, StoryDTO } from '../types'

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

export function HomePage() {
  const [stories, setStories] = useState<StoryDTO[]>([])
  const [trendingStories, setTrendingStories] = useState<StoryDTO[]>([])
  const [upcomingChapters, setUpcomingChapters] = useState<ChapterDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<number | null>(null)
  const { isAuthenticated } = useUser()
  const navigate = useNavigate()


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

  function renderStoryCard(story: StoryDTO) {
    const likeCount = story.likeCount ?? 0

    return (
      <Paper
        key={story.id}
        variant="outlined"
        sx={{
          p: 0,
          overflow: 'hidden',
          borderRadius: 2,
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box
          sx={{
            height: 80,
            background: '#364e14',
            opacity: 0.5,
          }}
        />

        <Box
          sx={{
            p: { xs: 2, md: 2.4 },
            display: 'grid',
            gap: 2,
            gridTemplateColumns: '1fr',
            alignItems: 'stretch',
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 1.4 }}
            >
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

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: 'left',
              }}
            >
              {story.title}
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mt: 1, color: 'text.secondary' }}
            >
              <PersonOutlineIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Par {story.authorName}</Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.6,
                lineHeight: 1.7,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'left',
              }}
            >
              {story.summary}
            </Typography>
          </Box>

          <Stack
            spacing={1.2}
            alignItems="stretch"
            justifyContent="space-between"
          >
            <Chip
              size="small"
              label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />

            <Button
              variant="contained"
              onClick={() => navigate(`/stories/${story.id}`)}
              sx={{
                px: 2.2,
                py: 1,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                width: { xs: '100%', sm: 'fit-content' },
              }}
            >
              Lire l'histoire
            </Button>
          </Stack>
        </Box>
      </Paper>
    )
  }

  function renderCompactStoryCard(story: StoryDTO) {
    const likeCount = story.likeCount ?? 0

    return (
      <Paper
        key={story.id}
        variant="outlined"
        sx={{
          p: 0,
          overflow: 'hidden',
          borderRadius: 2,
          transition: 'transform 180ms ease, border-color 180ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }}
      >
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

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
                textAlign: 'left',
              }}
            >
              {story.title}
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mt: 0.9, color: 'text.secondary' }}
            >
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
              minWidth: { sm: 150 },
            }}
          >
            <Chip
              size="small"
              label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />

            <Button
              variant="contained"
              onClick={() => navigate(`/stories/${story.id}`)}
              sx={{
                px: 2,
                py: 0.9,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                width: { xs: '100%', sm: 'fit-content' },
              }}
            >
              Lire
            </Button>
          </Stack>
        </Box>
      </Paper>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', lg: '1.4fr 0.95fr' },
            alignItems: 'center',
          }}
        >
          <Box>
            <Chip
              icon={<AutoStoriesOutlinedIcon />}
              label="Plateforme de lecture collaborative"
              variant="outlined"
              sx={{
                mb: 1.5,
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderColor: 'rgba(15,23,42,0.08)',
              }}
            />
            <Typography
              variant="h4"
              sx={{
                mt: 0.8,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                maxWidth: 720,
              }}
            >
              Bienvenue sur Story'N'Go
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1.5, maxWidth: 760, lineHeight: 1.75 }}
            >
              Explorez les histoires récentes, repérez les récits qui font parler d'eux et
              débloquez les prochains chapitres avec la communauté.
            </Typography>

            {!isAuthenticated && (
              <Typography variant="body2" sx={{ mt: 1.5 }} color="primary.dark">
                Connectez-vous pour voter, commenter et participer à la publication.
              </Typography>
            )}
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'rgba(255,255,255,0.74)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Stack spacing={1.6}>
              <Typography variant="overline" color="text.secondary">
                Vue rapide
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<ExploreOutlinedIcon />}
                  label={`${stories.length} histoire${stories.length > 1 ? 's' : ''} récente${stories.length > 1 ? 's' : ''}`}
                  sx={{ backgroundColor: '#f8f8f8' }}
                />
                <Chip
                  icon={<BoltOutlinedIcon />}
                  label={`${trendingStories.length} tendance${trendingStories.length > 1 ? 's' : ''}`}
                  sx={{ backgroundColor: '#f8f8f8' }}
                />
                <Chip
                  icon={<HowToVoteOutlinedIcon />}
                  label={`${upcomingChapters.length} chapitre${upcomingChapters.length > 1 ? 's' : ''} à débloquer`}
                  sx={{ backgroundColor: '#f8f8f8' }}
                />
              </Stack>

             
            </Stack>
          </Paper>
        </Box>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.6 },
          borderRadius: 1,
          backgroundColor: 'rgba(255,255,255,0.96)',
        }}
      >
        <SectionTitle title="Notre objectif" subtitle="" />

        <Typography color="text.secondary" sx={{ mt: 1.2, lineHeight: 1.8, maxWidth: 860 }}>
          Story'N'Go met la lecture, l'écriture et l'interaction au même endroit. L'idée est
          simple : découvrir des histoires, suivre leur évolution, puis aider la suite à voir
          le jour grâce aux votes et aux retours des lecteurs.
        </Typography>
      </Paper>

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
        <SectionTitle title="Les Dernières Histoires" subtitle="Stories récemment publiées" />

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
            {stories.map(renderStoryCard)}
          </Box>
        )}
      </section>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.4 },
            borderRadius: 3,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.96)',
          }}
        >
          <SectionTitle title="Trending" subtitle="Stories les plus chaudes du moment" />

          {trendingStories.length === 0 && !loading ? (
            <EmptyState
              title="Pas encore de tendance"
              description="Aucune story ne domine actuellement."
              actionLabel="Actualiser"
              onAction={() => void loadDashboard()}
            />
          ) : (
            <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
              {trendingStories.map(renderCompactStoryCard)}
            </Box>
          )}
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.4 },
            borderRadius: 3,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.96)',
          }}
        >
          <SectionTitle
            title="Upcoming Chapters"
            subtitle="Votez pour débloquer les prochains chapitres"
          />

          {upcomingChapters.length === 0 && !loading ? (
            <EmptyState
              title="Aucun chapitre en attente"
              description="Tous les chapitres sont debloques."
              actionLabel="Rafraichir"
              onAction={() => void loadDashboard()}
            />
          ) : (
            <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
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
        </Paper>
      </Box>
    </Box>
  )
}
