/**
 * 食材データの型定義
 */
export interface Ingredient {
  id?: number
  name: string
  category_id: number
  url?: string
  memo?: string
  price?: number
  expiry_date?: string // 消費期限 (YYYY-MM-DD形式)
  quantity?: number // 個数
  weight?: number // グラム数
  created_at?: string
  updated_at?: string
}

/**
 * 食材データの型定義（カテゴリ情報付き）
 */
export interface IngredientWithCategory extends Ingredient {
  category_name?: string
}

/**
 * 後方互換性のため、Food型も残す
 * @deprecated 新しいコードではIngredientを使用してください
 */
export interface Food extends Ingredient {}
export type FoodWithCategory = IngredientWithCategory
