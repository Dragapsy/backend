import { useEffect, useState } from 'react'
import { Alert, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import {
  banUserPermanently,
  banUserTemporarily,
  getAdminAuditLogs,
  getAdminUsers,
  getOpenReports,
  quickUpdateReportStatus,
  unbanUser,
} from '../api/storyApi'
import { getApiErrorMessage } from '../api/apiClient'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import type { AdminAuditLogDTO, AdminReportDTO, AdminUserOverviewDTO } from '../types'

export function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserOverviewDTO[]>([])
  const [reports, setReports] = useState<AdminReportDTO[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      const [usersData, reportsData, logsData] = await Promise.all([getAdminUsers(), getOpenReports(), getAdminAuditLogs()])
      setUsers(usersData)
      setReports(reportsData)
      setAuditLogs(logsData)
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

  if (loading) {
    return <LoadingState label="Chargement admin..." description="Recuperation des utilisateurs et statistiques." />
  }

  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, rgba(26,18,18,1) 0%, rgba(32,18,18,1) 45%, rgba(12,12,12,1) 100%)'
              : 'linear-gradient(120deg, #fff7ed 0%, #fef2f2 45%, #f8fafc 100%)',
        }}
      >
        <Typography variant="overline" color="error" fontWeight={700}>
          Dashboard Admin
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.8 }}>
          Supervision utilisateurs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.2 }}>
          Vue globale des comptes, roles et niveaux d&apos;activite (sans donnees sensibles).
        </Typography>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

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
            <Paper key={user.id} variant="outlined" sx={{ p: 2.2, borderRadius: 3 }}>
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

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
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

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 1.5 }}>
          Journal d&apos;audit admin
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
    </Stack>
  )
}
