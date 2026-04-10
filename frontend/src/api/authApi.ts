import type { UserProfile } from '../types'
import { apiBase } from './base'
import { authHeaders, getToken, setToken } from './token'

type TokenResponse = {
  access_token: string
  token_type: string
  profile: UserProfile
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { detail?: string | string[] }
    if (typeof j.detail === 'string') return j.detail
    if (Array.isArray(j.detail)) return j.detail.map((x) => String(x)).join(', ')
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

export async function apiSignup(
  profile: UserProfile,
  password: string,
): Promise<{ ok: true; data: TokenResponse } | { ok: false; error: string }> {
  const res = await fetch(`${apiBase()}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: profile.username.trim(),
      password,
      age: profile.age,
      weight: profile.weight,
      weightUnit: profile.weightUnit,
      condition: profile.condition || '',
      conditionDescription: profile.conditionDescription || '',
    }),
  })
  if (!res.ok) return { ok: false, error: await parseError(res) }
  const data = (await res.json()) as TokenResponse
  return { ok: true, data }
}

export async function apiLogin(
  username: string,
  password: string,
): Promise<{ ok: true; data: TokenResponse } | { ok: false; error: string }> {
  const res = await fetch(`${apiBase()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })
  if (!res.ok) return { ok: false, error: await parseError(res) }
  const data = (await res.json()) as TokenResponse
  return { ok: true, data }
}

export async function apiMe(): Promise<UserProfile> {
  if (!getToken()) throw new Error('No token')
  const res = await fetch(`${apiBase()}/api/auth/me`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<UserProfile>
}

export function persistSession(data: TokenResponse): void {
  setToken(data.access_token)
}
