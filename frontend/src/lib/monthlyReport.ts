import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns'
import type { MealLog, UserProfile } from '../types'
import { maintenanceCalories } from './maintenance'

function csvEscape(field: string): string {
  let s = field
  if (s.includes('"')) s = s.replace(/"/g, '""')
  if (/[",\n\r]/.test(s)) return `"${s}"`
  return s
}

/** CSV with a short summary block plus one row per meal in the calendar month. */
export function buildMonthlyMealExportCsv(
  logs: MealLog[],
  user: UserProfile,
  refDate: Date = new Date(),
): string {
  const start = startOfMonth(refDate)
  const end = endOfMonth(refDate)
  const monthLogs = logs
    .filter((l) => {
      const d = parseISO(l.date)
      return !Number.isNaN(d.getTime()) && isWithinInterval(d, { start, end })
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const monthLabel = format(refDate, 'MMMM yyyy')
  const maintenance = maintenanceCalories(user)

  const rows: string[][] = [
    ['Report type', 'Nutri Scan monthly meal log'],
    ['Month', monthLabel],
    ['User', user.username],
    ['Maintenance kcal/day', String(maintenance)],
    ['Meals in month', String(monthLogs.length)],
    [],
    ['date', 'time', 'food_name', 'calories', 'protein_g', 'carbohydrates_g', 'fats_g', 'fiber_g'],
  ]

  for (const l of monthLogs) {
    rows.push([
      l.date,
      l.time,
      l.food_name,
      String(l.calories),
      String(l.protein_g),
      String(l.carbohydrates_g),
      String(l.fats_g),
      String(l.fiber_g),
    ])
  }

  return rows.map((row) => row.map((cell) => csvEscape(cell)).join(',')).join('\n')
}

export function downloadMonthlyReport(logs: MealLog[], user: UserProfile, refDate?: Date): void {
  const ref = refDate ?? new Date()
  const csv = buildMonthlyMealExportCsv(logs, user, ref)
  const safeUser = user.username.replace(/[^\w\-]+/g, '_').slice(0, 40)
  const filename = `nutri-scan-${safeUser}-${format(ref, 'yyyy-MM')}.csv`
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
