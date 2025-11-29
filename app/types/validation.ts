/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * バリデーションエラーの定数
 */
export const VALIDATION_ERRORS = {
  REQUIRED: '必須項目です',
  INVALID_STRING: '文字列が無効です',
  INVALID_NUMBER: '数値が無効です',
  INVALID_URL: 'URLの形式が正しくありません',
  INVALID_DATE: '日付の形式が正しくありません',
  INVALID_DIFFICULTY: '難易度は easy, medium, hard のいずれかである必要があります',
  NEGATIVE_NUMBER: '負の数は許可されていません',
  STRING_TOO_LONG: '文字列が長すぎます',
  INVALID_CATEGORY_ID: 'カテゴリIDが無効です'
} as const

/**
 * バリデーションエラーの型
 */
export type ValidationError = typeof VALIDATION_ERRORS[keyof typeof VALIDATION_ERRORS]
