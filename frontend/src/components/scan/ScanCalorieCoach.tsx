import { format } from 'date-fns'
import type { UserProfile } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { getScanCalorieCoach } from '../../lib/scanFeedback'
import './ScanCalorieCoach.css'

type Props = {
  user: UserProfile
  mealCalories: number
  /** false = meal not saved yet; coach uses today-so-far + this meal as a preview */
  committed: boolean
}

export function ScanCalorieCoach({ user, mealCalories, committed }: Props) {
  const { logs } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayFromStorage = logs.filter((l) => l.date === today).reduce((s, l) => s + l.calories, 0)
  const effectiveTotal = committed ? todayFromStorage : todayFromStorage + mealCalories

  const coach = getScanCalorieCoach(user, effectiveTotal, mealCalories, {
    preview: !committed,
  })

  return (
    <aside className={`scan-coach scan-coach--${coach.variant}`} role="status" aria-live="polite">
      <div className="scan-coach__icon" aria-hidden>
        {coach.variant === 'success' ? '✓' : coach.variant === 'warn' ? '!' : 'i'}
      </div>
      <div className="scan-coach__text">
        {!committed ? (
          <p className="scan-coach__preview-label">Preview — not saved to your log yet</p>
        ) : null}
        <h4 className="scan-coach__headline">{coach.headline}</h4>
        <p className="scan-coach__body">{coach.body}</p>
      </div>
    </aside>
  )
}
