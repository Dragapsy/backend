import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Alert, AlertTitle } from '@mui/material'

interface ErrorBannerProps {
  message: string
  title?: string
  compact?: boolean
}

export function ErrorBanner({ message, title = 'Une erreur est survenue', compact = false }: ErrorBannerProps) {
  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineIcon fontSize={compact ? 'small' : 'medium'} />}
      sx={{ alignItems: compact ? 'center' : 'flex-start' }}
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  )
}
