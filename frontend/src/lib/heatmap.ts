import { format, subDays } from 'date-fns'
import type { Activity } from 'react-activity-calendar'
import type { MealLog } from '../types'

const BUFFER = 150

/** One year of cells: level 0 empty, 1 under, 2 on target, 3 over (vs maintenance ± buffer). */
export function buildHeatmapActivities(logs: MealLog[], maintenance: number): Activity[] {
  const byDate = new Map<string, number>()
  for (const log of logs) {
    byDate.set(log.date, (byDate.get(log.date) || 0) + log.calories)
  }
  const today = new Date()
  const out: Activity[] = []
  for (let i = 364; i >= 0; i--) {
    const d = subDays(today, i)
    const dateStr = format(d, 'yyyy-MM-dd')
    const cals = byDate.get(dateStr) || 0
    let level = 0
    let count = 0
    if (cals > 0) {
      count = Math.round(cals)
      if (cals < maintenance - BUFFER) level = 1
      else if (cals <= maintenance + BUFFER) level = 2
      else level = 3
    }
    out.push({ date: dateStr, count, level })
  }
  return out
}
