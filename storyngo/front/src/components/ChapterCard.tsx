import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { ChapterDTO } from '../types'

interface ChapterCardProps {
  chapter: ChapterDTO
  onVote: (chapterId: number) => Promise<void>
  votingId: number | null
  disabled?: boolean
}

function truncateContent(content: string, limit: number) {
  if (content.length <= limit) {
    return content
  }
  return `${content.slice(0, limit)}...`
}

export function ChapterCard({ chapter, onVote, votingId, disabled = false }: ChapterCardProps) {
  const remainingVotes = Math.max(0, chapter.threshold - chapter.voteCount)

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Chapitre {chapter.orderIndex}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Auteur: {chapter.authorName}
            </Typography>
          </Stack>
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`${chapter.voteCount}/${chapter.threshold} votes`}
          />
        </Stack>

        <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }} variant="body2">
          {truncateContent(chapter.content, chapter.charLimit || 320)}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {chapter.unlocked
            ? 'Chapitre debloque'
            : `Encore ${remainingVotes} vote${remainingVotes > 1 ? 's' : ''} pour debloquer`}
        </Typography>
        <Button
          type="button"
          onClick={() => void onVote(chapter.id)}
          disabled={disabled || votingId === chapter.id}
          variant="contained"
          size="small"
        >
          {votingId === chapter.id ? 'Vote...' : 'Voter'}
        </Button>
      </CardActions>
    </Card>
  )
}
