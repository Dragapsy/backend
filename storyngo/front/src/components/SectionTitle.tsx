import { Stack, Typography } from '@mui/material'

interface SectionTitleProps {
  title: string
  subtitle: string
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <Stack spacing={0.6} sx={{ mb: 2.2 }}>
      <Typography variant="h5" sx={{ lineHeight: 1.15 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 620 }}>
        {subtitle}
      </Typography>
    </Stack>
  )
}
