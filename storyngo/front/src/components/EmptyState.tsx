import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { Button, Paper, Stack, Typography } from '@mui/material'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Paper variant="outlined" sx={{ px: 3, py: 4, textAlign: 'center', borderRadius: 3 }}>
      <Stack spacing={1} alignItems="center">
        <InboxOutlinedIcon color="disabled" />
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
          {description}
        </Typography>
        {actionLabel && onAction && (
          <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  )
}
