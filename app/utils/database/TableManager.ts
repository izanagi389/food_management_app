import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { DatabaseResult } from '~/types'
import { DatabaseUtils } from './DatabaseUtils'
import { TableSchema } from './TableSchema'

/**
 * テーブル管理クラス
 * データベーステーブルの作成、更新、削除を管理
 */
export class TableManager {
  private databaseName: string
  private isWebPlatform: boolean

  constructor(databaseName: string, isWebPlatform: boolean) {
    this.databaseName = databaseName
    this.isWebPlatform = isWebPlatform
  }

  /**
   * 全てのテーブルを作成
   * @returns 作成結果
   */
  async createTables(): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', 'テーブルを作成中...')
      
      // Webプラットフォームの場合はテーブル作成をスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、テーブル作成をスキップします')
        return DatabaseUtils.createSuccessResult(null, 'Webプラットフォーム: テーブル作成をスキップしました')
      }
      
      // 全てのテーブルを作成
      const createStatements = TableSchema.getCreateStatements()
      const tableNames = Object.keys(createStatements)
      
      DatabaseUtils.log('info', `作成するテーブル: ${tableNames.join(', ')}`)
      
      for (const tableName of tableNames) {
        const createQuery = createStatements[tableName]
        
        if (!createQuery) {
          DatabaseUtils.log('error', `${tableName}のCREATE文が見つかりません`)
          return DatabaseUtils.createErrorResult(`${tableName}のCREATE文が見つかりません`)
        }
        
        DatabaseUtils.log('info', `${tableName}テーブル作成中...`)
        
        try {
          await DatabaseUtils.runWithRetry(
            this.databaseName,
            createQuery,
            [],
            2,
            `${tableName}テーブル作成`
          )
          
          DatabaseUtils.log('info', `${tableName}テーブル作成完了`)
        } catch (error) {
          DatabaseUtils.log('error', `${tableName}テーブル作成エラー:`, error)
          return DatabaseUtils.createErrorResult(`${tableName}テーブル作成エラー: ${error}`)
        }
      }
      
      DatabaseUtils.log('info', '全テーブル作成完了')
      return DatabaseUtils.createSuccessResult(null, '全てのテーブルが作成されました')
    } catch (error) {
      DatabaseUtils.log('error', 'テーブル作成エラー:', error)
      return DatabaseUtils.createErrorResult(`テーブル作成エラー: ${error}`)
    }
  }

  /**
   * データベーススキーマを更新
   * 既存のテーブルにカラムを追加するなど
   * @returns 更新結果
   */
  async updateDatabaseSchema(): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', 'データベーススキーマを更新中...')
      
      // Webプラットフォームの場合はスキーマ更新をスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、スキーマ更新をスキップします')
        return DatabaseUtils.createSuccessResult(null, 'Webプラットフォーム: スキーマ更新をスキップしました')
      }
      
      // スキーマ更新用のALTER文を実行
      const alterStatements = TableSchema.getAlterStatements()
      
      for (const [tableName, statements] of Object.entries(alterStatements)) {
        DatabaseUtils.log('info', `${tableName}テーブルのスキーマ更新中...`)
        
        // テーブル構造を確認
        const tableInfoResult = await DatabaseUtils.queryWithRetry(
          this.databaseName,
          `PRAGMA table_info(${tableName})`,
          [],
          2,
          `${tableName}テーブル構造確認`
        )
        
        const existingColumns = DatabaseUtils.convertIOSDataToNormal(tableInfoResult)
          .map((col: any) => col.name)
        
        DatabaseUtils.log('info', `${tableName}の既存カラム:`, existingColumns)
        
        // 必要なカラムを追加
        for (const alterStatement of statements) {
          // ALTER文からカラム名を抽出
          const columnName = alterStatement.match(/ADD COLUMN (\w+)/)?.[1]
          
          if (columnName && !existingColumns.includes(columnName)) {
            DatabaseUtils.log('info', `${columnName}カラムを追加中...`)
            
            try {
              await DatabaseUtils.runWithRetry(
                this.databaseName,
                alterStatement,
                [],
                2,
                `${tableName}.${columnName}カラム追加`
              )
              
              DatabaseUtils.log('info', `${columnName}カラムを追加しました`)
            } catch (error) {
              DatabaseUtils.log('warn', `${columnName}カラム追加エラー（既に存在する可能性）:`, error)
            }
          } else if (columnName) {
            DatabaseUtils.log('info', `${columnName}カラムは既に存在します`)
          }
        }
      }
      
      DatabaseUtils.log('info', 'データベーススキーマ更新完了')
      return DatabaseUtils.createSuccessResult(null, 'データベーススキーマの更新が完了しました')
    } catch (error) {
      DatabaseUtils.log('error', 'スキーマ更新エラー:', error)
      return DatabaseUtils.createErrorResult(`スキーマ更新エラー: ${error}`)
    }
  }
}
