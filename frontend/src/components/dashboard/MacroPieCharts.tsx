import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import './DashboardWidgets.css'

type Props = {
  proteinG: number
  carbsG: number
  fatsG: number
}

const COLORS = ['#1565c0', '#2e7d32', '#7cb342']

export function MacroPieCharts({ proteinG, carbsG, fatsG }: Props) {
  const pCal = proteinG * 4
  const cCal = carbsG * 4
  const fCal = fatsG * 9
  const total = pCal + cCal + fCal
  const data = [
    { name: 'Protein', value: pCal },
    { name: 'Carbs', value: cCal },
    { name: 'Fats', value: fCal },
  ].filter((d) => d.value > 0)

  if (total <= 0) {
    return (
      <div className="dash-pie dash-pie--empty">
        <p>No macros logged today yet.</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    pct: Math.round((d.value / total) * 100),
  }))

  return (
    <div className="dash-pie">
      <h3 className="dash-pie__title">Today · kcal from macros</h3>
      <div className="dash-pie__chart">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${Math.round(Number(value ?? 0))} kcal`,
                '',
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="dash-pie__legend">
        {chartData.map((d, i) => (
          <li key={d.name}>
            <span className="dash-pie__swatch" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name} <strong>{d.pct}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
