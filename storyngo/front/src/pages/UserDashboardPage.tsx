import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'
import {
  followUser,
  getCurrentUserProfile,
  getFollowing,
  getPersonalizedFeed,
  getWeeklyLeaderboard,
  getXpHistory,
  getMyStories,
  unfollowUser,
  updateCurrentUserProfile,
} from '../api/storyApi'
import { getApiErrorMessage } from '../api/apiClient'
import { LoadingState } from '../components/LoadingState'
import { useUser } from '../context/UserContext'
import type { SocialFollowingDTO, StoryDTO, UserDTO, UserXpEventDTO, WeeklyLeaderboardEntryDTO } from '../types'

function formatStoryDate(createdAt?: string) {
  if (!createdAt) {
    return 'Date indisponible'
  }

  return new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function UserDashboardPage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserDTO | null>(user)
  const [pseudo, setPseudo] = useState('')
  const [bio, setBio] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardEntryDTO[]>([])
  const [following, setFollowing] = useState<SocialFollowingDTO[]>([])
  const [followingIds, setFollowingIds] = useState<number[]>([])
  const [feed, setFeed] = useState<StoryDTO[]>([])
  const [xpHistory, setXpHistory] = useState<UserXpEventDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [followLoadingId, setFollowLoadingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [archivedStories, setArchivedStories] = useState<StoryDTO[]>([])
  const [draftStories, setDraftStories] = useState<StoryDTO[]>([])
  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCurrentUserProfile()
        setProfile(data)
        setPseudo(data.pseudo ?? '')
        setBio(data.bio ?? '')
        setProfileImageUrl(data.profileImageUrl ?? '')
        const weeklyLeaderboard = await getWeeklyLeaderboard(5)
        setLeaderboard(weeklyLeaderboard)
        const followingList = await getFollowing()
        setFollowing(followingList)
        setFollowingIds(followingList.map((entry) => entry.userId))
        const personalizedFeed = await getPersonalizedFeed(12)
        setFeed(personalizedFeed)
        const xpEvents = await getXpHistory(20)
        setXpHistory(xpEvents)
        const myStories = await getMyStories()

        setDraftStories(myStories.filter((story) => story.status === 'DRAFT'))
        setArchivedStories(myStories.filter((story) => story.status === 'ARCHIVED'))
      } catch {
        setError('Impossible de charger votre profil pour le moment.')
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  function getXpActionLabel(event: UserXpEventDTO) {
    switch (event.action) {
      case 'CREATE_STORY':
        return `Création d'une histoire`;
      case 'CREATE_CHAPTER':
        return `Création d'un chapitre`;
      case 'VOTE_CHAPTER':
        return `Vote sur un chapitre`;
      case 'SUBMIT_REVIEW':
        return `Ecrire un commentaire`;
      default:
        return event.action; // fallback si l’action est inconnue
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const data = await updateCurrentUserProfile({
        pseudo: pseudo.trim(),
        bio: bio.trim(),
        profileImageUrl: profileImageUrl.trim(),
      })
      setProfile(data)
      setPseudo(data.pseudo ?? '')
      setBio(data.bio ?? '')
      setProfileImageUrl(data.profileImageUrl ?? '')
      setSuccessMessage('Profil mis a jour avec succes.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de sauvegarder le profil.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleFollowToggle(targetUserId: number, isFollowing: boolean) {
    if (targetUserId === profile?.id) {
      return
    }

    setFollowLoadingId(targetUserId)
    setError(null)
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId)
      } else {
        await followUser(targetUserId)
      }

      const followingList = await getFollowing()
      setFollowing(followingList)
      setFollowingIds(followingList.map((entry) => entry.userId))
      const personalizedFeed = await getPersonalizedFeed(12)
      setFeed(personalizedFeed)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de mettre a jour le suivi pour le moment.'))
    } finally {
      setFollowLoadingId(null)
    }
  }

  function renderCompactStoryCard(story: StoryDTO) {
    const likeCount = story.likeCount ?? 0

    return (
      <Paper
        key={story.id}
        variant="outlined"
        sx={{
          p: 0,
          overflow: 'hidden',
          borderRadius: 2,
          transition: 'transform 180ms ease, border-color 180ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '10px 1fr auto' },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              background: '#364e14',
              opacity: 0.5,
            }}
          />

          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip
                size="small"
                icon={<FavoriteBorderIcon />}
                label={`${likeCount} like${likeCount > 1 ? 's' : ''}`}
                sx={{ backgroundColor: '#f8f8f8' }}
              />
              <Chip
                size="small"
                icon={<CalendarTodayOutlinedIcon />}
                label={formatStoryDate(story.createdAt)}
                sx={{ backgroundColor: '#f8f8f8' }}
              />
            </Stack>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
                textAlign: 'left',
              }}
            >
              {story.title}
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mt: 0.9, color: 'text.secondary' }}
            >
              <PersonOutlineIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Par {story.authorName}</Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.1,
                lineHeight: 1.65,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'left',
              }}
            >
              {story.summary}
            </Typography>
          </Box>

          <Stack
            spacing={1}
            justifyContent="center"
            alignItems={{ xs: 'stretch', sm: 'flex-end' }}
            sx={{
              px: { xs: 2, sm: 2 },
              pb: { xs: 2, sm: 0 },
              pr: { xs: 2, sm: 2 },
              minWidth: { sm: 150 },
            }}
          >
            <Chip
              size="small"
              label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />

            <Button
              variant="contained"
              href={`/stories/${story.id}`}
              sx={{
                px: 2,
                py: 0.9,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                width: { xs: '100%', sm: 'fit-content' },
              }}
            >
              Lire
            </Button>
          </Stack>
        </Box>
      </Paper>
    )
  }

  if (loading) {
    return <LoadingState label="Chargement du profil..." description="Recuperation de vos informations utilisateur." />
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Chip
          icon={<AutoStoriesOutlinedIcon />}
          label="Espace personnel"
          sx={{
            mb: 1.5,
            backgroundColor: 'rgba(255,255,255,0.72)',
            borderColor: 'rgba(15,23,42,0.08)',
          }}
          variant="outlined"
        />
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Mon profil et mon activite
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2 }}>
          Consultez vos informations publiques et votre progression sur Storyn&apos;Go.
        </Typography>
      </Box>


      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderColor: '#fff',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5
            }}
          >
            <Typography color="#fff" variant="h5" fontWeight={700}>
              {profile?.storyCount ?? 0}
            </Typography>
          </Box>

          <Typography color="text.secondary">Histoires</Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderColor: '#fff',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5
            }}
          >
            <Typography color="#fff" variant="h5" fontWeight={700}>
              {profile?.chapterCount ?? 0}
            </Typography>
          </Box>

          <Typography color="text.secondary">Chapitres</Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderColor: '#fff',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5
            }}
          >
            <Typography color="#fff" variant="h5" fontWeight={700}>
              {profile?.commentCount ?? 0}
            </Typography>
          </Box>

          <Typography color="text.secondary">Commentaires</Typography>
        </Paper>
      </Box>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Informations du compte
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar src={profile?.profileImageUrl ?? undefined} alt={profile?.pseudo} sx={{ width: 58, height: 58 }}>
          {profile?.pseudo?.slice(0, 1).toUpperCase()}
        </Avatar>
      </Stack>
      <Stack spacing={0.9}>
        <Typography><strong>Pseudo:</strong> {profile?.pseudo}</Typography>
        <Typography><strong>Email:</strong> {profile?.email}</Typography>
        <Typography><strong>Role:</strong> {profile?.role}</Typography>
        <Typography><strong>Inscription:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : '-'}</Typography>
      </Stack>
      {editMode && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Modifier mon profil
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Pseudo"
              value={pseudo}
              onChange={(event) => setPseudo(event.target.value)}
              inputProps={{ maxLength: 30 }}
              fullWidth
            />

            <TextField
              label="URL photo de profil"
              value={profileImageUrl}
              onChange={(event) => setProfileImageUrl(event.target.value)}
              inputProps={{ maxLength: 500 }}
              fullWidth
            />

            <TextField
              label="Bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              inputProps={{ maxLength: 1000 }}
              fullWidth
              multiline
              minRows={3}
            />

            <Box>
              <Button
                variant="contained"
                onClick={() => void handleSaveProfile()}
                disabled={saving}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}
      <Button
        variant="outlined"
        onClick={() => setEditMode((prev) => !prev)}
      >
        {editMode ? 'Fermer' : 'Modifier mon profil'}
      </Button>


      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, flex: 1, minWidth: 280 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Progression de l'Auteur
          </Typography>
          <Stack spacing={1.1}>
            <Typography>
              <strong>XP:</strong> {profile?.xp ?? 0}
            </Typography>
            <Typography>
              <strong>Niveau:</strong> {profile?.level ?? 1} • {profile?.levelTitle ?? 'Novice'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 0.5 }}>
              {(profile?.badges ?? []).length > 0 ? (
                (profile?.badges ?? []).map((badge) => <Chip key={badge} label={badge} color="primary" variant="outlined" />)
              ) : (
                <Typography color="text.secondary">Aucun badge pour le moment.</Typography>
              )}
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, flex: 1, minWidth: 280 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Classement hebdomadaire
          </Typography>
          {leaderboard.length === 0 ? (
            <Typography color="text.secondary">Aucun mouvement XP cette semaine.</Typography>
          ) : (
            <Stack spacing={1}>
              {leaderboard.map((entry, index) => (
                <Box
                  key={entry.userId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.8,
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Stack>
                    <Typography>
                      #{index + 1} {entry.pseudo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      +{entry.weeklyXp} XP • Lv {entry.level}
                    </Typography>
                  </Stack>
                  {entry.userId !== profile?.id && (
                    <Button
                      size="small"
                      variant={followingIds.includes(entry.userId) ? 'outlined' : 'contained'}
                      disabled={followLoadingId === entry.userId}
                      onClick={() => void handleFollowToggle(entry.userId, followingIds.includes(entry.userId))}
                    >
                      {followingIds.includes(entry.userId) ? 'Ne plus suivre' : 'Suivre'}
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '40% 60%' },
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Comptes suivis
          </Typography>
          {following.length === 0 ? (
            <Typography color="text.secondary">Vous ne suivez encore personne.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {following.map((followedUser) => (
                <Box
                  key={followedUser.userId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.8,
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={0.2}>
                    <Typography>{followedUser.pseudo}</Typography>
                    <Typography variant="caption" color="text.secondary">{followedUser.role}</Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={followLoadingId === followedUser.userId}
                    onClick={() => void handleFollowToggle(followedUser.userId, true)}
                  >
                    Ne plus suivre
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Histoires des auteurs suivis
          </Typography>
          {feed.length === 0 ? (
            <Typography color="text.secondary">Suivez des auteurs pour voir leurs histoires ici.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {feed.map(renderCompactStoryCard)}
            </Box>
          )}
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Historique des points d'expérience
        </Typography>
        {xpHistory.length === 0 ? (
          <Typography color="text.secondary">Aucun point d'expérience acquis.</Typography>
        ) : (
          <Stack spacing={1.1}>
            {xpHistory.slice(0, 5).map((event) => (
              
              <Box
                key={event.id}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px dashed', borderColor: 'divider' }}
              >
                <Stack spacing={0.2}>

                  <Typography>{getXpActionLabel(event)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.createdAt).toLocaleString()} • {event.referenceType}
                    {event.referenceId ? ` #${event.referenceId}` : ''}
                  </Typography>
                </Stack>
                <Typography color="primary" fontWeight={600}>
                  +{event.deltaXp} XP
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Mes brouillons
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Histoires créées mais pas encore soumises à la review.
        </Typography>

        {draftStories.length === 0 ? (
          <Typography color="text.secondary">
            Aucun brouillon en cours.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {draftStories.map(renderCompactStoryCard)}
          </Box>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Mes histoires archivées
        </Typography>

        {archivedStories.length === 0 ? (
          <Typography color="text.secondary">
            Vous n'avez aucune histoire archivée.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {archivedStories.map(renderCompactStoryCard)}
          </Box>
        )}
      </Paper>
    </Stack>
  )
}
