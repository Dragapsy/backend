import { jwtDecode } from 'jwt-decode'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNAUTHORIZED_EVENT } from '../api/apiClient'
import { getCurrentUserProfile, login, register } from '../api/storyApi'
import type { LoginRequest, RegisterRequest, UserDTO, UserRole } from '../types'

interface UserContextValue {
  user: UserDTO | null
  token: string | null
  isAuthenticated: boolean
  authError: string | null
  loginUser: (request: LoginRequest) => Promise<void>
  registerUser: (request: RegisterRequest) => Promise<void>
  logout: () => void
}

interface JwtPayload {
  sub: string
  exp?: number
}

const TOKEN_KEY = 'storyngo_token'
const USER_KEY = 'storyngo_user'

function readStoredUser(): UserDTO | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as UserDTO
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function buildUserFromToken(token: string, email?: string, pseudo?: string): UserDTO {
  const payload = jwtDecode<JwtPayload>(token)
  const localPart = email?.split('@')[0]?.trim() || 'storyngo-user'
  const nextPseudo = pseudo?.trim() || localPart
  return {
    id: Number(payload.sub),
    pseudo: nextPseudo,
    email: email ?? `${localPart}@unknown.local`,
    role: 'USER' as UserRole,
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    if (!payload.exp) {
      return false
    }
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored || isTokenExpired(stored)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return null
    }
    return stored
  })
  const [user, setUser] = useState<UserDTO | null>(() => readStoredUser())
  const [authError, setAuthError] = useState<string | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setAuthError(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile()
      localStorage.setItem(USER_KEY, JSON.stringify(profile))
      setUser(profile)
    } catch {
      logout()
    }
  }, [logout])

  useEffect(() => {
    function handleUnauthorized() {
      logout()
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [logout])

  useEffect(() => {
    if (!token) {
      return
    }

    try {
      const payload = jwtDecode<JwtPayload>(token)
      if (!payload.exp) {
        return
      }

      const delay = payload.exp * 1000 - Date.now()
      if (delay <= 0) {
        const timeoutId = window.setTimeout(() => {
          logout()
        }, 0)

        return () => {
          window.clearTimeout(timeoutId)
        }
      }

      const timeoutId = window.setTimeout(() => {
        logout()
      }, delay)

      return () => {
        window.clearTimeout(timeoutId)
      }
    } catch {
      const timeoutId = window.setTimeout(() => {
        logout()
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }
  }, [token, logout])

  useEffect(() => {
    if (!token) {
      return
    }
    void refreshProfile()
  }, [token, refreshProfile])

  const loginUser = useCallback(async (request: LoginRequest) => {
    setAuthError(null)
    const response = await login(request)
    const nextUser = buildUserFromToken(response.token, request.email)
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(response.token)
    setUser(nextUser)
    await refreshProfile()
  }, [refreshProfile])

  const registerUser = useCallback(async (request: RegisterRequest) => {
    setAuthError(null)
    const response = await register(request)
    const nextUser = buildUserFromToken(response.token, request.email, request.pseudo)
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(response.token)
    setUser(nextUser)
    await refreshProfile()
  }, [refreshProfile])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      authError,
      loginUser,
      registerUser,
      logout,
    }),
    [user, token, authError, loginUser, registerUser, logout],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
