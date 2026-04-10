import './DashboardWidgets.css'

type Props = {
  consumed: number
  maintenance: number
}

export function CalorieProgress({ consumed, maintenance }: Props) {
  const pct = maintenance > 0 ? Math.min(100, (consumed / maintenance) * 100) : 0
  const over = consumed > maintenance + 150
  const ringColor = over ? '#c62828' : pct >= 85 ? '#f57f17' : '#2e7d32'

  return (
    <div className="dash-cal">
      <div
        className="dash-cal__ring"
        style={
          {
            '--pct': `${pct}`,
            '--ring': ringColor,
          } as React.CSSProperties
        }
      >
        <div className="dash-cal__inner">
          <span className="dash-cal__value">{Math.round(consumed)}</span>
          <span className="dash-cal__label">kcal today</span>
        </div>
      </div>
      <div className="dash-cal__meta">
        <p>
          Goal <strong>{maintenance}</strong> kcal
          <span className="dash-cal__buffer"> (±150 kcal band)</span>
        </p>
        <p className="dash-cal__hint">
          {consumed === 0
            ? 'Log a meal from Scan to see progress.'
            : over
              ? 'Above your green zone today.'
              : consumed < maintenance - 150
                ? 'Below maintenance — adjust if intentional.'
                : 'Within your maintenance band.'}
        </p>
      </div>
    </div>
  )
}
