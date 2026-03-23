import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import {
  approveStoryReview,
  banUserPermanently,
  banUserTemporarily,
  getAdminAuditLogs,
  getAdminUsers,
  getOpenReports,
  getReviewerDashboard,
  quickUpdateReportStatus,
  rejectStoryReview,
  unbanUser,
} from '../api/storyApi'
import { getApiErrorMessage } from '../api/apiClient'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import type { AdminAuditLogDTO, AdminReportDTO, AdminUserOverviewDTO, StoryDTO } from '../types'

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

export function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserOverviewDTO[]>([])
  const [reports, setReports] = useState<AdminReportDTO[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogDTO[]>([])
  const [pendingStories, setPendingStories] = useState<StoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null)
  const [updatingStoryId, setUpdatingStoryId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      const [usersData, reportsData, logsData, reviewerData] = await Promise.all([
        getAdminUsers(),
        getOpenReports(),
        getAdminAuditLogs(),
        getReviewerDashboard(),
      ])
      setUsers(usersData)
      setReports(reportsData)
      setAuditLogs(logsData)
      setPendingStories(reviewerData.pendingStories)
    } catch {
      setError('Impossible de charger la vue admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function handleTemporaryBan(targetUser: AdminUserOverviewDTO) {
    const reason = window.prompt(`Motif du ban temporaire pour ${targetUser.pseudo}:`)
    if (!reason || reason.trim().length === 0) {
      return
    }

    const daysRaw = window.prompt('Duree du ban (en jours, ex: 7):', '7')
    const durationDays = Number(daysRaw)
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      setError('Duree de ban invalide.')
      return
    }

    setUpdatingUserId(targetUser.id)
    setError(null)
    try {
      await banUserTemporarily(targetUser.id, { durationDays, reason: reason.trim() })
      await loadDashboard()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Ban temporaire impossible.'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  async function handlePermanentBan(targetUser: AdminUserOverviewDTO) {
    const reason = window.prompt(`Motif du ban definitif pour ${targetUser.pseudo}:`)
    if (!reason || reason.trim().length === 0) {
      return
    }

    setUpdatingUserId(targetUser.id)
    setError(null)
    try {
      await banUserPermanently(targetUser.id, { reason: reason.trim() })
      await loadDashboard()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Ban definitif impossible.'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  async function handleUnban(targetUser: AdminUserOverviewDTO) {
    setUpdatingUserId(targetUser.id)
    setError(null)
    try {
      await unbanUser(targetUser.id)
      await loadDashboard()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Deban impossible.'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  async function handleApprove(storyId: number) {
    setUpdatingStoryId(storyId)
    try {
      await approveStoryReview(storyId)
      await loadDashboard()
    } catch {
      setError('Validation impossible pour le moment.')
    } finally {
      setUpdatingStoryId(null)
    }
  }

  async function handleReject(storyId: number) {
    setUpdatingStoryId(storyId)
    try {
      await rejectStoryReview(storyId)
      await loadDashboard()
    } catch {
      setError('Rejet impossible pour le moment.')
    } finally {
      setUpdatingStoryId(null)
    }
  }

  async function handleReportStatus(report: AdminReportDTO, targetStatus: 'IN_REVIEW' | 'RESOLVED' | 'REJECTED') {
    const note = window.prompt(`Note de moderation pour le report #${report.id} (${targetStatus}):`, report.resolutionNote ?? '')

    setUpdatingReportId(report.id)
    setError(null)
    try {
      await quickUpdateReportStatus(report.id, targetStatus, note ?? undefined)
      await loadDashboard()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Mise a jour du signalement impossible.'))
    } finally {
      setUpdatingReportId(null)
    }
  }

  function renderPendingStoryGrid(story: StoryDTO) {
    const likeCount = story.likeCount ?? 0

    return (
      <Paper
        key={story.id}
        variant="outlined"
        sx={{
          p: 0,
          borderRadius: 2,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
          <Box
            sx={{
              height: 80,
              background: '#364e14',
              opacity: 0.5,
            }}
          />

          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.4, flexGrow: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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

            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, textAlign: 'left' }}>
              {story.title}
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
              <PersonOutlineIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Par {story.authorName}</Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.65,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'left',
              }}
            >
              {story.summary}
            </Typography>

            <Stack spacing={1} sx={{ mt: 'auto', pt: 1 }}>
              <Chip
                size="small"
                label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
                variant="outlined"
                sx={{ width: 'fit-content' }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => void handleApprove(story.id)}
                  disabled={updatingStoryId === story.id}
                >
                  Approuver
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => void handleReject(story.id)}
                  disabled={updatingStoryId === story.id}
                >
                  Rejeter
                </Button>
                <Button size="small" component={Link} to={`/stories/${story.id}`}>
                  Ouvrir le detail
                </Button>
              </Stack>
            </Stack>
          </Box>
      </Paper>
    )
  }

  if (loading) {
    return <LoadingState label="Chargement admin..." description="Recuperation des utilisateurs et statistiques." />
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Chip
          icon={<AutoStoriesOutlinedIcon />}
          label="Espace administration"
          sx={{
            mb: 1.5,
            backgroundColor: 'rgba(255,255,255,0.72)',
            borderColor: 'rgba(15,23,42,0.08)',
          }}
          variant="outlined"
        />
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Supervision utilisateurs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2 }}>
          Vue globale des comptes, roles et niveaux d&apos;activite (sans donnees sensibles).
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <section>
        <SectionTitle title="Histoires a valider" subtitle="Stories en attente de review" />
        {pendingStories.length === 0 ? (
          <EmptyState
            title="Aucune histoire en attente"
            description="La file de moderation est vide."
            actionLabel="Actualiser"
            onAction={() => void loadDashboard()}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
            }}
          >
            {pendingStories.map(renderPendingStoryGrid)}
          </Box>
        )}
      </section>

      {users.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur"
          description="Les comptes crees apparaitront dans cette vue d'administration."
          actionLabel="Actualiser"
          onAction={() => void loadDashboard()}
        />
      ) : (
        <Stack spacing={1.5}>
          {users.map((user) => (
            <Paper key={user.id} variant="outlined" sx={{ p: 2.2, borderRadius: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {user.pseudo}
                </Typography>
                <Chip label={user.role} color={user.role === 'ADMIN' ? 'error' : user.role === 'REVIEWER' ? 'warning' : 'default'} />
                <Chip
                  label={user.accountStatus}
                  color={user.accountStatus === 'ACTIVE' ? 'success' : 'error'}
                  variant="outlined"
                />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 0.8 }}>
                {user.email} • Inscrit le {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              <Typography sx={{ mt: 1.1 }}>
                Histoires: <strong>{user.storyCount}</strong> • Chapitres: <strong>{user.chapterCount}</strong> • Commentaires:{' '}
                <strong>{user.commentCount}</strong>
              </Typography>
              <Typography sx={{ mt: 0.8 }}>
                XP: <strong>{user.xp}</strong> • Niveau: <strong>{user.level}</strong> ({user.levelTitle})
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {user.badges.length > 0 ? (
                  user.badges.map((badge) => <Chip key={`${user.id}-${badge}`} label={badge} size="small" variant="outlined" />)
                ) : (
                  <Typography color="text.secondary">Aucun badge</Typography>
                )}
              </Stack>
              {(user.banReason || user.banUntil) && (
                <Typography sx={{ mt: 0.8 }} color="text.secondary">
                  Motif: {user.banReason ?? '-'} {user.banUntil ? `• Jusqu'au ${new Date(user.banUntil).toLocaleString()}` : ''}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => void handleTemporaryBan(user)}
                  disabled={updatingUserId === user.id}
                >
                  Ban temporaire
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => void handlePermanentBan(user)}
                  disabled={updatingUserId === user.id}
                >
                  Ban definitif
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => void handleUnban(user)}
                  disabled={updatingUserId === user.id || user.accountStatus === 'ACTIVE'}
                >
                  Debannir
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            Signalements priorises
          </Typography>
          {reports.length === 0 ? (
            <Typography color="text.secondary">Aucun signalement ouvert.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {reports.map((report) => (
                <Paper key={report.id} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
                      Report #{report.id} • {report.type} #{report.targetId}
                    </Typography>
                    <Chip label={report.priority} color={report.priority === 'CRITICAL' || report.priority === 'HIGH' ? 'error' : 'warning'} size="small" />
                    <Chip label={report.status} size="small" variant="outlined" />
                  </Stack>
                  <Typography sx={{ mt: 0.8 }}>{report.reason}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Reporter: {report.reporterPseudo} • {new Date(report.createdAt).toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => void handleReportStatus(report, 'IN_REVIEW')}
                      disabled={updatingReportId === report.id}
                    >
                      En review
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => void handleReportStatus(report, 'RESOLVED')}
                      disabled={updatingReportId === report.id}
                    >
                      Resolu
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => void handleReportStatus(report, 'REJECTED')}
                      disabled={updatingReportId === report.id}
                    >
                      Rejeter
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            Journal d'Audit administratif
          </Typography>
          {auditLogs.length === 0 ? (
            <Typography color="text.secondary">Aucune action admin journalisee.</Typography>
          ) : (
            <Stack spacing={1}>
              {auditLogs.slice(0, 20).map((log) => (
                <Paper key={log.id} variant="outlined" sx={{ p: 1.6, borderRadius: 2 }}>
                  <Typography fontWeight={700}>{log.action}</Typography>
                  <Typography color="text.secondary">
                    Admin: {log.adminPseudo} • Cible: {log.targetType} #{log.targetId}
                  </Typography>
                  {log.details && <Typography sx={{ mt: 0.4 }}>{log.details}</Typography>}
                  <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Stack>
  )
}
