export type StoryStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'

export interface StoryDTO {
  id: number
  title: string
  summary: string
  authorName: string
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
