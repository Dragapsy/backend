import { apiClient, publicApiClient } from './apiClient'
import type {
  AdminAuditLogDTO,
  AdminReportDTO,
  AdminUserOverviewDTO,
  ChapterCreateRequest,
  AuthResponse,
  ChapterDTO,
  CommentCreateRequest,
  CommentDTO,
  LoginRequest,
  PermanentBanRequest,
  PublicUserProfileDTO,
  ReviewerDashboardDTO,
  RegisterRequest,
  ReportCreateRequest,
  ReportStatus,
  StoryCreateRequest,
  StoryDTO,
  StoryDetailsDTO,
  StoryQualityScoreDTO,
  SocialFollowingDTO,
  TemporaryBanRequest,
  UpdateReportStatusRequest,
  UpdateUserProfileRequest,
  UserDTO,
  UserXpEventDTO,
  VoteResultDTO,
  LeaderboardEntryDTO,
  LeaderboardPeriod,
  WeeklyLeaderboardEntryDTO,
} from '../types'

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', request)
  return response.data
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', request)
  return response.data
}

export async function getCurrentUserProfile(): Promise<UserDTO> {
  const response = await apiClient.get<UserDTO>('/users/me')
  return response.data
}

export async function updateCurrentUserProfile(request: UpdateUserProfileRequest): Promise<UserDTO> {
  const response = await apiClient.patch<UserDTO>('/users/me', request)
  return response.data
}

export async function getReviewerDashboard(): Promise<ReviewerDashboardDTO> {
  const response = await apiClient.get<ReviewerDashboardDTO>('/reviewer/dashboard')
  return response.data
}

export async function getAdminUsers(): Promise<AdminUserOverviewDTO[]> {
  const response = await apiClient.get<AdminUserOverviewDTO[]>('/admin/users')
  return response.data
}

export async function banUserTemporarily(userId: number, request: TemporaryBanRequest): Promise<AdminUserOverviewDTO> {
  const response = await apiClient.post<AdminUserOverviewDTO>(`/admin/users/${userId}/ban-temporary`, request)
  return response.data
}

export async function banUserPermanently(userId: number, request: PermanentBanRequest): Promise<AdminUserOverviewDTO> {
  const response = await apiClient.post<AdminUserOverviewDTO>(`/admin/users/${userId}/ban-permanent`, request)
  return response.data
}

export async function unbanUser(userId: number): Promise<AdminUserOverviewDTO> {
  const response = await apiClient.post<AdminUserOverviewDTO>(`/admin/users/${userId}/unban`)
  return response.data
}

export async function getWeeklyLeaderboard(limit = 10): Promise<WeeklyLeaderboardEntryDTO[]> {
  const response = await apiClient.get<WeeklyLeaderboardEntryDTO[]>(`/gamification/leaderboard/weekly?limit=${limit}`)
  return response.data
}

export async function getLeaderboard(period: LeaderboardPeriod, limit = 50): Promise<LeaderboardEntryDTO[]> {
  const response = await apiClient.get<LeaderboardEntryDTO[]>(`/gamification/leaderboard?period=${period}&limit=${limit}`)
  return response.data
}

export async function getPublicUserProfile(userId: number): Promise<PublicUserProfileDTO> {
  const response = await apiClient.get<PublicUserProfileDTO>(`/users/${userId}/public`)
  return response.data
}

export async function getXpHistory(limit = 30): Promise<UserXpEventDTO[]> {
  const response = await apiClient.get<UserXpEventDTO[]>(`/gamification/xp-history?limit=${limit}`)
  return response.data
}

export async function followUser(userId: number): Promise<void> {
  await apiClient.post(`/social/follow/${userId}`)
}

export async function unfollowUser(userId: number): Promise<void> {
  await apiClient.delete(`/social/follow/${userId}`)
}

export async function getFollowing(): Promise<SocialFollowingDTO[]> {
  const response = await apiClient.get<SocialFollowingDTO[]>('/social/following')
  return response.data
}

export async function getPersonalizedFeed(limit = 20): Promise<StoryDTO[]> {
  const response = await apiClient.get<StoryDTO[]>(`/social/feed?limit=${limit}`)
  return response.data
}

export async function createReport(request: ReportCreateRequest): Promise<AdminReportDTO> {
  const response = await apiClient.post<AdminReportDTO>('/reports', request)
  return response.data
}

export async function getOpenReports(): Promise<AdminReportDTO[]> {
  const response = await apiClient.get<AdminReportDTO[]>('/admin/reports/open')
  return response.data
}

export async function getAllReports(): Promise<AdminReportDTO[]> {
  const response = await apiClient.get<AdminReportDTO[]>('/admin/reports')
  return response.data
}

export async function updateReportStatus(reportId: number, request: UpdateReportStatusRequest): Promise<AdminReportDTO> {
  const response = await apiClient.patch<AdminReportDTO>(`/admin/reports/${reportId}`, request)
  return response.data
}

export async function quickUpdateReportStatus(reportId: number, status: ReportStatus, resolutionNote?: string): Promise<AdminReportDTO> {
  return updateReportStatus(reportId, { status, resolutionNote })
}

export async function getAdminAuditLogs(): Promise<AdminAuditLogDTO[]> {
  const response = await apiClient.get<AdminAuditLogDTO[]>('/admin/audit-logs')
  return response.data
}

export async function getStories(): Promise<StoryDTO[]> {
  const response = await publicApiClient.get<StoryDTO[]>('/stories')
  return response.data
}

export async function getTrendingStories(): Promise<StoryDTO[]> {
  const response = await publicApiClient.get<StoryDTO[]>('/stories/trending')
  return response.data
}

export async function getUpcomingChapters(): Promise<ChapterDTO[]> {
  const response = await publicApiClient.get<ChapterDTO[]>('/stories/upcoming')
  return response.data
}

export async function getStoryDetails(storyId: number): Promise<StoryDetailsDTO> {
  const response = await publicApiClient.get<StoryDetailsDTO>(`/stories/${storyId}`)
  return response.data
}

export async function getStoryQualityScore(storyId: number): Promise<StoryQualityScoreDTO> {
  const response = await publicApiClient.get<StoryQualityScoreDTO>(`/stories/${storyId}/quality-score`)
  return response.data
}

export async function createStory(request: StoryCreateRequest): Promise<StoryDetailsDTO> {
  const response = await apiClient.post<StoryDetailsDTO>('/stories', request)
  return response.data
}

export async function addChapter(storyId: number, request: ChapterCreateRequest): Promise<ChapterDTO> {
  const response = await apiClient.post<ChapterDTO>(`/stories/${storyId}/chapters`, request)
  return response.data
}

export async function getComments(chapterId: number): Promise<CommentDTO[]> {
  const response = await publicApiClient.get<CommentDTO[]>(`/chapters/${chapterId}/comments`)
  return response.data
}

export async function addComment(chapterId: number, request: CommentCreateRequest): Promise<CommentDTO> {
  const response = await apiClient.post<CommentDTO>(`/chapters/${chapterId}/comments`, request)
  return response.data
}

export async function voteChapter(chapterId: number): Promise<VoteResultDTO> {
  const response = await apiClient.post<VoteResultDTO>(`/chapters/${chapterId}/vote`)
  return response.data
}

export async function submitStoryForReview(storyId: number): Promise<StoryDTO> {
  const response = await apiClient.post<StoryDTO>(`/stories/${storyId}/submit-review`)
  return response.data
}

export async function approveStoryReview(storyId: number): Promise<StoryDTO> {
  const response = await apiClient.post<StoryDTO>(`/stories/${storyId}/approve-review`)
  return response.data
}

export async function rejectStoryReview(storyId: number): Promise<StoryDTO> {
  const response = await apiClient.post<StoryDTO>(`/stories/${storyId}/reject-review`)
  return response.data
}

export async function archiveStory(storyId: number): Promise<StoryDTO> {
  const response = await apiClient.post<StoryDTO>(`/stories/${storyId}/archive`)
  return response.data
}

export async function getMyStories(): Promise<StoryDTO[]> {
  const response = await apiClient.get<StoryDTO[]>('/stories/me')
  return response.data
}
export async function likeStory(storyId: number): Promise<void> {
  await apiClient.post(`/stories/${storyId}/like`)
}

export async function unlikeStory(storyId: number): Promise<void> {
  await apiClient.delete(`/stories/${storyId}/like`)
}

export async function getStoryLikes(storyId: number): Promise<{ likeCount: number; likedByMe: boolean }> {
  const client = localStorage.getItem('storyngo_token') ? apiClient : publicApiClient
  const response = await client.get<{ likeCount: number; likedByMe: boolean }>(`/stories/${storyId}/likes`)
  return response.data
}

export async function bookmarkStory(storyId: number): Promise<void> {
  await apiClient.post(`/stories/${storyId}/bookmark`)
}

export async function unbookmarkStory(storyId: number): Promise<void> {
  await apiClient.delete(`/stories/${storyId}/bookmark`)
}

export async function getMyBookmarks(): Promise<StoryDTO[]> {
  const response = await apiClient.get<StoryDTO[]>('/me/bookmarks')
  return response.data
}
