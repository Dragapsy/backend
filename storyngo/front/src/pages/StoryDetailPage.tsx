import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/apiClient'
import {
  addChapter,
  addComment,
  approveStoryReview,
  archiveStory,
  bookmarkStory,
  createReport,
  getComments,
  getStoryDetails,
  getStoryLikes,
  getStoryQualityScore,
  likeStory,
  rejectStoryReview,
  submitStoryForReview,
  unbookmarkStory,
  unlikeStory,
  voteChapter,
} from '../api/storyApi'
import { ChapterCard } from '../components/ChapterCard'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import { useUser } from '../context/UserContext'
import type { CommentDTO, StoryDetailsDTO, StoryQualityScoreDTO, StoryStatus } from '../types'

const workflowSteps: StoryStatus[] = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']

const statusLabel: Record<StoryStatus, string> = {
  DRAFT: 'Brouillon',
  IN_REVIEW: 'En validation',
  PUBLISHED: 'Publiee',
  ARCHIVED: 'Archivee',
}

const statusDescription: Record<StoryStatus, string> = {
  DRAFT: 'L’auteur peut encore modifier et ajouter des chapitres.',
  IN_REVIEW: 'La story attend la decision d’un reviewer ou admin.',
  PUBLISHED: 'La story est visible comme version publiee.',
  ARCHIVED: 'La story est fermee en consultation uniquement.',
}

const statusTone: Record<StoryStatus, 'default' | 'warning' | 'success'> = {
  DRAFT: 'default',
  IN_REVIEW: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
}

function getQualityMention(score: number) {
  if (score >= 80) {
    return 'Excellent niveau'
  }
  if (score >= 60) {
    return 'Bon niveau'
  }
  if (score >= 40) {
    return 'Niveau moyen'
  }
  return 'Niveau a renforcer'
}

function formatAuthorDisplay(authorName: string, authorRole?: 'USER' | 'REVIEWER' | 'ADMIN') {
  if (authorRole === 'ADMIN') {
    return `${authorName} ° admin`
  }
  if (authorRole === 'REVIEWER') {
    return `${authorName} ° reviewer`
  }
  return authorName
}

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [storyDetails, setStoryDetails] = useState<StoryDetailsDTO | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [postingComment, setPostingComment] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [chapterContent, setChapterContent] = useState('')
  const [chapterAnonymous, setChapterAnonymous] = useState(false)
  const [addingChapter, setAddingChapter] = useState(false)
  const [chapterError, setChapterError] = useState<string | null>(null)
  const [qualityScore, setQualityScore] = useState<StoryQualityScoreDTO | null>(null)
  const [qualityError, setQualityError] = useState<string | null>(null)
  const [loadingQuality, setLoadingQuality] = useState(false)
  const [workflowBusy, setWorkflowBusy] = useState<'submit' | 'approve' | 'reject' | 'archive' | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportingStory, setReportingStory] = useState(false)
  const [reportMessage, setReportMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<number | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { isAuthenticated, user } = useUser()
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  const selectedChapter = useMemo(
    () => storyDetails?.chapters.find((chapter) => chapter.id === selectedChapterId) ?? null,
    [storyDetails, selectedChapterId],
  )

  const canAddChapter = Boolean(
    isAuthenticated && storyDetails?.story.authorName && user?.pseudo === storyDetails.story.authorName,
  )
  const hasLockedChapters = Boolean(storyDetails?.chapters.some((chapter) => !chapter.unlocked))
  const lockedChapterCount = storyDetails?.chapters.filter((chapter) => !chapter.unlocked).length ?? 0

  const currentStatus = storyDetails?.story.status

  const isAuthor = Boolean(
    isAuthenticated && storyDetails?.story.authorName && user?.pseudo === storyDetails.story.authorName,
  )

  const currentStepIndex = useMemo(() => {
    if (!currentStatus) {
      return 0
    }
    return Math.max(0, workflowSteps.indexOf(currentStatus))
  }, [currentStatus])

  const canSubmitReview = Boolean(isAuthor && currentStatus === 'DRAFT')
  const canReviewStory = Boolean(isAuthenticated && !isAuthor && currentStatus === 'IN_REVIEW')
  const canArchiveStory = Boolean(isAuthenticated && currentStatus === 'PUBLISHED')
  const canCreateNextChapter = Boolean(canAddChapter && currentStatus === 'DRAFT' && storyDetails?.canAddChapter)

  const loadStory = useCallback(async () => {
    if (!id) {
      setError('Identifiant de story invalide.')
      setLoading(false)
      return
    }
    
    

    setLoading(true)
    setError(null)

    try {
      const storyId = Number(id)
      const [details, likes] = await Promise.all([
        getStoryDetails(storyId),
        getStoryLikes(storyId),
      ])
      setStoryDetails(details)
      void refreshQualityScore(storyId)
      setLikeCount(likes.likeCount)
      setLiked(likes.likedByMe)
      if (details.chapters.length > 0) {
        const firstChapterId = details.chapters[0].id
        setSelectedChapterId(firstChapterId)
        await loadComments(firstChapterId)
      } else {
        setSelectedChapterId(null)
        setComments([])
      }
    } catch {
      setError('Impossible de charger cette story.')
    } finally {
      setLoading(false)
    }
  }, [id])

  async function refreshQualityScore(storyId: number) {
    setLoadingQuality(true)
    setQualityError(null)
    try {
      const score = await getStoryQualityScore(storyId)
      setQualityScore(score)
    } catch (err) {
      setQualityError(getApiErrorMessage(err, 'Score qualite indisponible pour le moment.'))
    } finally {
      setLoadingQuality(false)
    }
  }

  async function handleLikeStory() {
    if (!storyDetails) return

    setLiking(true)
    try {
      if (liked) {
        await unlikeStory(storyDetails.story.id)
        setLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likeStory(storyDetails.story.id)
        setLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch {
      setError('Impossible de mettre a jour le like de cette story.')
    } finally {
      setLiking(false)
    }
  }
  async function handleBookmarkStory() {
    if (!storyDetails) return

    setBookmarking(true)
    try {
      if (bookmarked) {
        await unbookmarkStory(storyDetails.story.id)
        setBookmarked(false)
      } else {
        await bookmarkStory(storyDetails.story.id)
        setBookmarked(true)
      }
    } catch {
      setError('Impossible de mettre a jour le favori de cette story.')
    } finally {
      setBookmarking(false)
    }
  }

  async function loadComments(chapterId: number) {
    setLoadingComments(true)
    setCommentsError(null)

    try {
      const data = await getComments(chapterId)
      setComments(data)
    } catch (err) {
      setCommentsError(getApiErrorMessage(err, 'Chargement des commentaires impossible.'))
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    void loadStory()
  }, [loadStory])

  async function handleChapterSelection(chapterId: number) {
    setSelectedChapterId(chapterId)
    await loadComments(chapterId)
  }

  async function handleVote(chapterId: number) {
    if (!storyDetails) {
      return
    }

    setVotingId(chapterId)
    try {
      const result = await voteChapter(chapterId)
      setStoryDetails({
        ...storyDetails,
        chapters: storyDetails.chapters.map((chapter) =>
          chapter.id === chapterId
            ? {
              ...chapter,
              voteCount: chapter.voteCount + 1,
              unlocked: chapter.unlocked || result.unlocked,
            }
            : chapter,
        ),
      })
      void refreshQualityScore(storyDetails.story.id)
    } catch {
      setError('Vote impossible pour ce chapitre.')
    } finally {
      setVotingId(null)
    }
  }

  async function handleWorkflowAction(action: 'submit' | 'approve' | 'reject' | 'archive') {
    if (!storyDetails) {
      return
    }

    setWorkflowBusy(action)
    setWorkflowError(null)
    try {
      const updatedStory =
        action === 'submit'
          ? await submitStoryForReview(storyDetails.story.id)
          : action === 'approve'
            ? await approveStoryReview(storyDetails.story.id)
            : action === 'reject'
              ? await rejectStoryReview(storyDetails.story.id)
              : await archiveStory(storyDetails.story.id)

      setStoryDetails((prev) => {
        if (!prev) {
          return prev
        }
        return {
          ...prev,
          story: updatedStory,
        }
      })

      void refreshQualityScore(storyDetails.story.id)
    } catch (err) {
      setWorkflowError(getApiErrorMessage(err, 'Action workflow impossible.'))
    } finally {
      setWorkflowBusy(null)
    }
  }

  async function handleReportStory() {
    if (!isAuthenticated || !storyDetails) {
      return
    }

    const reason = reportReason.trim()
    if (reason.length < 5) {
      setReportMessage('Precisez un motif plus detaille pour le signalement.')
      return
    }

    setReportingStory(true)
    setReportMessage(null)
    try {
      await createReport({
        type: 'STORY',
        targetId: storyDetails.story.id,
        reason,
      })
      setReportReason('')
      setReportMessage('Signalement envoye a la moderation.')
    } catch (err) {
      setReportMessage(getApiErrorMessage(err, 'Signalement impossible pour le moment.'))
    } finally {
      setReportingStory(false)
    }
  }

  if (loading) {
    return <LoadingState label="Chargement de la story..." />
  }

  if (error || !storyDetails) {
    return (
      <Stack spacing={2}>
        <ErrorBanner message={error ?? 'Story introuvable.'} />
        <Button component={RouterLink} to="/" variant="text" sx={{ width: 'fit-content' }}>
          Retour au dashboard
        </Button>
      </Stack>
    )
  }

  const authorDisplay = formatAuthorDisplay(storyDetails.story.authorName, storyDetails.story.authorRole)

  return (
    <Box sx={{ display: 'grid', gap: 3.2 }}>
      <Button component={RouterLink} to="/" variant="text" sx={{ width: 'fit-content', px: 0.5 }}>
        Retour au dashboard
      </Button>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3.4 },
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: 'grid', gap: 2.6, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
          <Box>
            <Chip
              icon={<AutoStoriesOutlinedIcon />}
              label="Lecture de l'histoire"
              sx={{
                mb: 1.5,
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderColor: 'rgba(15,23,42,0.08)',
              }}
              variant="outlined"
            />
            
            <Typography variant="h4" sx={{ mt: 0.8 }}>
              {storyDetails.story.title}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <Button
                variant={liked ? 'contained' : 'outlined'}
                color="error"
                disabled={!isAuthenticated || liking}
                onClick={() => {
                  void handleLikeStory()
                }}
              >
                {liking ? '...' : liked ? 'Retirer le like' : 'Liker'}
              </Button>

              <Typography variant="body2" color="text.secondary">
                {likeCount} like{likeCount > 1 ? 's' : ''}
              </Typography>

              {isAuthenticated && (
                <Button
                  variant={bookmarked ? 'contained' : 'outlined'}
                  color="warning"
                  disabled={bookmarking}
                  onClick={() => {
                    void handleBookmarkStory()
                  }}
                >
                  {bookmarking ? '...' : bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </Button>
              )}
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.4, maxWidth: 820 }}>
              {storyDetails.story.summary}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2.1 }}>
              <Chip label={statusLabel[storyDetails.story.status]} color={statusTone[storyDetails.story.status]} variant="outlined" />
              <Chip label={`${storyDetails.chapters.length} chapitre(s)`} variant="outlined" />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.8 }}>
              Auteur principal: {authorDisplay}
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Etat de la story
            </Typography>
            {loadingQuality ? (
              <Box sx={{ mt: 1.5 }}>
                <LoadingState label="Mise a jour des informations..." compact />
              </Box>
            ) : qualityError ? (
              <Box sx={{ mt: 1.5 }}>
                <ErrorBanner message={qualityError} compact />
              </Box>
            ) : qualityScore ? (
              <>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  {statusLabel[storyDetails.story.status]}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {statusDescription[storyDetails.story.status]}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.4 }}>
                  <Chip size="small" label={`${qualityScore.chapterCount} chapitre(s)`} color="primary" variant="outlined" />
                  <Chip size="small" label={`${qualityScore.voteCount} vote(s)`} color="success" variant="outlined" />
                  <Chip size="small" label={`${qualityScore.commentCount} commentaire(s)`} color="secondary" variant="outlined" />
                </Stack>
              </>
            ) : null}
          </Paper>
        </Box>
      </Paper>

      {isAuthenticated && (
        <Paper variant="outlined" sx={{ p: 2.2, borderRadius: 1 }}>
          <Typography variant="h6">Signaler cette histoire</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            En cas d'abus, spam ou contenu problematique, envoyez un signalement a l'equipe moderation.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} sx={{ mt: 1.2 }}>
            <TextField
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder="Motif du signalement"
              fullWidth
              size="small"
              inputProps={{ maxLength: 255 }}
            />
            <Button
              variant="outlined"
              disabled={reportingStory}
              onClick={() => {
                void handleReportStory()
              }}
            >
              {reportingStory ? 'Envoi...' : 'Signaler'}
            </Button>
          </Stack>
          {reportMessage && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {reportMessage}
            </Typography>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2.2 }}>
        <Button
          variant="text"
          color="secondary"
          endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowAdvanced((prev) => !prev)}
          sx={{ justifyContent: 'space-between', width: '100%', px: 1 }}
        >
          {showAdvanced ? 'Masquer les details avances' : 'Afficher les details avances'}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ px: 1, mt: 0.5 }}>
          Mode optionnel pour moderation, publication et score interne.
        </Typography>

        <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">Moderation et publication</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                Cette frise indique ou en est la story dans son cycle de publication.
              </Typography>

              <Box sx={{ mt: 1.6, display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
                {workflowSteps.map((step, index) => {
                  const isCurrent = index === currentStepIndex
                  const isCompleted = index < currentStepIndex
                  return (
                    <Paper
                      key={step}
                      variant="outlined"
                      sx={{
                        p: 1.4,
                        backgroundColor: isCurrent ? '#ecfeff' : isCompleted ? '#ecfdf5' : '#f8fafc',
                        borderColor: isCurrent ? '#67e8f9' : isCompleted ? '#86efac' : '#e2e8f0',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        ETAPE {index + 1}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mt: 0.35 }}>
                        {statusLabel[step]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block', lineHeight: 1.45 }}>
                        {statusDescription[step]}
                      </Typography>
                    </Paper>
                  )
                })}
              </Box>

              {workflowError && (
                <Box sx={{ mt: 2 }}>
                  <ErrorBanner message={workflowError} compact />
                </Box>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                {canSubmitReview && (
                  <Button
                    variant="contained"
                    disabled={workflowBusy !== null}
                    onClick={() => {
                      void handleWorkflowAction('submit')
                    }}
                  >
                    {workflowBusy === 'submit' ? 'Soumission...' : 'Envoyer en validation'}
                  </Button>
                )}

                {canReviewStory && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      disabled={workflowBusy !== null}
                      onClick={() => {
                        void handleWorkflowAction('approve')
                      }}
                    >
                      {workflowBusy === 'approve' ? 'Validation...' : 'Valider la story'}
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      disabled={workflowBusy !== null}
                      onClick={() => {
                        void handleWorkflowAction('reject')
                      }}
                    >
                      {workflowBusy === 'reject' ? 'Rejet...' : 'Demander des corrections'}
                    </Button>
                  </>
                )}

                {canArchiveStory && (
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={workflowBusy !== null}
                    onClick={() => {
                      void handleWorkflowAction('archive')
                    }}
                  >
                    {workflowBusy === 'archive' ? 'Archivage...' : 'Archiver'}
                  </Button>
                )}
              </Stack>

              {!isAuthenticated && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Connectez-vous pour interagir avec le workflow.
                </Typography>
              )}
            </Paper>

            {qualityScore && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6">Indicateurs de qualite</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                  Score interne: {qualityScore.totalScore}/100 - {getQualityMention(qualityScore.totalScore)}
                </Typography>

                <Box sx={{ mt: 1.6, display: 'grid', gap: 1.2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <Paper variant="outlined" sx={{ p: 1.4, background: 'linear-gradient(120deg, #ecfeff 0%, #ffffff 100%)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      RICHESSE DU CONTENU
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {qualityScore.completenessScore}/40
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Progression et densite de la story.
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.4, background: 'linear-gradient(120deg, #ecfdf5 0%, #ffffff 100%)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      MATURITE DE PUBLICATION
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {qualityScore.statusScore}/25
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Depend du statut actuel de la story.
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.4, background: 'linear-gradient(120deg, #f5f3ff 0%, #ffffff 100%)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      ENGAGEMENT DES LECTEURS
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {qualityScore.engagementScore}/35
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      S'appuie sur votes et commentaires.
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            )}
          </Stack>
        </Collapse>
      </Paper>

      <section>
        <SectionTitle title="Lecture des chapitres" subtitle="Suivez les chapitres deja publies et votez pour la suite." />
        <Stack spacing={2}>
          {storyDetails.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onVote={handleVote}
              votingId={votingId}
              disabled={!isAuthenticated}
            />
          ))}
        </Stack>
      </section>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h5">Commentaires</Typography>
        {storyDetails.chapters.length > 0 ? (
          <>
            <FormControl fullWidth sx={{ mt: 2 }} size="small">
              <InputLabel id="chapter-select-label">Choisir un chapitre</InputLabel>
              <Select
                labelId="chapter-select-label"
                value={selectedChapterId ?? ''}
                label="Choisir un chapitre"
                onChange={(event) => {
                  void handleChapterSelection(Number(event.target.value))
                }}
              >
                {storyDetails.chapters.map((chapter) => (
                  <MenuItem key={chapter.id} value={chapter.id}>
                    Chapitre {chapter.orderIndex}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loadingComments && <Box sx={{ mt: 2 }}><LoadingState label="Chargement des commentaires..." compact /></Box>}
            {commentsError && <Box sx={{ mt: 2 }}><ErrorBanner message={commentsError} compact /></Box>}

            <Stack spacing={1.2} sx={{ mt: 2 }}>
              {comments.map((comment) => (
                <Paper key={comment.id} variant="outlined" sx={{ p: 1.5, backgroundColor: '#f8fafc' }}>
                  <Typography variant="body2">{comment.content}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: 'block' }}>
                    {comment.authorName} - {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
              {!loadingComments && comments.length === 0 && (
                <EmptyState
                  title="Aucun commentaire"
                  description="Soyez le premier a reagir a ce chapitre."
                />
              )}
            </Stack>

            {isAuthenticated ? (
              <Stack
                component="form"
                spacing={1.5}
                sx={{ mt: 2 }}
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!selectedChapter) {
                    return
                  }

                  void (async () => {
                    setPostingComment(true)
                    setCommentsError(null)
                    try {
                      const created = await addComment(selectedChapter.id, { content: commentContent })
                      setComments((prev) => [created, ...prev])
                      setCommentContent('')
                      void refreshQualityScore(storyDetails.story.id)
                    } catch (err) {
                      setCommentsError(getApiErrorMessage(err, 'Ajout du commentaire impossible.'))
                    } finally {
                      setPostingComment(false)
                    }
                  })()
                }}
              >
                <TextField
                  required
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 1000 }}
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  placeholder="Partagez votre reaction..."
                />
                <Button
                  type="submit"
                  disabled={postingComment || !selectedChapter}
                  variant="contained"
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                >
                  {postingComment ? 'Publication...' : 'Ajouter un commentaire'}
                </Button>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Connectez-vous
                pour commenter.
              </Typography>
            )}
          </>
        ) : (
          <Box sx={{ mt: 2 }}>
            <EmptyState
              title="Aucun chapitre disponible"
              description="L'auteur n'a pas encore publie de chapitre sur cette story."
            />
          </Box>
        )}
      </Paper>

      {canAddChapter && currentStatus === 'DRAFT' && hasLockedChapters && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h5">Prochain chapitre verrouille</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Vous pourrez ajouter un nouveau chapitre quand tous les chapitres precedents seront debloques.
            {lockedChapterCount > 0 ? ` Il reste ${lockedChapterCount} chapitre(s) a valider.` : ''}
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2, width: { xs: '100%', sm: 'fit-content' } }}
            onClick={() => {
              void loadStory()
            }}
          >
            Actualiser l'etat des votes
          </Button>
        </Paper>
      )}

      {canCreateNextChapter && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h5">Ajouter un chapitre</Typography>

          {chapterError && <Box sx={{ mt: 2 }}><ErrorBanner message={chapterError} compact /></Box>}
          {addingChapter && <Box sx={{ mt: 2 }}><LoadingState label="Publication du chapitre..." compact /></Box>}

          <Stack
            component="form"
            spacing={1.5}
            sx={{ mt: 2 }}
            onSubmit={(event) => {
              event.preventDefault()
              if (!storyDetails) {
                return
              }

              void (async () => {
                setAddingChapter(true)
                setChapterError(null)
                try {
                  const created = await addChapter(storyDetails.story.id, {
                    content: chapterContent,
                    isAnonymous: chapterAnonymous,
                  })

                  setStoryDetails((prev) => {
                    if (!prev) {
                      return prev
                    }
                    return {
                      ...prev,
                      chapters: [...prev.chapters, created],
                    }
                  })
                  void refreshQualityScore(storyDetails.story.id)
                  setChapterContent('')
                  setChapterAnonymous(false)
                } catch (err) {
                  setChapterError(getApiErrorMessage(err, 'Ajout du chapitre impossible.'))
                } finally {
                  setAddingChapter(false)
                }
              })()
            }}
          >
            <TextField
              required
              multiline
              rows={8}
              inputProps={{ maxLength: 10000 }}
              value={chapterContent}
              onChange={(event) => setChapterContent(event.target.value)}
              placeholder="Ecrivez le prochain chapitre..."
            />

            <FormControlLabel
              control={<Checkbox checked={chapterAnonymous} onChange={(event) => setChapterAnonymous(event.target.checked)} />}
              label="Publier anonymement ce chapitre"
            />

            <Button
              type="submit"
              disabled={addingChapter}
              variant="contained"
              sx={{ width: { xs: '100%', sm: 'fit-content' } }}
            >
              {addingChapter ? 'Publication...' : 'Ajouter le chapitre'}
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}
