import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const r = await login(username, password)
    if (r.ok) navigate(from, { replace: true })
    else setError(r.error)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-brand">
          Nutri<span className="auth-brand-accent">Scan</span>
        </Link>
        <h1>Sign in</h1>
        <p className="auth-sub">
          Welcome back. Sign in with the same username you registered — your profile and meal log load from the
          Nutri Scan API (run the backend locally).
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error ? <div className="auth-error">{error}</div> : null}
          <label>
            Username or phone
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block">
            Sign in
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  )
}
