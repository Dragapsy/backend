import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { Paper, Stack, Typography } from '@mui/material'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Paper variant="outlined" sx={{ px: 3, py: 4, textAlign: 'center' }}>
      <Stack spacing={1} alignItems="center">
        <InboxOutlinedIcon color="disabled" />
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Paper>
  )
}
