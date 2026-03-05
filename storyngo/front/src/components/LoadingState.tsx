import { CircularProgress, Paper, Stack, Typography } from '@mui/material'

interface LoadingStateProps {
  label?: string
  compact?: boolean
}

export function LoadingState({ label = 'Chargement en cours...', compact = false }: LoadingStateProps) {
  return (
    <Paper variant="outlined" sx={{ px: compact ? 2 : 3, py: compact ? 1.5 : 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <CircularProgress size={compact ? 18 : 22} />
        <Typography variant={compact ? 'body2' : 'body1'} fontWeight={500}>
          {label}
        </Typography>
      </Stack>
    </Paper>
  )
}
