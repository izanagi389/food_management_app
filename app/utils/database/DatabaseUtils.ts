import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { DatabaseResult } from '~/types'
import { CacheManager } from '../managers/CacheManager'

/**
 * データベース操作の共通ユーティリティクラス
 * SQLite操作の共通機能とリトライ機能を提供
 */
export class DatabaseUtils {
  /**
   * リトライ機能付きでSQLクエリを実行
   * @param operation 実行する操作
   * @param maxRetries 最大リトライ回数（デフォルト: 3回）
   * @param delayMs リトライ間隔（ミリ秒、デフォルト: 500ms）
   * @param operationName 操作名（ログ用）
   * @returns 操作の結果
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 500,
    operationName: string = 'データベース操作'
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await operation()
        if (attempt > 0) {
          console.log(`✅ ${operationName}がリトライ ${attempt} 回目で成功しました`)
        }
        return result
      } catch (error) {
        lastError = error
        console.warn(`⚠️ ${operationName} リトライ ${attempt + 1}/${maxRetries}:`, error)
        
        if (attempt < maxRetries - 1) {
          const delay = delayMs * (attempt + 1)
          console.log(`🔄 ${delay}ms待機後にリトライします...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    console.error(`❌ ${operationName}が${maxRetries}回のリトライ後に失敗しました`)
    throw lastError
  }

  /**
   * リトライ機能付きでSQLクエリを実行（CapacitorSQLite.query用）
   * @param databaseName データベース名
   * @param statement SQL文
   * @param values パラメータ値
   * @param maxRetries 最大リトライ回数
   * @param operationName 操作名
   * @param useCache キャッシュを使用するか
   * @param cacheTtl キャッシュのTTL（ミリ秒）
   * @returns クエリ結果
   */
  static async queryWithRetry(
    databaseName: string,
    statement: string,
    values: any[] = [],
    maxRetries: number = 3,
    operationName: string = 'クエリ実行',
    useCache: boolean = true,
    cacheTtl: number = 30000 // 30秒
  ): Promise<any> {
    const cacheManager = CacheManager.getInstance()
    
    // キャッシュが有効で、SELECT文の場合のみキャッシュをチェック
    if (useCache && statement.trim().toUpperCase().startsWith('SELECT')) {
      const cacheKey = cacheManager.generateKey('query', databaseName, statement, values)
      const cachedResult = cacheManager.get(cacheKey)
      
      if (cachedResult) {
        this.log('info', `キャッシュから取得: ${operationName}`)
        return cachedResult
      }
    }
    
    const result = await this.executeWithRetry(
      () => CapacitorSQLite.query({
        database: databaseName,
        statement,
        values
      }),
      maxRetries,
      500,
      operationName
    )
    
    // 結果をキャッシュに保存
    if (useCache && statement.trim().toUpperCase().startsWith('SELECT')) {
      const cacheKey = cacheManager.generateKey('query', databaseName, statement, values)
      cacheManager.set(cacheKey, result, cacheTtl)
    }
    
    return result
  }

  /**
   * リトライ機能付きでSQL実行（CapacitorSQLite.run用）
   * @param databaseName データベース名
   * @param statement SQL文
   * @param values パラメータ値
   * @param maxRetries 最大リトライ回数
   * @param operationName 操作名
   * @returns 実行結果
   */
  static async runWithRetry(
    databaseName: string,
    statement: string,
    values: any[] = [],
    maxRetries: number = 3,
    operationName: string = 'SQL実行'
  ): Promise<any> {
    const result = await this.executeWithRetry(
      () => CapacitorSQLite.run({
        database: databaseName,
        statement,
        values
      }),
      maxRetries,
      500,
      operationName
    )
    
    // INSERT/UPDATE/DELETEの場合はキャッシュを無効化
    const statementType = statement.trim().toUpperCase().split(' ')[0]
    if (statementType && ['INSERT', 'UPDATE', 'DELETE'].includes(statementType)) {
      this.invalidateCache(databaseName)
      this.log('info', `キャッシュを無効化しました: ${operationName}`)
    }
    
    return result
  }

  /**
   * テーブル存在確認
   */
  static async checkTableExists(
    databaseName: string,
    tableName: string,
    isWebPlatform: boolean = false
  ): Promise<{ exists: boolean; result?: any }> {
    if (isWebPlatform) {
      return { exists: true }
    }

    try {
      const result = await this.queryWithRetry(
        databaseName,
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName],
        2,
        `テーブル存在確認: ${tableName}`
      )

      const exists = (result.values && result.values.length > 0) ||
                    ((result as any).iosValues && (result as any).iosValues.length > 0)

      return { exists, result }
    } catch (error) {
      console.error(`テーブル存在確認エラー (${tableName}):`, error)
      return { exists: false }
    }
  }

  /**
   * iOS形式のデータを通常形式に変換
   */
  static convertIOSDataToNormal(result: any): any[] {
    if (result.values && result.values.length > 0) {
      return result.values
    }

    if ((result as any).iosColumns && (result as any).iosValues && (result as any).iosValues.length > 0) {
      const columns = (result as any).iosColumns as string[]
      const values = (result as any).iosValues

      return values.map((rowData: any) => {
        const convertedRow: any = {}
        
        if (Array.isArray(rowData)) {
          for (let i = 0; i < columns.length; i++) {
            const colName = columns[i]
            if (colName) {
              convertedRow[colName] = rowData[i]
            }
          }
        } else if (typeof rowData === 'object' && rowData !== null) {
          for (const colName of columns) {
            if (colName in rowData) {
              convertedRow[colName] = rowData[colName]
            }
          }
        }
        
        return convertedRow
      })
    }

    return []
  }

  /**
   * データベース操作結果を標準化
   */
  static createSuccessResult<T>(data: T, message: string = '操作が完了しました'): DatabaseResult<T> {
    return {
      success: true,
      data,
      message
    }
  }

  /**
   * データベース操作エラー結果を標準化
   */
  static createErrorResult<T>(message: string, data?: T): DatabaseResult<T> {
    return {
      success: false,
      message,
      data
    }
  }

  /**
   * Webプラットフォーム判定
   */
  static isWebPlatform(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    
    const isWebProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:'
    const isNativePlatform = (window as any).Capacitor?.isNativePlatform?.() || false
    
    return isWebProtocol && !isNativePlatform
  }

  /**
   * キャッシュを無効化
   */
  static invalidateCache(databaseName?: string, tableName?: string): void {
    const cacheManager = CacheManager.getInstance()
    
    if (tableName) {
      // 特定のテーブルに関連するキャッシュを無効化
      cacheManager.deletePattern(`query_${databaseName}_.*${tableName}.*`)
    } else if (databaseName) {
      // 特定のデータベースに関連するキャッシュを無効化
      cacheManager.deletePattern(`query_${databaseName}_.*`)
    } else {
      // 全キャッシュをクリア
      cacheManager.clear()
    }
  }

  /**
   * ログ出力の統一化
   */
  static log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`, data || '')
        break
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '')
        break
      case 'error':
        console.error(`${prefix} ${message}`, data || '')
        break
    }
  }
}
