import { ActivityCalendar } from 'react-activity-calendar'
import type { Activity } from 'react-activity-calendar'
import 'react-activity-calendar/tooltips.css'
import './DashboardWidgets.css'

const BUFFER = 150

type Props = {
  data: Activity[]
  maintenanceKcal: number
}

const THEME = {
  light: ['#dceee0', '#e6c84a', '#43a047', '#e57373'],
  dark: ['#dceee0', '#e6c84a', '#43a047', '#e57373'],
}

export function ConsistencyHeatmap({ data, maintenanceKcal }: Props) {
  const low = maintenanceKcal - BUFFER
  const high = maintenanceKcal + BUFFER

  return (
    <div className="dash-heat">
      <div className="dash-heat__head">
        <h3>Daily consistency map</h3>
        <p className="dash-heat__sub">
          Each square is one day (last 12 months). Compared to your maintenance target of{' '}
          <strong>{maintenanceKcal} kcal</strong> with a ±{BUFFER} kcal green zone ({low}–{high} kcal).
        </p>
      </div>

      <p className="dash-heat__compact" role="note">
        <span className="dash-heat__compact-title">How to read it</span>
        <span className="dash-heat__compact-item">
          <i className="sq sq--0" aria-hidden /> Empty — no log
        </span>
        <span className="dash-heat__compact-dot" aria-hidden>
          ·
        </span>
        <span className="dash-heat__compact-item">
          <i className="sq sq--1" aria-hidden /> Yellow — under {low} kcal
        </span>
        <span className="dash-heat__compact-dot" aria-hidden>
          ·
        </span>
        <span className="dash-heat__compact-item">
          <i className="sq sq--2" aria-hidden /> Green — {low}–{high} kcal
        </span>
        <span className="dash-heat__compact-dot" aria-hidden>
          ·
        </span>
        <span className="dash-heat__compact-item">
          <i className="sq sq--3" aria-hidden /> Red — over {high} kcal
        </span>
      </p>

      <p className="dash-heat__scroll-hint">Scroll sideways on small screens to see the full year.</p>

      <div className="dash-heat__calendar">
        <ActivityCalendar
          data={data}
          maxLevel={3}
          colorScheme="light"
          theme={THEME}
          blockSize={14}
          blockMargin={4}
          fontSize={13}
          labels={{
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            totalCount: '{{count}} kcal logged in {{year}}',
            legend: { less: 'Calmer days', more: 'Heavier days' },
          }}
          showWeekdayLabels
          showColorLegend
          tooltips={{
            activity: {
              text: (a) => {
                if (a.count === 0) {
                  return `${a.date}: no meals logged`
                }
                const labels = ['', `Under band (below ${low} kcal)`, `On target (${low}–${high} kcal)`, `Over band (above ${high} kcal)`]
                return `${a.date}: ${a.count} kcal total · Goal ~${maintenanceKcal} kcal · ${labels[a.level] ?? ''}`
              },
            },
            colorLegend: {
              text: (level) => {
                const t = [
                  'No meals logged',
                  `Logged, under ${low} kcal`,
                  `On target (${low}–${high} kcal)`,
                  `Over ${high} kcal`,
                ]
                return t[level] ?? ''
              },
            },
          }}
        />
      </div>
    </div>
  )
}
