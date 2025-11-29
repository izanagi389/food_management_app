import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { Food, DatabaseResult } from '~/types'
import { DataValidator } from '../validation/validation'
import { WebStorageManager } from './WebStorageManager'
import { BaseManager } from './BaseManager'

/**
 * 食材管理クラス
 */
export class IngredientManager extends BaseManager {
  private validator: DataValidator

  constructor(databaseName: string, isWebPlatform: boolean, webStorageManager: WebStorageManager) {
    super(databaseName, isWebPlatform, webStorageManager)
    this.validator = new DataValidator(databaseName, isWebPlatform)
  }

  /**
   * 食品データを追加
   */
  async insertFood(food: Food): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`食品データを挿入中: ${JSON.stringify(food)}`)
      
      // データバリデーション
      const validation = await this.validator.validateIngredient(food)
      if (!validation.isValid) {
        this.addDebugLog(`バリデーションエラー: ${JSON.stringify(validation.errors)}`)
        return {
          success: false,
          message: `データが無効です: ${validation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWebストレージに保存
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージに食品データを保存します')
        
        // 現在の食品データを取得
        const currentFoodsResult = this.getFoodsFromWebStorage()
        const currentFoods = currentFoodsResult.success ? (currentFoodsResult.data || []) : []
        
        // 新しいIDを生成（既存の最大ID + 1）
        const maxId = currentFoods.length > 0 ? Math.max(...currentFoods.map((f: any) => f.id || 0)) : 0
        const newId = maxId + 1
        
        // カテゴリ名を取得
        const categoriesResult = this.webStorageManager.getCategoriesFromLocal()
        const categories = categoriesResult.success ? (categoriesResult.data || []) : []
        const category = categories.find((c: any) => c.id === food.category_id)
        
        // 新しい食品データを作成
        const newFood: any = {
          id: newId,
          name: food.name,
          category_id: food.category_id,
          url: food.url || '',
          memo: food.memo || '',
          price: food.price || null,
          expiry_date: food.expiry_date || null,
          quantity: food.quantity || null,
          weight: food.weight || null,
          category_name: category?.name || '不明',
          created_at: food.created_at || new Date().toISOString(),
          updated_at: food.updated_at || new Date().toISOString()
        }
        
        // 食品データを追加
        const updatedFoods = [...currentFoods, newFood]
        
        // Webストレージに保存
        this.webStorageManager.saveFoodsToLocal(updatedFoods)
        this.webStorageManager.saveFoodsToSession(updatedFoods)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージに食品データを保存しました',
          data: { changes: { lastId: newId } }
        }
      }
      
      // 現在の日時を取得
      const currentDate = new Date().toISOString()
      
      // 登録日と更新日を設定（既に指定されている場合は使用、そうでなければ現在時刻）
      const created_at = food.created_at || currentDate
      const updated_at = food.updated_at || currentDate
      
      const insertQuery = `
        INSERT INTO ingredients (name, category_id, url, memo, price, expiry_date, quantity, weight, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: insertQuery,
        values: [food.name, food.category_id, food.url || '', food.memo || '', food.price || null, food.expiry_date || null, food.quantity || null, food.weight || null, created_at, updated_at]
      })
      
      this.addDebugLog(`挿入結果: ${JSON.stringify(response)}`)
      
      return {
        success: true,
        message: '食品データが追加されました',
        data: response
      }
    } catch (error) {
      this.addDebugLog(`データ挿入エラー: ${error}`)
      return {
        success: false,
        message: `データ挿入エラー: ${error}`
      }
    }
  }

  /**
   * 複数の食品データを一括追加
   */
  async insertMultipleFoods(foods: Food[]): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`複数の食品データを挿入中: ${foods.length}`)
      
      for (const food of foods) {
        const result = await this.insertFood(food)
        if (!result.success) {
          return result
        }
      }
      
      return {
        success: true,
        message: `${foods.length}件の食品データが追加されました`
      }
    } catch (error) {
      this.addDebugLog(`一括挿入エラー: ${error}`)
      return {
        success: false,
        message: `一括挿入エラー: ${error}`
      }
    }
  }

  /**
   * 全ての食品データを取得（カテゴリ情報付き）
   */
  async getAllFoods(): Promise<DatabaseResult> {
    try {
      this.addDebugLog('食品データを取得中...')
      
      // Webプラットフォームの場合はWebストレージから取得
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージからデータを取得します')
        return this.getFoodsFromWebStorage()
      }
      
      // データベースの同期を確実にするため、少し待機
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // リトライ機能付きでデータを取得
      let response
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          response = await CapacitorSQLite.query({
            database: this.getDatabaseName(),
            statement: `
              SELECT 
                i.id,
                i.name,
                i.category_id,
                i.url,
                i.memo,
                i.price,
                i.expiry_date,
                i.quantity,
                i.weight,
                c.name as category_name,
                i.created_at,
                i.updated_at
              FROM ingredients i
              LEFT JOIN categories c ON i.category_id = c.id
              ORDER BY i.created_at DESC
            `,
            values: []
          })
          
          // レスポンスが正常な場合はループを抜ける
          if (response && response.values !== undefined) {
            break
          }
        } catch (error) {
          console.warn(`データ取得リトライ ${retryCount + 1}/${maxRetries}:`, error)
        }
        
        retryCount++
        if (retryCount < maxRetries) {
          // リトライ前に少し待機
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount))
        }
      }
      
      this.addDebugLog(`データ取得結果: ${JSON.stringify(response)}`)
      
      if (response && response.values) {
        // データの詳細をログ出力
        this.addDebugLog('取得したデータの詳細:')
        response.values.forEach((item, index) => {
          this.addDebugLog(`[${index}] ID: ${item.id}, Name: ${item.name}, Category: ${item.category_name}`)
        })
        
        // IDがundefinedまたはnullのデータをフィルタリング
        const validData = response.values.filter(item => item.id !== undefined && item.id !== null)
        
        this.addDebugLog(`フィルタリング前: ${response.values.length}件, フィルタリング後: ${validData.length}件`)
        
        // Webストレージにデータを同期
        this.webStorageManager.saveFoodsToLocal(validData)
        this.webStorageManager.saveFoodsToSession(validData)
        this.webStorageManager.saveLastSyncTime()

        return {
          success: true,
          message: `${validData.length}件のデータを取得しました`,
          data: validData
        }
      } else {
        return {
          success: true,
          message: 'データが見つかりませんでした',
          data: []
        }
      }
    } catch (error) {
      this.addDebugLog(`データ取得エラー: ${error}`)
      return {
        success: false,
        message: `データ取得エラー: ${error}`
      }
    }
  }

  /**
   * IDで食品データを取得
   */
  async getFoodById(id: number): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`食品データを取得中 (ID: ${id})`)
      
      // IDのバリデーション
      const idValidation = this.validator.validateId(id, 'ID')
      if (!idValidation.isValid) {
        return {
          success: false,
          message: `データが無効です: ${idValidation.errors.join(', ')}`
        }
      }
      
      const response = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: 'SELECT * FROM ingredients WHERE id = ?',
        values: [id]
      })
      
      this.addDebugLog(`データ取得結果: ${JSON.stringify(response)}`)
      
      if (response && response.values && response.values.length > 0) {
        return {
          success: true,
          message: '食品データを取得しました',
          data: response.values[0]
        }
      } else {
        return {
          success: false,
          message: '指定されたIDの食品データが見つかりませんでした'
        }
      }
    } catch (error) {
      this.addDebugLog(`データ取得エラー: ${error}`)
      return {
        success: false,
        message: `データ取得エラー: ${error}`
      }
    }
  }

  /**
   * 食品データを更新
   */
  async updateFood(id: number, food: Partial<Food>): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`食品データを更新中 (ID: ${id})`)
      
      // IDのバリデーション
      const idValidation = this.validator.validateId(id, 'ID')
      if (!idValidation.isValid) {
        return {
          success: false,
          message: `データが無効です: ${idValidation.errors.join(', ')}`
        }
      }
      
      // 更新データのバリデーション（部分的なデータでも検証）
      if (food.name !== undefined) {
        const nameValidation = this.validator.validateString(food.name, '食材名', true, 100)
        if (!nameValidation.isValid) {
          return {
            success: false,
            message: `データが無効です: ${nameValidation.errors.join(', ')}`
          }
        }
      }
      
      if (food.category_id !== undefined) {
        const categoryValidation = await this.validator.validateCategoryId(food.category_id, 'カテゴリID', true)
        if (!categoryValidation.isValid) {
          return {
            success: false,
            message: `データが無効です: ${categoryValidation.errors.join(', ')}`
          }
        }
      }
      
      if (food.url !== undefined) {
        const urlValidation = this.validator.validateUrl(food.url, 'URL')
        if (!urlValidation.isValid) {
          return {
            success: false,
            message: `データが無効です: ${urlValidation.errors.join(', ')}`
          }
        }
      }
      
      if (food.price !== undefined) {
        const priceValidation = this.validator.validateNumber(food.price, '価格', false, false)
        if (!priceValidation.isValid) {
          return {
            success: false,
            message: `データが無効です: ${priceValidation.errors.join(', ')}`
          }
        }
      }
      
      // Webプラットフォームの場合はWebストレージを更新
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージの食品データを更新します')
        
        // 現在の食品データを取得
        const currentFoodsResult = this.getFoodsFromWebStorage()
        const currentFoods = currentFoodsResult.success ? (currentFoodsResult.data || []) : []
        
        // 更新対象の食品を検索
        const foodIndex = currentFoods.findIndex((f: any) => f.id === id)
        if (foodIndex === -1) {
          return {
            success: false,
            message: `ID ${id} の食品が見つかりません`
          }
        }
        
        // 食品データを更新
        const updatedFood = { ...currentFoods[foodIndex] }
        
        if (food.name !== undefined) {
          updatedFood.name = food.name
        }
        if (food.category_id !== undefined) {
          updatedFood.category_id = food.category_id
          // カテゴリ名も更新
          const categoriesResult = this.webStorageManager.getCategoriesFromLocal()
          const categories = categoriesResult.success ? (categoriesResult.data || []) : []
          const category = categories.find((c: any) => c.id === food.category_id)
          updatedFood.category_name = category?.name || '不明'
        }
        if (food.url !== undefined) {
          updatedFood.url = food.url || ''
        }
        if (food.memo !== undefined) {
          updatedFood.memo = food.memo || ''
        }
        if (food.price !== undefined) {
          updatedFood.price = food.price || null
        }
        if (food.expiry_date !== undefined) {
          updatedFood.expiry_date = food.expiry_date || null
        }
        if (food.quantity !== undefined) {
          updatedFood.quantity = food.quantity || null
        }
        if (food.weight !== undefined) {
          updatedFood.weight = food.weight || null
        }
        
        updatedFood.updated_at = new Date().toISOString()
        
        // 食品データを更新
        const updatedFoods = [...currentFoods]
        updatedFoods[foodIndex] = updatedFood
        
        // Webストレージに保存
        this.webStorageManager.saveFoodsToLocal(updatedFoods)
        this.webStorageManager.saveFoodsToSession(updatedFoods)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージの食品データを更新しました',
          data: updatedFood
        }
      }
      
      const updateFields = []
      const values = []
      
      if (food.name !== undefined) {
        updateFields.push('name = ?')
        values.push(food.name)
      }
      if (food.category_id !== undefined) {
        updateFields.push('category_id = ?')
        values.push(food.category_id)
      }
      if (food.url !== undefined) {
        updateFields.push('url = ?')
        values.push(food.url || '')
      }
      if (food.memo !== undefined) {
        updateFields.push('memo = ?')
        values.push(food.memo || '')
      }
      if (food.price !== undefined) {
        updateFields.push('price = ?')
        values.push(food.price || null)
      }
      if (food.expiry_date !== undefined) {
        updateFields.push('expiry_date = ?')
        values.push(food.expiry_date || null)
      }
      if (food.quantity !== undefined) {
        updateFields.push('quantity = ?')
        values.push(food.quantity || null)
      }
      if (food.weight !== undefined) {
        updateFields.push('weight = ?')
        values.push(food.weight || null)
      }
      
      if (updateFields.length === 0) {
        return {
          success: false,
          message: '更新するフィールドが指定されていません'
        }
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)
      
      const updateQuery = `
        UPDATE ingredients 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: updateQuery,
        values: values
      })
      
      this.addDebugLog(`更新結果: ${JSON.stringify(response)}`)
      
      return {
        success: true,
        message: '食品データが更新されました',
        data: response
      }
    } catch (error) {
      this.addDebugLog(`データ更新エラー: ${error}`)
      return {
        success: false,
        message: `データ更新エラー: ${error}`
      }
    }
  }

  /**
   * 食品データを削除
   */
  async deleteFood(id: number): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`食品データを削除中 (ID: ${id})`)
      
      // IDのバリデーション
      const idValidation = this.validator.validateId(id, 'ID')
      if (!idValidation.isValid) {
        return {
          success: false,
          message: `データが無効です: ${idValidation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWebストレージから削除
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージから食品データを削除します')
        
        // 現在の食品データを取得
        const currentFoodsResult = this.getFoodsFromWebStorage()
        const currentFoods = currentFoodsResult.success ? (currentFoodsResult.data || []) : []
        
        // 削除対象の食品を検索
        const foodIndex = currentFoods.findIndex((f: any) => f.id === id)
        if (foodIndex === -1) {
          return {
            success: false,
            message: `ID ${id} の食品が見つかりません`
          }
        }
        
        // 食品データを削除
        const updatedFoods = currentFoods.filter((f: any) => f.id !== id)
        
        // Webストレージに保存
        this.webStorageManager.saveFoodsToLocal(updatedFoods)
        this.webStorageManager.saveFoodsToSession(updatedFoods)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージから食品データを削除しました'
        }
      }
      
      const deleteQuery = 'DELETE FROM ingredients WHERE id = ?'
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: deleteQuery,
        values: [id]
      })
      
      this.addDebugLog(`削除結果: ${JSON.stringify(response)}`)
      
      // 削除された行数を確認
      if (response && response.changes && response.changes.changes && response.changes.changes > 0) {
        return {
          success: true,
          message: `ID ${id} の食品データが削除されました`,
          data: response
        }
      } else {
        return {
          success: false,
          message: `ID ${id} の食品データが見つかりませんでした`
        }
      }
    } catch (error) {
      this.addDebugLog(`データ削除エラー: ${error}`)
      return {
        success: false,
        message: `データ削除エラー: ${error}`
      }
    }
  }

  /**
   * 全ての食品データを削除
   */
  async deleteAllFoods(): Promise<DatabaseResult> {
    try {
      this.addDebugLog('全ての食品データを削除中...')
      
      // まず現在のデータ数を確認
      const countResponse = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: 'SELECT COUNT(*) as count FROM ingredients',
        values: []
      })
      
      this.addDebugLog(`削除前のデータ数: ${JSON.stringify(countResponse)}`)
      
      const deleteQuery = 'DELETE FROM ingredients'
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: deleteQuery,
        values: []
      })
      
      this.addDebugLog(`全削除結果: ${JSON.stringify(response)}`)
      
      // 削除後のデータ数を確認
      const countAfterResponse = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: 'SELECT COUNT(*) as count FROM ingredients',
        values: []
      })
      
      this.addDebugLog(`削除後のデータ数: ${JSON.stringify(countAfterResponse)}`)
      
      return {
        success: true,
        message: `全ての食品データが削除されました (削除前: ${countResponse?.values?.[0]?.count || 0}件, 削除後: ${countAfterResponse?.values?.[0]?.count || 0}件)`,
        data: response
      }
    } catch (error) {
      this.addDebugLog(`全削除エラー: ${error}`)
      return {
        success: false,
        message: `全削除エラー: ${error}`
      }
    }
  }

  /**
   * Webストレージから食品データを取得
   */
  public getFoodsFromWebStorage(): DatabaseResult {
    try {
      // まずローカルストレージから取得を試行
      const localResult = this.webStorageManager.getFoodsFromLocal()
      if (localResult.success && localResult.data) {
        return {
          success: true,
          message: `ローカルストレージから${localResult.data.length}件のデータを取得しました`,
          data: localResult.data
        }
      }

      // ローカルストレージにデータがない場合はセッションストレージから取得
      const sessionResult = this.webStorageManager.getFoodsFromSession()
      if (sessionResult.success && sessionResult.data) {
        return {
          success: true,
          message: `セッションストレージから${sessionResult.data.length}件のデータを取得しました`,
          data: sessionResult.data
        }
      }

      return {
        success: true,
        message: 'Webストレージにデータが見つかりませんでした',
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
