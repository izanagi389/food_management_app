import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { Category, DatabaseResult } from '~/types'
import { DataValidator } from '../validation/validation'
import { WebStorageManager } from './WebStorageManager'
import { BaseManager } from './BaseManager'

/**
 * カテゴリ管理クラス
 */
export class CategoryManager extends BaseManager {
  private validator: DataValidator

  constructor(databaseName: string, isWebPlatform: boolean, webStorageManager: WebStorageManager) {
    super(databaseName, isWebPlatform, webStorageManager)
    this.validator = new DataValidator(databaseName, isWebPlatform)
  }

  /**
   * カテゴリを追加
   */
  async insertCategory(category: Category): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`カテゴリを挿入中: ${JSON.stringify(category)}`)
      
      // データバリデーション
      const validation = this.validator.validateCategory(category)
      if (!validation.isValid) {
        this.addDebugLog(`バリデーションエラー: ${JSON.stringify(validation.errors)}`)
        return {
          success: false,
          message: `データが無効です: ${validation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWebストレージに保存
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージにカテゴリデータを保存します')
        
        // 現在のカテゴリデータを取得
        const currentCategoriesResult = this.getCategoriesFromWebStorage()
        const currentCategories = currentCategoriesResult.success ? (currentCategoriesResult.data || []) : []
        
        // 新しいIDを生成（既存の最大ID + 1）
        const maxId = currentCategories.length > 0 ? Math.max(...currentCategories.map((c: any) => c.id || 0)) : 0
        const newId = maxId + 1
        
        // 新しいカテゴリデータを作成
        const newCategory: any = {
          id: newId,
          name: category.name,
          created_at: category.created_at || new Date().toISOString(),
          updated_at: category.updated_at || new Date().toISOString()
        }
        
        // カテゴリデータを追加
        const updatedCategories = [...currentCategories, newCategory]
        
        // Webストレージに保存
        this.webStorageManager.saveCategoriesToLocal(updatedCategories)
        this.webStorageManager.saveCategoriesToSession(updatedCategories)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージにカテゴリデータを保存しました',
          data: { changes: { lastId: newId } }
        }
      }
      
      // 現在の日時を取得
      const currentDate = new Date().toISOString()
      
      // 登録日と更新日を設定
      const created_at = category.created_at || currentDate
      const updated_at = category.updated_at || currentDate
      
      const insertQuery = `
        INSERT INTO categories (name, created_at, updated_at)
        VALUES (?, ?, ?)
      `
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: insertQuery,
        values: [category.name, created_at, updated_at]
      })
      
      this.addDebugLog(`カテゴリ挿入結果: ${JSON.stringify(response)}`)
      
      return {
        success: true,
        message: 'カテゴリが追加されました',
        data: response
      }
    } catch (error) {
      this.addDebugLog(`カテゴリ挿入エラー: ${error}`)
      return {
        success: false,
        message: `カテゴリ挿入エラー: ${error}`
      }
    }
  }

  /**
   * 全てのカテゴリを取得
   */
  async getAllCategories(): Promise<DatabaseResult> {
    try {
      this.addDebugLog('カテゴリを取得中...')
      
      // Webプラットフォームの場合はWebストレージから取得
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージからカテゴリを取得します')
        return this.getCategoriesFromWebStorage()
      }
      
      const response = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: 'SELECT * FROM categories ORDER BY name ASC',
        values: []
      })
      
      this.addDebugLog(`カテゴリ取得結果: ${JSON.stringify(response)}`)
      
      if (response && response.values) {
        // Webストレージにカテゴリデータを同期
        this.webStorageManager.saveCategoriesToLocal(response.values)
        this.webStorageManager.saveCategoriesToSession(response.values)

        return {
          success: true,
          message: `${response.values.length}件のカテゴリを取得しました`,
          data: response.values
        }
      } else {
        return {
          success: true,
          message: 'カテゴリが見つかりませんでした',
          data: []
        }
      }
    } catch (error) {
      this.addDebugLog(`カテゴリ取得エラー: ${error}`)
      return {
        success: false,
        message: `カテゴリ取得エラー: ${error}`
      }
    }
  }

  /**
   * カテゴリを削除
   */
  async deleteCategory(id: number): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`カテゴリを削除中 (ID: ${id})`)
      
      // IDのバリデーション
      const idValidation = this.validator.validateId(id, 'ID')
      if (!idValidation.isValid) {
        return {
          success: false,
          message: `データが無効です: ${idValidation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWeb Storageを使用
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Web Storageからカテゴリを削除')
        
        // ローカルストレージからカテゴリを削除
        const localCategories = this.webStorageManager.getCategoriesFromLocal().data || []
        const updatedLocalCategories = localCategories.filter((c: any) => c.id !== id)
        this.webStorageManager.saveCategoriesToLocal(updatedLocalCategories)
        
        // セッションストレージからカテゴリを削除
        const sessionCategories = this.webStorageManager.getCategoriesFromSession().data || []
        const updatedSessionCategories = sessionCategories.filter((c: any) => c.id !== id)
        this.webStorageManager.saveCategoriesToSession(updatedSessionCategories)
        
        // 削除されたかどうかを確認
        const wasDeleted = localCategories.length > updatedLocalCategories.length || 
                          sessionCategories.length > updatedSessionCategories.length
        
        if (wasDeleted) {
          return {
            success: true,
            message: `ID ${id} のカテゴリが削除されました`,
            data: null
          }
        } else {
          return {
            success: false,
            message: `ID ${id} のカテゴリが見つかりませんでした`
          }
        }
      }
      
      const deleteQuery = 'DELETE FROM categories WHERE id = ?'
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: deleteQuery,
        values: [id]
      })
      
      this.addDebugLog(`カテゴリ削除結果: ${JSON.stringify(response)}`)
      
      // 削除された行数を確認
      if (response && response.changes && response.changes.changes && response.changes.changes > 0) {
        return {
          success: true,
          message: `ID ${id} のカテゴリが削除されました`,
          data: response
        }
      } else {
        return {
          success: false,
          message: `ID ${id} のカテゴリが見つかりませんでした`
        }
      }
    } catch (error) {
      this.addDebugLog(`カテゴリ削除エラー: ${error}`)
      return {
        success: false,
        message: `カテゴリ削除エラー: ${error}`
      }
    }
  }

  /**
   * 初期カテゴリデータを挿入
   */
  async insertInitialCategories(): Promise<DatabaseResult> {
    const initialCategories: Category[] = [
      { name: '果物' },
      { name: '野菜' },
      { name: '乳製品' },
      { name: '穀物' },
      { name: '肉類' },
      { name: '魚介類' },
      { name: '調味料' },
      { name: 'その他' }
    ]
    
    try {
      this.addDebugLog(`初期カテゴリを挿入中: ${initialCategories.length}`)
      
      for (const category of initialCategories) {
        const result = await this.insertCategory(category)
        if (!result.success) {
          return result
        }
      }
      
      return {
        success: true,
        message: `${initialCategories.length}件の初期カテゴリが追加されました`
      }
    } catch (error) {
      this.addDebugLog(`初期カテゴリ挿入エラー: ${error}`)
      return {
        success: false,
        message: `初期カテゴリ挿入エラー: ${error}`
      }
    }
  }

  /**
   * Webストレージからカテゴリデータを取得
   */
  public getCategoriesFromWebStorage(): DatabaseResult {
    try {
      // まずローカルストレージから取得を試行
      const localResult = this.webStorageManager.getCategoriesFromLocal()
      if (localResult.success && localResult.data) {
        return {
          success: true,
          message: `ローカルストレージから${localResult.data.length}件のカテゴリを取得しました`,
          data: localResult.data
        }
      }

      // ローカルストレージにデータがない場合はセッションストレージから取得
      const sessionResult = this.webStorageManager.getCategoriesFromSession()
      if (sessionResult.success && sessionResult.data) {
        return {
          success: true,
          message: `セッションストレージから${sessionResult.data.length}件のカテゴリを取得しました`,
          data: sessionResult.data
        }
      }

      return {
        success: true,
        message: 'Webストレージにカテゴリが見つかりませんでした',
        data: []
      }
    } catch (error) {
      return {
        success: false,
        message: `Webストレージ取得エラー: ${error}`
      }
    }
  }
}
