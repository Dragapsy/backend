import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { StoryDTO } from '../types'

interface StoryCardProps {
  story: StoryDTO
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.2}>
          <Chip size="small" color="primary" variant="outlined" label={`Par ${story.authorName}`} sx={{ width: 'fit-content' }} />
          <Typography variant="h6">{story.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {story.summary}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {story.chapterCount} chapitres
        </Typography>
        <Button component={Link} to={`/stories/${story.id}`} variant="contained" size="small">
          Lire
        </Button>
      </CardActions>
    </Card>
  )
}
