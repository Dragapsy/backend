import axios from 'axios'

export const UNAUTHORIZED_EVENT = 'storyngo:unauthorized'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('storyngo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = typeof error?.config?.url === 'string' ? error.config.url : ''

    if (
      error?.response?.status === 401
      && localStorage.getItem('storyngo_token')
      && requestUrl.includes('/users/me')
    ) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    if (typeof data?.error === 'string' && data.error.trim().length > 0) {
      return data.error
    }
  }
  return fallback
}
