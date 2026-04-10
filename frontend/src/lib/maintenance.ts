import type { UserProfile } from '../types'

export function weightToKg(weight: number, unit: 'kg' | 'lbs'): number {
  return unit === 'kg' ? weight : weight * 0.45359237
}

/** Estimated daily maintenance (kcal) from age, weight, optional condition. Assumes 170 cm height, light activity. */
export function maintenanceCalories(profile: UserProfile): number {
  const wKg = weightToKg(profile.weight, profile.weightUnit)
  const heightCm = 170
  const age = profile.age
  const bmr = 10 * wKg + 6.25 * heightCm - 5 * age + 5
  let tdee = bmr * 1.4
  const cond = (profile.condition || '').toLowerCase()
  if (cond.includes('obesity')) tdee *= 0.92
  if (cond.includes('diabetes')) tdee *= 0.98
  return Math.max(1200, Math.round(tdee))
}
