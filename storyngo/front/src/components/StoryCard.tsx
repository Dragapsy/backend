import { Avatar, Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { StoryDTO } from '../types'

interface StoryCardProps {
  story: StoryDTO
}

function formatAuthorLabel(story: StoryDTO): string {
  if (story.authorRole === 'ADMIN') {
    return `${story.authorName} ° admin`
  }
  if (story.authorRole === 'REVIEWER') {
    return `${story.authorName} ° reviewer`
  }
  return story.authorName
}

export function StoryCard({ story }: StoryCardProps) {
  const authorLabel = formatAuthorLabel(story)

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiChip-root': {
          transition: 'transform 150ms ease',
        },
        '&:hover .MuiChip-root': {
          transform: 'translateX(2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 1.75, sm: 2.2 } }}>
        <Stack spacing={1.3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={story.authorProfileImageUrl ?? undefined} alt={authorLabel} sx={{ width: 26, height: 26 }}>
              {story.authorName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {authorLabel}
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ lineHeight: 1.2, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
            {story.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {story.summary}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: { xs: 1.75, sm: 2 }, pb: { xs: 1.75, sm: 2 }, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {story.chapterCount} chapitres
        </Typography>
        <Button
          component={Link}
          to={`/stories/${story.id}`}
          variant="contained"
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Lire
        </Button>
      </CardActions>
    </Card>
  )
}
