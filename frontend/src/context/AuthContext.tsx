import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { MealLog, UserProfile } from '../types'
import * as authApi from '../api/authApi'
import * as logsApi from '../api/logsApi'
import { getToken, setToken } from '../api/token'

type AuthContextValue = {
  user: UserProfile | null
  logs: MealLog[]
  authLoading: boolean
  login: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  signup: (
    profile: UserProfile,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  refreshLogs: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [logs, setLogs] = useState<MealLog[]>([])
  const [authLoading, setAuthLoading] = useState(true)

  const refreshLogs = useCallback(async () => {
    try {
      const l = await logsApi.apiFetchLogs()
      setLogs(l)
    } catch {
      setLogs([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      setAuthLoading(true)
      if (!getToken()) {
        if (!cancelled) setAuthLoading(false)
        return
      }
      try {
        const profile = await authApi.apiMe()
        if (cancelled) return
        setUser(profile)
        const l = await logsApi.apiFetchLogs()
        if (cancelled) return
        setLogs(l)
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
          setLogs([])
        }
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const r = await authApi.apiLogin(username, password)
    if (!r.ok) return r
    authApi.persistSession(r.data)
    setUser(r.data.profile)
    try {
      const l = await logsApi.apiFetchLogs()
      setLogs(l)
    } catch {
      setLogs([])
    }
    return { ok: true as const }
  }, [])

  const signup = useCallback(async (profile: UserProfile, password: string) => {
    const r = await authApi.apiSignup(profile, password)
    if (!r.ok) return r
    authApi.persistSession(r.data)
    setUser(r.data.profile)
    try {
      const l = await logsApi.apiFetchLogs()
      setLogs(l)
    } catch {
      setLogs([])
    }
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setLogs([])
    try {
      localStorage.removeItem('nutri_scan_users')
      localStorage.removeItem('nutri_scan_session')
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ user, logs, authLoading, login, signup, logout, refreshLogs }),
    [user, logs, authLoading, login, signup, logout, refreshLogs],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
