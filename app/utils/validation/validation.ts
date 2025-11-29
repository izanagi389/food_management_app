import type { Food, Category, Recipe, Ingredient, RecipeIngredient, UserProfile } from '~/types'
import type { ValidationResult } from '~/types/validation'
import { VALIDATION_ERRORS } from '~/types/validation'
import { CapacitorSQLite } from '@capacitor-community/sqlite'

// バリデーションエラー定数を再エクスポート
export { VALIDATION_ERRORS }

/**
 * データバリデーションクラス
 * 各データタイプのバリデーション機能を提供
 */
export class DataValidator {
  private databaseName: string
  private isWebPlatform: boolean

  constructor(databaseName: string, isWebPlatform: boolean) {
    this.databaseName = databaseName
    this.isWebPlatform = isWebPlatform
  }

  /**
   * 文字列のバリデーション
   * @param value バリデーションする値
   * @param fieldName フィールド名
   * @param required 必須かどうか
   * @param maxLength 最大文字数
   * @returns バリデーション結果
   */
  validateString(value: any, fieldName: string, required: boolean = false, maxLength: number = 255): ValidationResult {
    const errors: string[] = []
    
    if (required && (!value || typeof value !== 'string' || value.trim().length === 0)) {
      errors.push(`${fieldName}: ${VALIDATION_ERRORS.REQUIRED}`)
      return { isValid: false, errors }
    }
    
    if (value !== null && value !== undefined) {
      if (typeof value !== 'string') {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.INVALID_STRING}`)
      } else if (value.length > maxLength) {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.STRING_TOO_LONG} (最大${maxLength}文字)`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 数値のバリデーション
   * @param value バリデーションする値
   * @param fieldName フィールド名
   * @param required 必須かどうか
   * @param allowNegative 負の値を許可するか
   * @returns バリデーション結果
   */
  validateNumber(value: any, fieldName: string, required: boolean = false, allowNegative: boolean = false): ValidationResult {
    const errors: string[] = []
    
    if (required && (value === null || value === undefined)) {
      errors.push(`${fieldName}: ${VALIDATION_ERRORS.REQUIRED}`)
      return { isValid: false, errors }
    }
    
    if (value !== null && value !== undefined) {
      const numValue = Number(value)
      if (isNaN(numValue)) {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.INVALID_NUMBER}`)
      } else if (!allowNegative && numValue < 0) {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.NEGATIVE_NUMBER}`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * URLのバリデーション
   * @param value バリデーションする値
   * @param fieldName フィールド名
   * @returns バリデーション結果
   */
  validateUrl(value: any, fieldName: string): ValidationResult {
    const errors: string[] = []
    
    if (value && typeof value === 'string' && value.trim().length > 0) {
      try {
        new URL(value)
      } catch {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.INVALID_URL}`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 日付のバリデーション
   * @param value バリデーションする値
   * @param fieldName フィールド名
   * @returns バリデーション結果
   */
  validateDate(value: any, fieldName: string): ValidationResult {
    const errors: string[] = []
    
    if (value && typeof value === 'string' && value.trim().length > 0) {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.INVALID_DATE}`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 難易度のバリデーション
   */
  validateDifficulty(value: any, fieldName: string): ValidationResult {
    const errors: string[] = []
    
    if (value && typeof value === 'string' && value.trim().length > 0) {
      const validDifficulties = ['easy', 'medium', 'hard']
      if (!validDifficulties.includes(value)) {
        errors.push(`${fieldName}: ${VALIDATION_ERRORS.INVALID_DIFFICULTY}`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * カテゴリIDのバリデーション
   */
  async validateCategoryId(categoryId: any, fieldName: string, required: boolean = false): Promise<ValidationResult> {
    const errors: string[] = []
    
    if (required && (!categoryId || typeof categoryId !== 'number' || categoryId <= 0)) {
      errors.push(`${fieldName}: ${VALIDATION_ERRORS.REQUIRED}`)
      return { isValid: false, errors }
    }
    
    if (categoryId && typeof categoryId === 'number' && categoryId > 0) {
      // カテゴリが存在するかチェック
      if (!this.isWebPlatform) {
        try {
          const response = await CapacitorSQLite.query({
            database: this.databaseName,
            statement: 'SELECT id FROM categories WHERE id = ?',
            values: [categoryId]
          })
          
          if (!response?.values || response.values.length === 0) {
            errors.push(`${fieldName}: ${VALIDATION_ERRORS.INVALID_CATEGORY_ID}`)
          }
        } catch (error) {
          errors.push(`${fieldName}: カテゴリの存在確認でエラーが発生しました`)
        }
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 食材データのバリデーション
   * @param ingredient バリデーションする食材データ
   * @returns バリデーション結果
   */
  async validateIngredient(ingredient: Food): Promise<ValidationResult> {
    const errors: string[] = []
    
    // 必須項目のバリデーション
    const nameValidation = this.validateString(ingredient.name, '食材名', true, 100)
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors)
    }
    
    const categoryValidation = await this.validateCategoryId(ingredient.category_id, 'カテゴリID', true)
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors)
    }
    
    // 任意項目のバリデーション
    const urlValidation = this.validateUrl(ingredient.url, 'URL')
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors)
    }
    
    const memoValidation = this.validateString(ingredient.memo, 'メモ', false, 500)
    if (!memoValidation.isValid) {
      errors.push(...memoValidation.errors)
    }
    
    const priceValidation = this.validateNumber(ingredient.price, '価格', false, false)
    if (!priceValidation.isValid) {
      errors.push(...priceValidation.errors)
    }
    
    const expiryDateValidation = this.validateDate(ingredient.expiry_date, '消費期限')
    if (!expiryDateValidation.isValid) {
      errors.push(...expiryDateValidation.errors)
    }
    
    const quantityValidation = this.validateNumber(ingredient.quantity, '個数', false, false)
    if (!quantityValidation.isValid) {
      errors.push(...quantityValidation.errors)
    }
    
    const weightValidation = this.validateNumber(ingredient.weight, 'グラム数', false, false)
    if (!weightValidation.isValid) {
      errors.push(...weightValidation.errors)
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * カテゴリデータのバリデーション
   */
  validateCategory(category: Category): ValidationResult {
    const errors: string[] = []
    
    const nameValidation = this.validateString(category.name, 'カテゴリ名', true, 50)
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors)
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * レシピデータのバリデーション
   */
  validateRecipe(recipe: Recipe): ValidationResult {
    const errors: string[] = []
    
    const nameValidation = this.validateString(recipe.name, 'レシピ名', true, 100)
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors)
    }
    
    const descriptionValidation = this.validateString(recipe.description, '説明', false, 1000)
    if (!descriptionValidation.isValid) {
      errors.push(...descriptionValidation.errors)
    }
    
    const ingredientsValidation = this.validateString(recipe.ingredients, '材料', false, 2000)
    if (!ingredientsValidation.isValid) {
      errors.push(...ingredientsValidation.errors)
    }
    
    const instructionsValidation = this.validateString(recipe.instructions, '作り方', false, 5000)
    if (!instructionsValidation.isValid) {
      errors.push(...instructionsValidation.errors)
    }
    
    const cookingTimeValidation = this.validateNumber(recipe.cooking_time, '調理時間', false, false)
    if (!cookingTimeValidation.isValid) {
      errors.push(...cookingTimeValidation.errors)
    }
    
    const servingsValidation = this.validateNumber(recipe.servings, '人数', false, false)
    if (!servingsValidation.isValid) {
      errors.push(...servingsValidation.errors)
    }
    
    const difficultyValidation = this.validateDifficulty(recipe.difficulty, '難易度')
    if (!difficultyValidation.isValid) {
      errors.push(...difficultyValidation.errors)
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * レシピ食材関連データのバリデーション
   */
  async validateRecipeIngredient(recipeIngredient: RecipeIngredient): Promise<ValidationResult> {
    const errors: string[] = []
    
    const recipeIdValidation = this.validateNumber(recipeIngredient.recipe_id, 'レシピID', true, false)
    if (!recipeIdValidation.isValid) {
      errors.push(...recipeIdValidation.errors)
    }
    
    const ingredientIdValidation = await this.validateCategoryId(recipeIngredient.ingredient_id, '食材ID', true)
    if (!ingredientIdValidation.isValid) {
      errors.push(...ingredientIdValidation.errors)
    }
    
    const quantityValidation = this.validateNumber(recipeIngredient.quantity, '使用量', false, false)
    if (!quantityValidation.isValid) {
      errors.push(...quantityValidation.errors)
    }
    
    const unitValidation = this.validateString(recipeIngredient.unit, '単位', false, 20)
    if (!unitValidation.isValid) {
      errors.push(...unitValidation.errors)
    }
    
    const notesValidation = this.validateString(recipeIngredient.notes, '備考', false, 200)
    if (!notesValidation.isValid) {
      errors.push(...notesValidation.errors)
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * IDのバリデーション
   */
  validateId(id: any, fieldName: string): ValidationResult {
    const errors: string[] = []
    
    if (!id || typeof id !== 'number' || id <= 0) {
      errors.push(`${fieldName}: IDが無効です`)
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * プロファイルデータのバリデーション
   * @param profile バリデーションするプロファイルデータ
   * @returns バリデーション結果
   */
  validateProfile(profile: UserProfile): ValidationResult {
    const errors: string[] = []
    
    // 年齢のバリデーション
    if (!profile.age || typeof profile.age !== 'number' || profile.age <= 0 || profile.age > 150) {
      errors.push('年齢は1-150歳の範囲で入力してください')
    }
    
    // 性別のバリデーション
    if (!profile.gender || !['male', 'female'].includes(profile.gender)) {
      errors.push('性別は「男性」または「女性」を選択してください')
    }
    
    // 身長のバリデーション
    if (!profile.height || typeof profile.height !== 'number' || profile.height <= 0 || profile.height > 300) {
      errors.push('身長は1-300cmの範囲で入力してください')
    }
    
    // 体重のバリデーション
    if (!profile.weight || typeof profile.weight !== 'number' || profile.weight <= 0 || profile.weight > 500) {
      errors.push('体重は1-500kgの範囲で入力してください')
    }
    
    // 目標体重のバリデーション（任意）
    if (profile.target_weight && (typeof profile.target_weight !== 'number' || profile.target_weight <= 0 || profile.target_weight > 500)) {
      errors.push('目標体重は1-500kgの範囲で入力してください')
    }
    
    // 活動レベルのバリデーション（任意）
    if (profile.activity_level && !['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(profile.activity_level)) {
      errors.push('活動レベルが無効です')
    }
    
    // 名前のバリデーション（任意）
    if (profile.name && typeof profile.name === 'string' && profile.name.length > 100) {
      errors.push('名前は100文字以内で入力してください')
    }
    
    return { isValid: errors.length === 0, errors }
  }
}
