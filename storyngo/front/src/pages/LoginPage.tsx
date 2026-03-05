import { useState, type FormEvent } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { useUser } from '../context/UserContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser } = useUser()

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await loginUser({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Connexion impossible.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ mx: 'auto', maxWidth: 520, p: { xs: 3, md: 4 } }}>
      <Typography variant="h4">Connexion</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Connectez-vous pour voter, commenter et publier vos stories.
      </Typography>

      {error && <Box sx={{ mt: 2 }}><ErrorBanner message={error} compact /></Box>}
      {loading && <Box sx={{ mt: 2 }}><LoadingState label="Connexion en cours..." compact /></Box>}

      <Stack component="form" spacing={2} sx={{ mt: 3 }} onSubmit={handleSubmit}>
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
          inputProps={{ minLength: 8 }}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
          fullWidth
        />

        <Button type="submit" disabled={loading} variant="contained" size="large" fullWidth>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
        Pas encore de compte ?{' '}
        <Link to="/register">Creer un compte</Link>
      </Typography>
    </Paper>
  )
}
