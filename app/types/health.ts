/**
 * 健康データ関連の型定義
 */

/**
 * 健康記録データの基本型
 */
export interface HealthRecord {
  id?: number
  record_date: string // 記録日時 (YYYY-MM-DD HH:mm:ss)
  weight?: number // 体重 (kg)
  body_fat_percentage?: number // 体脂肪率 (%)
  systolic_pressure?: number // 収縮期血圧 (mmHg)
  diastolic_pressure?: number // 拡張期血圧 (mmHg)
  exercise_duration?: number // 運動時間 (分)
  sleep_duration?: number // 睡眠時間 (時間)
  water_intake?: number // 水分摂取量 (ml)
  calorie_intake?: number // 摂取カロリー (kcal)
  memo?: string // メモ
  created_at?: string // 作成日時
  updated_at?: string // 更新日時
}

/**
 * BMI（体格指数）の計算結果
 */
export interface BMIResult {
  bmi: number
  category: 'underweight' | 'normal' | 'overweight' | 'obese'
  categoryLabel: string
}

/**
 * 必要カロリー計算の入力データ
 */
export interface CalorieCalculationInput {
  age: number // 年齢
  gender: 'male' | 'female' // 性別
  weight: number // 体重 (kg)
  height: number // 身長 (cm)
}

/**
 * 必要カロリー計算結果
 */
export interface CalorieCalculationResult {
  bmr: number // 基礎代謝量 (kcal/日)
  sedentary: number // ほとんど運動しない (kcal/日)
  light: number // 軽い運動 (kcal/日)
  moderate: number // 中程度の運動 (kcal/日)
  active: number // 激しい運動 (kcal/日)
  veryActive: number // 非常に激しい運動 (kcal/日)
}

/**
 * 健康統計データ
 */
export interface HealthStatistics {
  averageWeight?: number
  latestWeight?: number
  weightChange?: number // 最新と最古の差
  averageBMI?: number
  latestBMI?: number
  averageBodyFat?: number
  latestBodyFat?: number
  averageSystolicPressure?: number
  averageDiastolicPressure?: number
  totalExerciseDuration?: number
  averageExerciseDuration?: number
  averageSleepDuration?: number
  averageWaterIntake?: number
  averageCalorieIntake?: number
  recordCount: number
  dateRange: {
    from: string
    to: string
  }
}

/**
 * 健康目標データ
 */
export interface HealthGoal {
  id?: number
  goal_type: 'weight' | 'body_fat' | 'exercise' | 'sleep' | 'water' | 'calorie'
  target_value: number
  current_value?: number
  start_date: string
  target_date: string
  status: 'active' | 'achieved' | 'failed' | 'cancelled'
  memo?: string
  created_at?: string
  updated_at?: string
}

