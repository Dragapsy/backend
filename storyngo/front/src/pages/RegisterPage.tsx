import { useState, type FormEvent } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { useUser } from '../context/UserContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useUser()

  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const isFormReady =
    pseudo.trim().length >= 3 && email.trim().length > 0 && password.length >= 8 && !isPasswordMismatch

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isFormReady) {
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.')
        return
      }
      setError('Completez correctement le formulaire pour continuer.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await registerUser({ pseudo, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Inscription impossible.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ mx: 'auto', maxWidth: 560, p: { xs: 3, md: 4 } }}>
      <Typography variant="h4">Inscription</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Creez votre compte pour publier des stories et des chapitres.
      </Typography>

      {error && <Box sx={{ mt: 2 }}><ErrorBanner message={error} compact /></Box>}
      {loading && <Box sx={{ mt: 2 }}><LoadingState label="Creation du compte..." compact /></Box>}

      <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={handleSubmit}>
        <TextField
          label="Pseudo"
          required
          inputProps={{ minLength: 3, maxLength: 30 }}
          value={pseudo}
          onChange={(event) => setPseudo(event.target.value)}
          placeholder="DragonWriter"
          helperText={`${pseudo.length}/30 caracteres`}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@storyngo.dev"
          fullWidth
        />

        <TextField
          label="Mot de passe"
          type="password"
          required
          inputProps={{ minLength: 8, maxLength: 72 }}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 caracteres"
          helperText="Au moins 8 caracteres"
          fullWidth
        />

        <TextField
          label="Confirmer le mot de passe"
          type="password"
          required
          inputProps={{ minLength: 8, maxLength: 72 }}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Retapez votre mot de passe"
          error={isPasswordMismatch}
          helperText={isPasswordMismatch ? 'Les mots de passe doivent etre identiques' : 'Repetez le mot de passe'}
          fullWidth
        />

        <Button type="submit" disabled={loading || !isFormReady} variant="contained" size="large" fullWidth>
          {loading ? 'Inscription...' : 'Creer mon compte'}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
        Deja inscrit ? <Link to="/login">Se connecter</Link>
      </Typography>
    </Paper>
  )
}
