import type { DatabaseResult } from '~/types'
import { WebStorageManager } from './WebStorageManager'

/**
 * Managerクラスの基底クラス
 * 共通機能を提供
 */
export abstract class BaseManager {
  protected databaseName: string
  protected isWebPlatform: boolean
  protected webStorageManager: WebStorageManager
  private debugLogCallback?: (message: string) => void

  constructor(databaseName: string, isWebPlatform: boolean, webStorageManager: WebStorageManager) {
    this.databaseName = databaseName
    this.isWebPlatform = isWebPlatform
    this.webStorageManager = webStorageManager
  }

  /**
   * デバッグログコールバックを設定
   */
  setDebugLogCallback(callback: (message: string) => void): void {
    this.debugLogCallback = callback
  }

  /**
   * デバッグログを出力
   */
  protected addDebugLog(message: string): void {
    if (this.debugLogCallback) {
      this.debugLogCallback(message)
    } else {
      console.log(message)
    }
  }

  /**
   * エラーレスポンスを生成
   */
  protected createErrorResult(message: string, error?: any): DatabaseResult {
    return {
      success: false,
      message: error ? `${message}: ${error}` : message
    }
  }

  /**
   * 成功レスポンスを生成
   */
  protected createSuccessResult<T>(message: string, data?: T): DatabaseResult<T> {
    return {
      success: true,
      message,
      data
    }
  }

  /**
   * Webプラットフォームかどうかを判定
   */
  protected isWeb(): boolean {
    return this.isWebPlatform
  }

  /**
   * データベース名を取得
   */
  protected getDatabaseName(): string {
    return this.databaseName
  }
}
