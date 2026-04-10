import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserProfile, WeightUnit } from '../types'
import './AuthPages.css'

const CONDITIONS = [
  { value: '', label: 'None' },
  { value: 'Obesity', label: 'Obesity' },
  { value: 'Diabetes', label: 'Diabetes' },
  { value: 'Hypertension', label: 'Hypertension' },
  { value: 'Other', label: 'Other' },
]

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState(25)
  const [weight, setWeight] = useState(70)
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [condition, setCondition] = useState('')
  const [conditionDescription, setConditionDescription] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const profile: UserProfile = {
      username: username.trim(),
      age: Number(age),
      weight: Number(weight),
      weightUnit,
      condition,
      conditionDescription: condition ? conditionDescription.trim() : '',
    }
    if (profile.age < 1 || profile.age > 120) {
      setError('Please enter a valid age.')
      return
    }
    if (profile.weight <= 0) {
      setError('Please enter a valid weight.')
      return
    }
    if (condition && !profile.conditionDescription) {
      setError('Please briefly describe your condition or dietary notes.')
      return
    }
    const r = await signup(profile, password)
    if (r.ok) navigate('/', { replace: true })
    else setError(r.error)
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/login" className="auth-brand">
          Nutri<span className="auth-brand-accent">Scan</span>
        </Link>
        <h1>Create account</h1>
        <p className="auth-sub">
          We use this to estimate your maintenance calories. Your account is created on the server (password stored
          securely hashed — never as plain text).
        </p>
        <form onSubmit={handleSubmit} className="auth-form auth-form--grid">
          {error ? <div className="auth-error auth-error--full">{error}</div> : null}
          <label className="span-2">
            Username or phone
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="span-2">
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label>
            Age (years)
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Weight
            <div className="weight-row">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                aria-label="Weight unit"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </label>
          <label className="span-2">
            Physical condition (optional)
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c.value || 'none'} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          {condition ? (
            <label className="span-2">
              {condition === 'Diabetes'
                ? 'Describe average blood sugar or dietary restrictions'
                : 'Briefly describe your condition'}
              <textarea
                rows={3}
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                placeholder="e.g. Type 2, aiming for low GI meals…"
              />
            </label>
          ) : null}
          <button type="submit" className="btn btn--primary btn--block span-2">
            Create account
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
