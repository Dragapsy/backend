import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { StoryDTO } from '../types'

interface StoryCardProps {
  story: StoryDTO
}

export function StoryCard({ story }: StoryCardProps) {
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
          <Chip size="small" color="primary" variant="outlined" label={`Par ${story.authorName}`} sx={{ width: 'fit-content' }} />
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
