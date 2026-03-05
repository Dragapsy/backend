import { apiClient } from './apiClient'
import type {
  ChapterCreateRequest,
  AuthResponse,
  ChapterDTO,
  CommentCreateRequest,
  CommentDTO,
  LoginRequest,
  RegisterRequest,
  StoryCreateRequest,
  StoryDTO,
  StoryDetailsDTO,
  VoteResultDTO,
} from '../types'

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', request)
  return response.data
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', request)
  return response.data
}

export async function getStories(): Promise<StoryDTO[]> {
  const response = await apiClient.get<StoryDTO[]>('/stories')
  return response.data
}

export async function getTrendingStories(): Promise<StoryDTO[]> {
  const response = await apiClient.get<StoryDTO[]>('/stories/trending')
  return response.data
}

export async function getUpcomingChapters(): Promise<ChapterDTO[]> {
  const response = await apiClient.get<ChapterDTO[]>('/stories/upcoming')
  return response.data
}

export async function getStoryDetails(storyId: number): Promise<StoryDetailsDTO> {
  const response = await apiClient.get<StoryDetailsDTO>(`/stories/${storyId}`)
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
  const response = await apiClient.get<CommentDTO[]>(`/chapters/${chapterId}/comments`)
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
