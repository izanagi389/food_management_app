/**
 * 個人プロファイル関連の型定義
 */

/**
 * 個人プロファイルデータ
 */
export interface UserProfile {
  id?: number
  name?: string // 名前
  age: number // 年齢
  gender: 'male' | 'female' // 性別
  height: number // 身長 (cm)
  weight: number // 現在の体重 (kg)
  target_weight?: number // 目標体重 (kg)
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' // 活動レベル
  created_at?: string // 作成日時
  updated_at?: string // 更新日時
}

/**
 * 活動レベルのラベルマップ
 */
export const ACTIVITY_LEVEL_LABELS = {
  sedentary: 'ほとんど運動しない',
  light: '軽い運動（週1-3日）',
  moderate: '中程度の運動（週3-5日）',
  active: '激しい運動（週6-7日）',
  very_active: '非常に激しい運動（1日2回以上）'
} as const

/**
 * 活動レベルの係数
 */
export const ACTIVITY_LEVEL_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
} as const

