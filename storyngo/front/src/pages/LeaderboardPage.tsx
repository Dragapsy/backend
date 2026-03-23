import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { getApiErrorMessage } from '../api/apiClient'
import { getLeaderboard, getPublicUserProfile } from '../api/storyApi'
import { LoadingState } from '../components/LoadingState'
import type { LeaderboardEntryDTO, LeaderboardPeriod, PublicUserProfileDTO, UserRole } from '../types'

export function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('WEEK')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL')
  const [entries, setEntries] = useState<LeaderboardEntryDTO[]>([])
  const [selectedProfile, setSelectedProfile] = useState<PublicUserProfileDTO | null>(null)
  const [openProfileDialog, setOpenProfileDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const leaderboard = await getLeaderboard(period, 50)
        setEntries(leaderboard)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le classement.'))
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [period])

  async function handleOpenProfile(userId: number) {
    try {
      const profile = await getPublicUserProfile(userId)
      setSelectedProfile(profile)
      setOpenProfileDialog(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger le profil public.'))
    }
  }

  const displayedEntries = roleFilter === 'ALL' ? entries : entries.filter((entry) => entry.role === roleFilter)

  if (loading) {
    return <LoadingState label="Chargement du classement..." description="Recuperation du Top XP selon la periode." />
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Chip
          icon={<AutoStoriesOutlinedIcon />}
          label="Classement communautaire"
          sx={{
            mb: 1.5,
            backgroundColor: 'rgba(255,255,255,0.72)',
            borderColor: 'rgba(15,23,42,0.08)',
          }}
          variant="outlined"
        />
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Top 50 des utilisateurs les plus actifs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2 }}>
          Comparez la progression de la communaute sur la semaine ou le mois.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          select
          label="Periode"
          value={period}
          onChange={(event) => setPeriod(event.target.value as LeaderboardPeriod)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          <MenuItem value="WEEK">Semaine</MenuItem>
          <MenuItem value="MONTH">Mois</MenuItem>
        </TextField>
        <TextField
          select
          label="Role"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as 'ALL' | UserRole)}
          sx={{ minWidth: 180 }}
          size="small"
        >
          <MenuItem value="ALL">Tous</MenuItem>
          <MenuItem value="USER">Utilisateur</MenuItem>
          <MenuItem value="REVIEWER">Auteur</MenuItem>
          <MenuItem value="ADMIN">Administrateur</MenuItem>
        </TextField>
        <Typography color="text.secondary">Affichage des 50 meilleurs utilisateurs.</Typography>
      </Stack>

      <Stack spacing={1.2}>
        {displayedEntries.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
            <Typography color="text.secondary">Aucune donnee XP pour ce filtre.</Typography>
          </Paper>
        ) : (
          displayedEntries.map((entry, index) => (
            <Paper key={entry.userId} variant="outlined" sx={{ p: 2.2, borderRadius: 1 }}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', cursor: 'pointer' }}
                onClick={() => void handleOpenProfile(entry.userId)}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`#${index + 1}`} color={index < 3 ? 'warning' : 'default'} size="small" />
                  <Typography fontWeight={700}>{entry.pseudo}</Typography>
                  <Chip label={entry.role} size="small" variant="outlined" />
                </Stack>
                <Typography color="text.secondary">
                  +{entry.periodXp} XP • Level {entry.level} ({entry.levelTitle})
                </Typography>
              </Box>
            </Paper>
          ))
        )}
      </Stack>

      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Profil public</DialogTitle>
        <DialogContent>
          {selectedProfile && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar src={selectedProfile.profileImageUrl ?? undefined} alt={selectedProfile.pseudo}>
                  {selectedProfile.pseudo.slice(0, 1).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedProfile.pseudo}</Typography>
                  <Typography color="text.secondary">
                    {selectedProfile.role} • Level {selectedProfile.level} ({selectedProfile.levelTitle})
                  </Typography>
                </Box>
              </Stack>

              <Typography color="text.secondary">{selectedProfile.bio?.trim() || 'Aucune bio.'}</Typography>

              <Typography>
                XP: <strong>{selectedProfile.xp}</strong> • Histoires: <strong>{selectedProfile.storyCount}</strong> • Chapitres:{' '}
                <strong>{selectedProfile.chapterCount}</strong> • Commentaires: <strong>{selectedProfile.commentCount}</strong>
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedProfile.badges.length > 0 ? (
                  selectedProfile.badges.map((badge) => <Chip key={badge} label={badge} size="small" color="primary" variant="outlined" />)
                ) : (
                  <Typography color="text.secondary">Aucun badge</Typography>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
