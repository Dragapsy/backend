import { useState, type FormEvent } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { createStory } from '../api/storyApi'

export function CreateStoryPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedTitle = title.trim()
  const trimmedSummary = summary.trim()
  const trimmedContent = content.trim()
  const isFormReady =
    trimmedTitle.length >= 3 && trimmedSummary.length > 0 && trimmedSummary.length <= 2000 && trimmedContent.length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isFormReady) {
      setError('Completez correctement les champs requis avant publication.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const story = await createStory({
        title: trimmedTitle,
        summary: trimmedSummary,
        content: trimmedContent,
        isAnonymous,
      })
      navigate(`/stories/${story.story.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Creation impossible.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
      <Typography variant="h4">Creation de story</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Publiez une nouvelle intrigue et lancez votre premiere vague de votes.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Le premier chapitre definit le ton: soyez clair sur le hook narratif et l'objectif.
      </Typography>

      {error && <Box sx={{ mt: 2 }}><ErrorBanner message={error} compact /></Box>}
      {submitting && <Box sx={{ mt: 2 }}><LoadingState label="Publication de la story..." compact /></Box>}

      <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={handleSubmit}>
        <TextField
          label="Titre"
          required
          inputProps={{ minLength: 3, maxLength: 120 }}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Le Royaume Oublie"
          helperText={`${title.length}/120 caracteres`}
          fullWidth
        />

        <TextField
          label="Resume"
          required
          inputProps={{ maxLength: 2000 }}
          rows={3}
          multiline
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="De quoi parle votre histoire ?"
          helperText={`${summary.length}/2000 caracteres`}
          fullWidth
        />

        <TextField
          label="Contenu du chapitre 1"
          required
          inputProps={{ maxLength: 2000 }}
          rows={10}
          multiline
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Commencez votre chapitre..."
          helperText={`${content.length}/2000 caracteres`}
          fullWidth
        />

        <FormControlLabel
          control={<Checkbox checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />}
          label="Publier anonymement"
        />

        <Button
          type="submit"
          disabled={submitting || !isFormReady}
          variant="contained"
          size="large"
          sx={{ width: 'fit-content' }}
        >
          {submitting ? 'Publication...' : 'Publier la story'}
        </Button>
      </Stack>
    </Paper>
  )
}
