/**
 * 型定義のインデックスファイル
 * 各機能別の型定義を統合してエクスポート
 */

// データベース関連の型定義
export type {
  DatabaseResult,
  StorageResult,
  PlatformInfo
} from './database'

// 食材関連の型定義
export type {
  Ingredient,
  IngredientWithCategory,
  Food,
  FoodWithCategory
} from './ingredient'

// カテゴリ関連の型定義
export type {
  Category
} from './category'

// レシピ関連の型定義
export type {
  Recipe,
  RecipeIngredient,
  RecipeIngredientWithDetails,
  RecipeInstructionStep
} from './recipe'

// 健康管理関連の型定義
export type {
  HealthRecord,
  BMIResult,
  HealthStatistics,
  HealthGoal,
  CalorieCalculationInput,
  CalorieCalculationResult
} from './health'

// プロファイル関連の型定義
export type {
  UserProfile
} from './profile'

export {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_MULTIPLIERS
} from './profile'

// 共通型定義
export type {
  AppRoute
} from './common'

// バリデーション関連の型定義
export type {
  ValidationResult,
  ValidationError
} from './validation'

export {
  VALIDATION_ERRORS
} from './validation'
