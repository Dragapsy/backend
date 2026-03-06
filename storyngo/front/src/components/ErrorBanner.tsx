import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Alert, AlertTitle, Button } from '@mui/material'

interface ErrorBannerProps {
  message: string
  title?: string
  compact?: boolean
  actionLabel?: string
  onAction?: () => void
}

export function ErrorBanner({
  message,
  title = 'Une erreur est survenue',
  compact = false,
  actionLabel,
  onAction,
}: ErrorBannerProps) {
  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineIcon fontSize={compact ? 'small' : 'medium'} />}
      sx={{ alignItems: compact ? 'center' : 'flex-start', borderRadius: 3 }}
      action={
        actionLabel && onAction ? (
          <Button color="inherit" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
    >
      <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>
      {message}
    </Alert>
  )
}
