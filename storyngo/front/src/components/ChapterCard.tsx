import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { ChapterDTO } from '../types'

interface ChapterCardProps {
  chapter: ChapterDTO
  onVote: (chapterId: number) => Promise<void>
  onUnvote: (chapterId: number) => Promise<void>
  votingId: number | null
  disabled?: boolean
}

function truncateContent(content: string, limit: number) {
  if (content.length <= limit) {
    return content
  }
  return `${content.slice(0, limit)}...`
}

export function ChapterCard({ chapter, onVote, onUnvote, votingId, disabled = false }: ChapterCardProps) {
  const remainingVotes = Math.max(0, chapter.threshold - chapter.voteCount)

  return (
    <Card
      sx={{
        '& .MuiChip-root': {
          transition: 'transform 150ms ease',
        },
        '&:hover .MuiChip-root': {
          transform: 'translateX(2px)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.2 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} gap={1.25}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
              Chapitre {chapter.orderIndex}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
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

        <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap', transition: 'color 160ms ease' }} variant="body2">
          {truncateContent(chapter.content, chapter.charLimit || 320)}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: { xs: 1.75, sm: 2 }, pb: { xs: 1.75, sm: 2 }, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {chapter.votingClosed
            ? 'Vote clôturé'
            : chapter.unlocked
              ? 'Chapitre débloqué'
              : `Encore ${remainingVotes} vote${remainingVotes > 1 ? 's' : ''} pour débloquer`}
        </Typography>
        <Button
          type="button"
          onClick={() => void (chapter.votedByMe ? onUnvote(chapter.id) : onVote(chapter.id))}
          disabled={disabled || votingId === chapter.id || chapter.votingClosed}
          variant={chapter.votedByMe ? 'outlined' : 'contained'}
          color={chapter.votedByMe ? 'secondary' : 'primary'}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {chapter.votingClosed
            ? 'Vote clôturé'
            : votingId === chapter.id
              ? '...'
              : chapter.votedByMe
                ? 'Retirer mon vote'
                : 'Voter'}
        </Button>
      </CardActions>
    </Card>
  )
}
