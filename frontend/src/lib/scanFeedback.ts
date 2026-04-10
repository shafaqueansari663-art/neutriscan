import type { UserProfile } from '../types'
import { maintenanceCalories } from './maintenance'

const BUFFER = 150

export type ScanCoachVariant = 'success' | 'caution' | 'warn'

export type ScanCoachMessage = {
  variant: ScanCoachVariant
  headline: string
  body: string
}

function coachCopy(
  roundedToday: number,
  roundedMeal: number,
  goal: number,
  low: number,
  high: number,
  preview: boolean,
): Pick<ScanCoachMessage, 'variant' | 'headline' | 'body'> {
  const pctMeal = goal > 0 ? Math.round((roundedMeal / goal) * 100) : 0

  const open = preview
    ? 'If you log this meal, your day would be about '
    : "You're at about "

  let variant: ScanCoachVariant
  let headline: string
  let body: string

  if (roundedToday > high) {
    variant = 'warn'
    headline = preview
      ? 'Logging this would put you above your daily range'
      : "You're above today's estimated range"
    body = preview
      ? `${open}${roundedToday} kcal — past the flexible upper band (~${high} kcal) for your ~${goal} kcal goal. You can still log it; balance later with lighter choices if you want.`
      : `Today you're at about ${roundedToday} kcal, past the flexible upper band (~${high} kcal) for your ~${goal} kcal maintenance goal. One heavier day is normal—balance with lighter meals or activity when you can. You've got this.`
  } else if (roundedToday < low) {
    variant = 'caution'
    headline = preview
      ? "Logging this—you'd still be under today's target"
      : 'Still room to hit your daily fuel target'
    body = preview
      ? `If you log this, you'd be at about ${roundedToday} kcal today — still under your on-track band (${low}–${high} kcal around ${goal} kcal). Good time to fuel up if you're eating this.`
      : `You're at about ${roundedToday} kcal today toward ~${goal} kcal (${low}–${high} kcal is your “on track” band). If you're still hungry, add protein-rich snacks or another meal—fueling well supports energy and focus.`
  } else {
    variant = 'success'
    headline = preview
      ? 'Logging this keeps you in a solid range'
      : "You're in a solid range for today"
    body = preview
      ? `If you log this, your day would land around ${roundedToday} kcal — right near your ~${goal} kcal goal (±${BUFFER} kcal). Nice match if you eat this.`
      : `About ${roundedToday} kcal logged today lines up with your ~${goal} kcal goal (±${BUFFER} kcal). Keep balancing meals the way that feels right for you.`
  }

  if (pctMeal >= 45) {
    variant = variant === 'success' ? 'caution' : variant
    body += ` This item is roughly ${pctMeal}% of a full day by itself—worth noting if you're stacking other big meals.`
  } else if (pctMeal > 0 && pctMeal <= 8 && roundedMeal < 150 && roundedToday < low + 200) {
    body += ` This item is quite light (${roundedMeal} kcal)—fine as a snack; just make sure the rest of the day covers your needs.`
  }

  if (variant === 'warn' && roundedToday > high + 400) {
    headline = preview
      ? 'Logging this would push you well past your maintenance band'
      : "Today's intake is well above your maintenance band"
    body = preview
      ? `That would land near ${roundedToday} kcal — well over the +${BUFFER} kcal cushion around ${goal} kcal. Your choice—no judgment. Hydrate and listen to your body.`
      : `At ~${roundedToday} kcal you're significantly over the +${BUFFER} kcal cushion around ${goal} kcal. No guilt—use it as info: hydrate, prioritize sleep, and tomorrow you can lean on satisfying, nutrient-dense choices.`
  }

  return { variant, headline, body }
}

/** Feedback: todayTotalKcal should include this meal for logged mode; for preview pass todayBefore + thisMeal. */
export function getScanCalorieCoach(
  profile: UserProfile,
  todayTotalKcal: number,
  thisMealKcal: number,
  options?: { preview?: boolean },
): ScanCoachMessage {
  const preview = options?.preview ?? false
  const goal = maintenanceCalories(profile)
  const low = goal - BUFFER
  const high = goal + BUFFER
  const roundedToday = Math.round(todayTotalKcal)
  const roundedMeal = Math.round(thisMealKcal)
  return {
    ...coachCopy(roundedToday, roundedMeal, goal, low, high, preview),
  }
}
