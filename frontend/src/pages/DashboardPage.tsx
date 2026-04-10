import { format } from 'date-fns'
import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { maintenanceCalories } from '../lib/maintenance'
import { buildHeatmapActivities } from '../lib/heatmap'
import { downloadMonthlyReport } from '../lib/monthlyReport'
import { CalorieProgress } from '../components/dashboard/CalorieProgress'
import { MacroPieCharts } from '../components/dashboard/MacroPieCharts'
import { ConsistencyHeatmap } from '../components/dashboard/ConsistencyHeatmap'
import './DashboardPage.css'

export function DashboardPage() {
  const { user, logs } = useAuth()
  const [reportError, setReportError] = useState<string | null>(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  const handleMonthlyReport = useCallback(() => {
    if (!user) return
    setReportError(null)
    try {
      downloadMonthlyReport(logs, user, new Date())
    } catch {
      setReportError('Could not build the report. Try again.')
    }
  }, [logs, user])

  if (!user) return null
  const maintenance = maintenanceCalories(user)
  const todayLogs = logs.filter((l) => l.date === today)
  const consumedToday = todayLogs.reduce((s, l) => s + l.calories, 0)
  const macrosToday = todayLogs.reduce(
    (acc, l) => ({
      p: acc.p + l.protein_g,
      c: acc.c + l.carbohydrates_g,
      f: acc.f + l.fats_g,
    }),
    { p: 0, c: 0, f: 0 },
  )
  const heatmapData = buildHeatmapActivities(logs, maintenance)
  const conditionLine =
    user.condition && user.conditionDescription
      ? `${user.condition}: ${user.conditionDescription}`
      : user.condition || ''

  return (
    <div className="dashboard">
      <header className="dashboard__hero">
        <div className="dashboard__identity">
          <div className="dashboard__avatar" aria-hidden>
            {user.username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="dashboard__handle">{user.username}</h1>
            <p className="dashboard__meta">
              Age {user.age} · {user.weight} {user.weightUnit}
              {conditionLine ? ` · ${conditionLine}` : ''}
            </p>
          </div>
        </div>
        <div className="dashboard__stats">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Maintenance</span>
            <span className="dashboard__stat-value">{maintenance}</span>
            <span className="dashboard__stat-unit">kcal/day</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Meals logged</span>
            <span className="dashboard__stat-value">{logs.length}</span>
            <span className="dashboard__stat-unit">total</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Today</span>
            <span className="dashboard__stat-value">{Math.round(consumedToday)}</span>
            <span className="dashboard__stat-unit">kcal</span>
          </div>
        </div>
        <div className="dashboard__report-wrap">
          <button
            type="button"
            className="btn btn--secondary dashboard__report"
            onClick={handleMonthlyReport}
            title="Downloads a CSV of this month’s logged meals (opens in Excel or Sheets)"
          >
            Download monthly report
          </button>
          {reportError ? <p className="dashboard__report-err">{reportError}</p> : null}
        </div>
      </header>

      <section className="dashboard__grid">
        <article className="dashboard__card">
          <h2>Daily calories</h2>
          <CalorieProgress consumed={consumedToday} maintenance={maintenance} />
        </article>
        <article className="dashboard__card">
          <h2>Macronutrients</h2>
          <MacroPieCharts proteinG={macrosToday.p} carbsG={macrosToday.c} fatsG={macrosToday.f} />
        </article>
      </section>

      <section className="dashboard__card dashboard__card--full">
        <ConsistencyHeatmap data={heatmapData} maintenanceKcal={maintenance} />
      </section>
    </div>
  )
}
