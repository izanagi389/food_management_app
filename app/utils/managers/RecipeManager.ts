import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { Recipe, RecipeIngredient, DatabaseResult } from '~/types'
import { DataValidator } from '../validation/validation'
import { WebStorageManager } from './WebStorageManager'
import { BaseManager } from './BaseManager'

/**
 * レシピ管理クラス
 */
export class RecipeManager extends BaseManager {
  private validator: DataValidator

  constructor(databaseName: string, isWebPlatform: boolean, webStorageManager: WebStorageManager) {
    super(databaseName, isWebPlatform, webStorageManager)
    this.validator = new DataValidator(databaseName, isWebPlatform)
  }

  /**
   * レシピを追加
   */
  async insertRecipe(recipe: Recipe): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`レシピを挿入中: ${JSON.stringify(recipe)}`)
      
      // データバリデーション
      const validation = this.validator.validateRecipe(recipe)
      if (!validation.isValid) {
        this.addDebugLog(`バリデーションエラー: ${JSON.stringify(validation.errors)}`)
        return {
          success: false,
          message: `データが無効です: ${validation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWebストレージに保存
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージにレシピデータを保存します')
        
        // 現在のレシピデータを取得
        const currentRecipesResult = this.getRecipesFromWebStorage()
        const currentRecipes = currentRecipesResult.success ? (currentRecipesResult.data || []) : []
        
        // 新しいIDを生成（既存の最大ID + 1）
        const maxId = currentRecipes.length > 0 ? Math.max(...currentRecipes.map((r: any) => r.id || 0)) : 0
        const newId = maxId + 1
        
        // 新しいレシピデータを作成
        const newRecipe: any = {
          id: newId,
          name: recipe.name,
          description: recipe.description || '',
          ingredients: recipe.ingredients || '',
          instructions: recipe.instructions || '',
          cooking_time: recipe.cooking_time || null,
          servings: recipe.servings || null,
          difficulty: recipe.difficulty || null,
          created_at: recipe.created_at || new Date().toISOString(),
          updated_at: recipe.updated_at || new Date().toISOString()
        }
        
        // レシピデータを追加
        const updatedRecipes = [...currentRecipes, newRecipe]
        
        // Webストレージに保存（レシピ機能は未実装）
        // this.webStorageManager.saveRecipesToLocal(updatedRecipes)
        // this.webStorageManager.saveRecipesToSession(updatedRecipes)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージにレシピデータを保存しました',
          data: { changes: { lastId: newId } }
        }
      }
      
      // 現在の日時を取得
      const currentDate = new Date().toISOString()
      
      // 登録日と更新日を設定
      const created_at = recipe.created_at || currentDate
      const updated_at = recipe.updated_at || currentDate
      
      const insertQuery = `
        INSERT INTO recipes (name, description, ingredients, instructions, cooking_time, servings, difficulty, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: insertQuery,
        values: [
          recipe.name,
          recipe.description || '',
          recipe.ingredients || '',
          recipe.instructions || '',
          recipe.cooking_time || null,
          recipe.servings || null,
          recipe.difficulty || null,
          created_at,
          updated_at
        ]
      })
      
      this.addDebugLog(`レシピ挿入結果: ${JSON.stringify(response)}`)
      
      return {
        success: true,
        message: 'レシピが追加されました',
        data: response
      }
    } catch (error) {
      this.addDebugLog(`レシピ挿入エラー: ${error}`)
      return {
        success: false,
        message: `レシピ挿入エラー: ${error}`
      }
    }
  }

  /**
   * 全てのレシピを取得
   */
  async getAllRecipes(): Promise<DatabaseResult> {
    try {
      this.addDebugLog('レシピを取得中...')
      
      // Webプラットフォームの場合はWebストレージから取得
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージからレシピを取得します')
        return this.getRecipesFromWebStorage()
      }
      
      const response = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: 'SELECT * FROM recipes ORDER BY created_at DESC',
        values: []
      })
      
      this.addDebugLog(`レシピ取得結果: ${JSON.stringify(response)}`)
      
      if (response && response.values) {
        // Webストレージにレシピデータを同期（レシピ機能は未実装）
        // this.webStorageManager.saveRecipesToLocal(response.values)
        // this.webStorageManager.saveRecipesToSession(response.values)

        return {
          success: true,
          message: `${response.values.length}件のレシピを取得しました`,
          data: response.values
        }
      } else {
        return {
          success: true,
          message: 'レシピが見つかりませんでした',
          data: []
        }
      }
    } catch (error) {
      this.addDebugLog(`レシピ取得エラー: ${error}`)
      return {
        success: false,
        message: `レシピ取得エラー: ${error}`
      }
    }
  }

  /**
   * レシピを更新
   */
  async updateRecipe(id: number, recipe: Partial<Recipe>): Promise<DatabaseResult> {
    try {
      this.addDebugLog(`レシピを更新中 (ID: ${id})`)
      
      // IDのバリデーション
      const idValidation = this.validator.validateId(id, 'ID')
      if (!idValidation.isValid) {
        return {
          success: false,
          message: `データが無効です: ${idValidation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWebストレージを更新
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージのレシピデータを更新します')
        
        // 現在のレシピデータを取得
        const currentRecipesResult = this.getRecipesFromWebStorage()
        const currentRecipes = currentRecipesResult.success ? (currentRecipesResult.data || []) : []
        
        // 更新対象のレシピを検索
        const recipeIndex = currentRecipes.findIndex((r: any) => r.id === id)
        if (recipeIndex === -1) {
          return {
            success: false,
            message: `ID ${id} のレシピが見つかりません`
          }
        }
        
        // レシピデータを更新
        const updatedRecipe = { ...currentRecipes[recipeIndex] }
        
        if (recipe.name !== undefined) updatedRecipe.name = recipe.name
        if (recipe.description !== undefined) updatedRecipe.description = recipe.description || ''
        if (recipe.ingredients !== undefined) updatedRecipe.ingredients = recipe.ingredients || ''
        if (recipe.instructions !== undefined) updatedRecipe.instructions = recipe.instructions || ''
        if (recipe.cooking_time !== undefined) updatedRecipe.cooking_time = recipe.cooking_time || null
        if (recipe.servings !== undefined) updatedRecipe.servings = recipe.servings || null
        if (recipe.difficulty !== undefined) updatedRecipe.difficulty = recipe.difficulty || null
        
        updatedRecipe.updated_at = new Date().toISOString()
        
        // レシピデータを更新
        const updatedRecipes = [...currentRecipes]
        updatedRecipes[recipeIndex] = updatedRecipe
        
        // Webストレージに保存（レシピ機能は未実装）
        // this.webStorageManager.saveRecipesToLocal(updatedRecipes)
        // this.webStorageManager.saveRecipesToSession(updatedRecipes)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージのレシピデータを更新しました',
          data: updatedRecipe
        }
      }
      
      const updateFields = []
      const values = []
      
      if (recipe.name !== undefined) {
        updateFields.push('name = ?')
        values.push(recipe.name)
      }
      if (recipe.description !== undefined) {
        updateFields.push('description = ?')
        values.push(recipe.description || '')
      }
      if (recipe.ingredients !== undefined) {
        updateFields.push('ingredients = ?')
        values.push(recipe.ingredients || '')
      }
      if (recipe.instructions !== undefined) {
        updateFields.push('instructions = ?')
        values.push(recipe.instructions || '')
      }
      if (recipe.cooking_time !== undefined) {
        updateFields.push('cooking_time = ?')
        values.push(recipe.cooking_time || null)
      }
      if (recipe.servings !== undefined) {
        updateFields.push('servings = ?')
        values.push(recipe.servings || null)
      }
      if (recipe.difficulty !== undefined) {
        updateFields.push('difficulty = ?')
        values.push(recipe.difficulty || null)
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
        UPDATE recipes 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: updateQuery,
        values: values
      })
      
      this.addDebugLog(`レシピ更新結果: ${JSON.stringify(response)}`)
      
      return {
        success: true,
        message: 'レシピが更新されました',
        data: response
      }
    } catch (error) {
      this.addDebugLog(`レシピ更新エラー: ${error}`)
      return {
        success: false,
        message: `レシピ更新エラー: ${error}`
      }
    }
  }

  /**
   * レシピを削除
   */
  async deleteRecipe(id: number): Promise<DatabaseResult> {
    try {
      console.log('レシピを削除中 (ID:', id, ')')
      
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
        console.log('Webプラットフォーム: Webストレージからレシピデータを削除します')
        
        // 現在のレシピデータを取得
        const currentRecipesResult = this.getRecipesFromWebStorage()
        const currentRecipes = currentRecipesResult.success ? (currentRecipesResult.data || []) : []
        
        // 削除対象のレシピを検索
        const recipeIndex = currentRecipes.findIndex((r: any) => r.id === id)
        if (recipeIndex === -1) {
          return {
            success: false,
            message: `ID ${id} のレシピが見つかりません`
          }
        }
        
        // レシピデータを削除
        const updatedRecipes = currentRecipes.filter((r: any) => r.id !== id)
        
        // Webストレージに保存（レシピ機能は未実装）
        // this.webStorageManager.saveRecipesToLocal(updatedRecipes)
        // this.webStorageManager.saveRecipesToSession(updatedRecipes)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージからレシピデータを削除しました'
        }
      }
      
      const deleteQuery = 'DELETE FROM recipes WHERE id = ?'
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: deleteQuery,
        values: [id]
      })
      
      console.log('レシピ削除結果:', response)
      
      // 削除された行数を確認
      if (response && response.changes && response.changes.changes && response.changes.changes > 0) {
        return {
          success: true,
          message: `ID ${id} のレシピが削除されました`,
          data: response
        }
      } else {
        return {
          success: false,
          message: `ID ${id} のレシピが見つかりませんでした`
        }
      }
    } catch (error) {
      console.error('レシピ削除エラー:', error)
      return {
        success: false,
        message: `レシピ削除エラー: ${error}`
      }
    }
  }

  /**
   * レシピに食材を関連付ける
   */
  async addIngredientToRecipe(recipeId: number, ingredientId: number, quantity?: number, unit?: string, notes?: string): Promise<DatabaseResult> {
    try {
      console.log('レシピに食材を関連付け中:', { recipeId, ingredientId, quantity, unit, notes })
      
      // データバリデーション
      const recipeIngredient: RecipeIngredient = {
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity: quantity,
        unit: unit,
        notes: notes
      }
      
      const validation = await this.validator.validateRecipeIngredient(recipeIngredient)
      if (!validation.isValid) {
        console.error('バリデーションエラー:', validation.errors)
        return {
          success: false,
          message: `データが無効です: ${validation.errors.join(', ')}`
        }
      }
      
      // Webプラットフォームの場合はWebストレージに保存
      if (this.isWeb()) {
        console.log('Webプラットフォーム: Webストレージにレシピ食材関連データを保存します')
        
        // 現在のレシピ食材関連データを取得
        const currentRecipeIngredientsResult = this.getRecipeIngredientsFromWebStorage()
        const currentRecipeIngredients = currentRecipeIngredientsResult.success ? (currentRecipeIngredientsResult.data || []) : []
        
        // 新しいIDを生成
        const maxId = currentRecipeIngredients.length > 0 ? Math.max(...currentRecipeIngredients.map((ri: any) => ri.id || 0)) : 0
        const newId = maxId + 1
        
        // 新しいレシピ食材関連データを作成
        const newRecipeIngredient: any = {
          id: newId,
          recipe_id: recipeId,
          ingredient_id: ingredientId,
          quantity: quantity || null,
          unit: unit || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // レシピ食材関連データを追加
        const updatedRecipeIngredients = [...currentRecipeIngredients, newRecipeIngredient]
        
        // Webストレージに保存（レシピ機能は未実装）
        // this.webStorageManager.saveRecipeIngredientsToLocal(updatedRecipeIngredients)
        // this.webStorageManager.saveRecipeIngredientsToSession(updatedRecipeIngredients)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージにレシピ食材関連データを保存しました',
          data: { changes: { lastId: newId } }
        }
      }
      
      // 現在の日時を取得
      const currentDate = new Date().toISOString()
      
      const insertQuery = `
        INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: insertQuery,
        values: [recipeId, ingredientId, quantity || null, unit || null, notes || null, currentDate, currentDate]
      })
      
      console.log('レシピ食材関連付け結果:', response)
      
      return {
        success: true,
        message: 'レシピに食材を関連付けました',
        data: response
      }
    } catch (error) {
      console.error('レシピ食材関連付けエラー:', error)
      return {
        success: false,
        message: `レシピ食材関連付けエラー: ${error}`
      }
    }
  }

  /**
   * レシピから食材の関連付けを削除
   */
  async removeIngredientFromRecipe(recipeId: number, ingredientId: number): Promise<DatabaseResult> {
    try {
      console.log('レシピから食材の関連付けを削除中:', { recipeId, ingredientId })
      
      // Webプラットフォームの場合はWebストレージから削除
      if (this.isWeb()) {
        console.log('Webプラットフォーム: Webストレージからレシピ食材関連データを削除します')
        
        // 現在のレシピ食材関連データを取得
        const currentRecipeIngredientsResult = this.getRecipeIngredientsFromWebStorage()
        const currentRecipeIngredients = currentRecipeIngredientsResult.success ? (currentRecipeIngredientsResult.data || []) : []
        
        // 削除対象のレシピ食材関連データを検索
        const recipeIngredientIndex = currentRecipeIngredients.findIndex((ri: any) => 
          ri.recipe_id === recipeId && ri.ingredient_id === ingredientId
        )
        
        if (recipeIngredientIndex === -1) {
          return {
            success: false,
            message: `レシピID ${recipeId} と食材ID ${ingredientId} の関連付けが見つかりません`
          }
        }
        
        // レシピ食材関連データを削除
        const updatedRecipeIngredients = currentRecipeIngredients.filter((ri: any) => 
          !(ri.recipe_id === recipeId && ri.ingredient_id === ingredientId)
        )
        
        // Webストレージに保存（レシピ機能は未実装）
        // this.webStorageManager.saveRecipeIngredientsToLocal(updatedRecipeIngredients)
        // this.webStorageManager.saveRecipeIngredientsToSession(updatedRecipeIngredients)
        this.webStorageManager.saveLastSyncTime()
        
        return {
          success: true,
          message: 'Webストレージからレシピ食材関連データを削除しました'
        }
      }
      
      const deleteQuery = 'DELETE FROM recipe_ingredients WHERE recipe_id = ? AND ingredient_id = ?'
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: deleteQuery,
        values: [recipeId, ingredientId]
      })
      
      console.log('レシピ食材関連削除結果:', response)
      
      // 削除された行数を確認
      if (response && response.changes && response.changes.changes && response.changes.changes > 0) {
        return {
          success: true,
          message: 'レシピから食材の関連付けを削除しました',
          data: response
        }
      } else {
        return {
          success: false,
          message: 'レシピと食材の関連付けが見つかりませんでした'
        }
      }
    } catch (error) {
      console.error('レシピ食材関連削除エラー:', error)
      return {
        success: false,
        message: `レシピ食材関連削除エラー: ${error}`
      }
    }
  }

  /**
   * レシピの食材関連付けを取得
   */
  async getRecipeIngredients(recipeId: number): Promise<DatabaseResult> {
    try {
      console.log('レシピの食材関連付けを取得中:', recipeId)
      
      // Webプラットフォームの場合はWebストレージから取得
      if (this.isWeb()) {
        console.log('Webプラットフォーム: Webストレージからレシピ食材関連データを取得します')
        return this.getRecipeIngredientsFromWebStorage(recipeId)
      }
      
      const response = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: `
          SELECT 
            ri.id,
            ri.recipe_id,
            ri.ingredient_id,
            ri.quantity,
            ri.unit,
            ri.notes,
            ri.created_at,
            ri.updated_at,
            i.name as ingredient_name,
            c.name as ingredient_category
          FROM recipe_ingredients ri
          LEFT JOIN ingredients i ON ri.ingredient_id = i.id
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE ri.recipe_id = ?
          ORDER BY ri.created_at ASC
        `,
        values: [recipeId]
      })
      
      console.log('レシピ食材関連取得結果:', response)
      
      if (response && response.values) {
        return {
          success: true,
          message: `${response.values.length}件のレシピ食材関連データを取得しました`,
          data: response.values
        }
      } else {
        return {
          success: true,
          message: 'レシピ食材関連データが見つかりませんでした',
          data: []
        }
      }
    } catch (error) {
      console.error('レシピ食材関連取得エラー:', error)
      return {
        success: false,
        message: `レシピ食材関連取得エラー: ${error}`
      }
    }
  }

  /**
   * Webストレージからレシピデータを取得
   */
  public getRecipesFromWebStorage(): DatabaseResult {
    try {
      // レシピ機能は未実装のため、空のデータを返す
      // const localResult = this.webStorageManager.getRecipesFromLocal()
      // const sessionResult = this.webStorageManager.getRecipesFromSession()

      return {
        success: true,
        message: 'Webストレージにレシピが見つかりませんでした',
        data: []
      }
    } catch (error) {
      return {
        success: false,
        message: `Webストレージ取得エラー: ${error}`
      }
    }
  }

  /**
   * Webストレージからレシピ食材関連データを取得
   */
  public getRecipeIngredientsFromWebStorage(recipeId?: number): DatabaseResult {
    try {
      // レシピ機能は未実装のため、空のデータを返す
      // const localResult = this.webStorageManager.getRecipeIngredientsFromLocal()
      // const sessionResult = this.webStorageManager.getRecipeIngredientsFromSession()

      return {
        success: true,
        message: 'Webストレージにレシピ食材関連データが見つかりませんでした',
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
