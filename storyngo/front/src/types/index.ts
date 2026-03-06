export type StoryStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
export type UserRole = 'USER' | 'REVIEWER' | 'ADMIN'
export type AccountStatus = 'ACTIVE' | 'BANNED_TEMPORARY' | 'BANNED_PERMANENT'
export type LeaderboardPeriod = 'WEEK' | 'MONTH'

export interface StoryDTO {
  id: number
  title: string
  summary: string
  authorName: string
  authorRole?: UserRole
  authorProfileImageUrl?: string | null
  chapterCount: number
  status: StoryStatus
}

export interface ChapterDTO {
  id: number
  content: string
  orderIndex: number
  authorName: string
  voteCount: number
  threshold: number
  charLimit: number
  unlocked: boolean
}

export interface StoryDetailsDTO {
  story: StoryDTO
  chapters: ChapterDTO[]
}

export interface StoryQualityScoreDTO {
  storyId: number
  status: StoryStatus
  totalScore: number
  completenessScore: number
  statusScore: number
  engagementScore: number
  chapterCount: number
  voteCount: number
  commentCount: number
}

export interface CommentDTO {
  id: number
  content: string
  authorName: string
  createdAt: string
}

export interface VoteResultDTO {
  unlocked: boolean
}

export interface UserDTO {
  id: number
  pseudo: string
  email: string
  role: UserRole
  bio?: string | null
  profileImageUrl?: string | null
  xp?: number
  level?: number
  levelTitle?: string
  badges?: string[]
  createdAt?: string
  storyCount?: number
  chapterCount?: number
  commentCount?: number
}

export interface ReviewerDashboardDTO {
  pendingStories: StoryDTO[]
  validatedStories: StoryDTO[]
}

export interface AdminUserOverviewDTO {
  id: number
  pseudo: string
  email: string
  role: UserRole
  accountStatus: AccountStatus
  banUntil?: string | null
  banReason?: string | null
  xp: number
  level: number
  levelTitle: string
  badges: string[]
  createdAt: string
  storyCount: number
  chapterCount: number
  commentCount: number
}

export interface UpdateUserProfileRequest {
  pseudo?: string
  bio?: string
  profileImageUrl?: string
}

export interface TemporaryBanRequest {
  durationDays: number
  reason: string
}

export interface PermanentBanRequest {
  reason: string
}

export interface WeeklyLeaderboardEntryDTO {
  userId: number
  pseudo: string
  weeklyXp: number
  level: number
  levelTitle: string
}

export interface LeaderboardEntryDTO {
  userId: number
  pseudo: string
  role: UserRole
  periodXp: number
  level: number
  levelTitle: string
}

export interface PublicUserProfileDTO {
  id: number
  pseudo: string
  role: UserRole
  bio?: string | null
  profileImageUrl?: string | null
  xp: number
  level: number
  levelTitle: string
  badges: string[]
  storyCount: number
  chapterCount: number
  commentCount: number
}

export interface AuthResponse {
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  pseudo: string
  email: string
  password: string
}

export interface StoryCreateRequest {
  title: string
  summary: string
  content: string
  isAnonymous: boolean
}

export interface ChapterCreateRequest {
  content: string
  isAnonymous: boolean
}

export interface CommentCreateRequest {
  content: string
}

export interface ErrorResponse {
  error: string
}

export type ReportType = 'STORY' | 'CHAPTER' | 'COMMENT'
export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ReportCreateRequest {
  type: ReportType
  targetId: number
  reason: string
}

export interface AdminReportDTO {
  id: number
  reporterPseudo: string
  targetId: number
  type: ReportType
  reason: string
  status: ReportStatus
  priority: ReportPriority
  createdAt: string
  resolvedAt?: string | null
  resolvedByPseudo?: string | null
  resolutionNote?: string | null
}

export interface UpdateReportStatusRequest {
  status: ReportStatus
  resolutionNote?: string
}

export interface AdminAuditLogDTO {
  id: number
  adminPseudo: string
  action: string
  targetType: string
  targetId: number
  details?: string | null
  createdAt: string
}

export interface SocialFollowingDTO {
  userId: number
  pseudo: string
  role: UserRole
  profileImageUrl?: string | null
  bio?: string | null
}

export interface UserXpEventDTO {
  id: number
  action: string
  deltaXp: number
  referenceType: string
  referenceId?: number | null
  createdAt: string
}
