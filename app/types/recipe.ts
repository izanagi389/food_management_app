import type { Ingredient } from './ingredient'

/**
 * レシピデータの型定義
 */
export interface Recipe {
  id?: number
  name: string
  description?: string
  ingredients?: string // 従来の文字列形式（後方互換性のため残す）
  instructions?: string
  cooking_time?: number // 分単位
  servings?: number // 人数
  difficulty?: 'easy' | 'medium' | 'hard'
  created_at?: string
  updated_at?: string
  // 新しい関連付け用のフィールド
  recipe_ingredients?: RecipeIngredient[]
  // 画面表示用のステップ情報（JSON文字列instructionsの展開結果）
  instruction_steps?: RecipeInstructionStep[]
}

/**
 * レシピと食材の関連付けデータの型定義
 */
export interface RecipeIngredient {
  id?: number
  recipe_id: number
  ingredient_id: number
  quantity?: number // 使用量
  unit?: string // 単位（個、g、ml等）
  notes?: string // 備考
  created_at?: string
  updated_at?: string
  // 関連データ
  ingredient?: Ingredient
}

/**
 * レシピと食材の関連付けデータ（詳細情報付き）
 */
export interface RecipeIngredientWithDetails extends RecipeIngredient {
  ingredient_name?: string
  ingredient_category?: string
}

/**
 * レシピの手順ステップ
 * instructions TEXT にJSONとして保存される想定
 */
export interface RecipeInstructionStep {
  order: number
  title?: string
  description: string
  durationMinutes?: number
  note?: string
}
