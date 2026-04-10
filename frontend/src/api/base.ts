/** Dev: same-origin /api via Vite proxy. Prod: VITE_API_URL or localhost:8000. */
export function apiBase(): string {
  if (import.meta.env.DEV) {
    return ''
  }
  const env = import.meta.env.VITE_API_URL
  if (typeof env === 'string' && env.trim() !== '') {
    return env.replace(/\/$/, '')
  }
  return 'http://127.0.0.1:8000'
}
