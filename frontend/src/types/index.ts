export type WeightUnit = 'kg' | 'lbs'

export type UserProfile = {
  username: string
  age: number
  weight: number
  weightUnit: WeightUnit
  condition: string
  conditionDescription: string
}

export type MealLog = {
  id: string
  date: string
  time: string
  food_name: string
  calories: number
  protein_g: number
  carbohydrates_g: number
  fats_g: number
  fiber_g: number
}

export type NutritionScanResponse = {
  food_name: string
  portion_estimation: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  /** Present when backend includes it; otherwise omitted. */
  fiber_g?: number
}
