/**
 * データベース操作結果の型定義
 */
export interface DatabaseResult<T = any> {
  success: boolean
  message: string
  data?: T
  debugLogs?: string[]
}

/**
 * ストレージ操作結果の型定義
 */
export interface StorageResult {
  success: boolean
  message: string
  data?: any
}

/**
 * プラットフォーム情報の型定義
 */
export interface PlatformInfo {
  isWebPlatform: boolean
  platform: string
  canUseSQLite: boolean
}
