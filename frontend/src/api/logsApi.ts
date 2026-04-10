import type { MealLog } from '../types'
import { apiBase } from './base'
import { authHeaders } from './token'

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { detail?: string }
    if (typeof j.detail === 'string') return j.detail
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

export async function apiFetchLogs(): Promise<MealLog[]> {
  const res = await fetch(`${apiBase()}/api/logs`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  const j = (await res.json()) as { logs: MealLog[] }
  return Array.isArray(j.logs) ? j.logs : []
}

export async function apiAppendLog(log: MealLog): Promise<void> {
  const res = await fetch(`${apiBase()}/api/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(log),
  })
  if (!res.ok) throw new Error(await parseError(res))
}
