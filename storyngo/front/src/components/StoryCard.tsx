import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'
import type { StoryDTO } from '../types'

interface StoryCardProps {
  story: StoryDTO
}

function formatAuthorLabel(story: StoryDTO): string {
  if (story.authorRole === 'ADMIN') {
    return `${story.authorName} - admin`
  }
  if (story.authorRole === 'REVIEWER') {
    return `${story.authorName} - reviewer`
  }
  return story.authorName
}

function formatStoryDate(createdAt?: string): string {
  if (!createdAt) {
    return 'Date indisponible'
  }

  return new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function StoryCard({ story }: StoryCardProps) {
  const authorLabel = formatAuthorLabel(story)
  const likeCount = story.likeCount ?? 0

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.10)',
          borderColor: 'rgba(25, 118, 210, 0.24)',
        },
      }}
    >
      <Box
        sx={{
          height: 82,
          background:
            'linear-gradient(120deg, rgba(255,183,77,0.95) 0%, rgba(255,224,178,0.85) 35%, rgba(144,202,249,0.95) 100%)',
        }}
      />

      <CardContent
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.35 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.6,
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            icon={<FavoriteBorderIcon />}
            label={`${likeCount} like${likeCount > 1 ? 's' : ''}`}
            sx={{ backgroundColor: '#fff7ed' }}
          />
          <Chip
            size="small"
            icon={<CalendarTodayOutlinedIcon />}
            label={formatStoryDate(story.createdAt)}
            sx={{ backgroundColor: '#eff6ff' }}
          />
        </Stack>

        <Stack direction="row" spacing={1.1} alignItems="center">
          <Avatar
            src={story.authorProfileImageUrl ?? undefined}
            alt={authorLabel}
            sx={{ width: 34, height: 34 }}
          >
            {story.authorName.slice(0, 1).toUpperCase()}
          </Avatar>
          <Stack spacing={0.15}>
            <Typography variant="body2" color="text.secondary">
              Auteur
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {authorLabel}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          variant="h6"
          sx={{
            lineHeight: 1.25,
            fontSize: { xs: '1.02rem', sm: '1.14rem' },
            fontWeight: 700,
          }}
        >
          {story.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '5.8em',
          }}
        >
          {story.summary}
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 'auto', pt: 0.5 }}
        >
          <Chip
            size="small"
            icon={<MenuBookOutlinedIcon />}
            label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
            variant="outlined"
          />

          <Button
            component={Link}
            to={`/stories/${story.id}`}
            variant="contained"
            size="small"
            sx={{
              px: 2.1,
              py: 0.9,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            Lire l'histoire
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
