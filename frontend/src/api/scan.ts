import type { NutritionScanResponse } from '../types'
import { apiBase } from './base'

export async function scanFoodImage(file: File): Promise<NutritionScanResponse> {
  const base = apiBase()
  const url = `${base}/api/scan`
  const fd = new FormData()
  fd.append('file', file)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      body: fd,
    })
  } catch (e) {
    const hint =
      import.meta.env.DEV
        ? ' Start the API: cd backend && .\\.venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000'
        : ''
    throw new Error(
      e instanceof Error
        ? `${e.message}.${hint}`
        : `Network error.${hint}`,
    )
  }
  if (!res.ok) {
    let detail = res.statusText
    try {
      const j = (await res.json()) as { detail?: string | unknown }
      if (typeof j.detail === 'string') detail = j.detail
    } catch {
      /* ignore */
    }
    throw new Error(detail || 'Scan failed')
  }
  return res.json() as Promise<NutritionScanResponse>
}
