import { Stack, Typography } from '@mui/material'

interface SectionTitleProps {
  title: string
  subtitle: string
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <Stack spacing={0.5} sx={{ mb: 2 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  )
}
