import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { StoryDTO } from '../types'

interface StoryGridCardProps {
  story: StoryDTO
  actionLabel?: string
}

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

export function StoryGridCard({ story, actionLabel = "Lire l'histoire" }: StoryGridCardProps) {
  const navigate = useNavigate()
  const likeCount = story.likeCount ?? 0

  return (
    <Paper
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
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.4 }}>
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

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
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

        <Stack spacing={1.2} alignItems="stretch" justifyContent="space-between">
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
            }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}
