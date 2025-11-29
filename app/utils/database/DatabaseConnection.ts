import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { DatabaseResult } from '~/types'
import { DatabaseUtils } from './DatabaseUtils'

/**
 * データベース接続管理クラス
 * SQLiteデータベースの接続、切断、状態管理を行う
 */
export class DatabaseConnection {
  private databaseName: string
  private isConnected: boolean
  private isWebPlatform: boolean

  constructor(databaseName: string, isWebPlatform: boolean) {
    this.databaseName = databaseName
    this.isWebPlatform = isWebPlatform
    this.isConnected = false
  }

  /**
   * プラットフォームを検出
   * @returns Webプラットフォームかどうか
   */
  static detectPlatform(): boolean {
    return DatabaseUtils.isWebPlatform()
  }

  /**
   * データベース接続を作成・開く
   */
  async createConnection(): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', 'データベース接続を作成中...')
      
      // Webプラットフォームの場合はSQLite接続をスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、SQLite接続をスキップします')
        this.isConnected = false
        return DatabaseUtils.createSuccessResult(null, 'Webプラットフォーム: SQLite接続をスキップしました')
      }
      
      // 既存の接続を閉じる
      try {
        await CapacitorSQLite.closeConnection({
          database: this.databaseName
        })
      } catch (e) {
        // 接続が存在しない場合は無視
      }
      
      // 新しい接続を作成
      const response = await CapacitorSQLite.createConnection({
        database: this.databaseName,
        version: 1,
        readonly: false
      })
      
      DatabaseUtils.log('info', '接続作成結果:', response)
      
      // 接続を開く
      await CapacitorSQLite.open({
        database: this.databaseName
      })
      
      this.isConnected = true
      
      return DatabaseUtils.createSuccessResult(null, 'データベース接続が作成されました')
    } catch (error) {
      DatabaseUtils.log('error', '接続エラー:', error)
      return DatabaseUtils.createErrorResult(`接続エラー: ${error}`)
    }
  }

  /**
   * データベース接続を閉じる
   */
  async closeConnection(): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', '接続を終了中...')
      
      // Webプラットフォームの場合は接続終了をスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、接続終了をスキップします')
        this.isConnected = false
        return {
          success: true,
          message: 'Webプラットフォーム: 接続終了をスキップしました'
        }
      }
      
      await CapacitorSQLite.closeConnection({
        database: this.databaseName
      })
      
      this.isConnected = false
      
      return {
        success: true,
        message: '接続が終了しました'
      }
    } catch (error) {
      DatabaseUtils.log('error', '接続終了エラー:', error)
      // Webプラットフォームでのエラーの場合は警告として扱う
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームでの接続終了エラーを無視します')
        this.isConnected = false
        return {
          success: true,
          message: 'Webプラットフォーム: 接続終了エラーを無視しました'
        }
      }
      return {
        success: false,
        message: `接続終了エラー: ${error}`
      }
    }
  }

  /**
   * 接続状態を取得
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * データベース接続とテーブル存在を確認し、必要に応じて初期化
   */
  async ensureDatabaseReady(createTablesCallback: () => Promise<DatabaseResult>): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', 'データベースの準備状態を確認中...')
      
      // Webプラットフォームの場合はデータベース準備をスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、データベース準備をスキップします')
        return {
          success: true,
          message: 'Webプラットフォーム: データベース準備をスキップしました'
        }
      }
      
      // 接続状態を確認
      if (!this.isConnected) {
        DatabaseUtils.log('info', 'データベースが接続されていません。接続を試行します...')
        const connectionResult = await this.createConnection()
        if (!connectionResult.success) {
          return connectionResult
        }
      }
      
      // テーブル存在を確認
      const tableCheckResult = await this.checkTablesExist()
      if (!tableCheckResult.success) {
        DatabaseUtils.log('info', 'テーブルが存在しません。テーブルを作成します...')
        const tableCreateResult = await createTablesCallback()
        if (!tableCreateResult.success) {
          return tableCreateResult
        }
      }
      
      DatabaseUtils.log('info', 'データベースの準備が完了しました')
      return {
        success: true,
        message: 'データベースの準備が完了しました'
      }
    } catch (error) {
      DatabaseUtils.log('error', 'データベース準備エラー:', error)
      return {
        success: false,
        message: `データベース準備エラー: ${error}`
      }
    }
  }

  /**
   * テーブルが存在するかチェック
   */
  async checkTablesExist(): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', 'テーブルの存在を確認中...')
      
      // Webプラットフォームの場合はテーブル存在確認をスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、テーブル存在確認をスキップします')
        return {
          success: true,
          message: 'Webプラットフォーム: テーブル存在確認をスキップしました'
        }
      }
      
      // categoriesテーブルの存在確認
      const categoriesCheck = await CapacitorSQLite.query({
        database: this.databaseName,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name='categories'",
        values: []
      })
      
      // ingredientsテーブルの存在確認
      const ingredientsCheck = await CapacitorSQLite.query({
        database: this.databaseName,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients'",
        values: []
      })
      
      // recipesテーブルの存在確認
      const recipesCheck = await CapacitorSQLite.query({
        database: this.databaseName,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name='recipes'",
        values: []
      })
      
      // recipe_ingredientsテーブルの存在確認
      const recipeIngredientsCheck = await CapacitorSQLite.query({
        database: this.databaseName,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_ingredients'",
        values: []
      })
      
      DatabaseUtils.log('info', 'categoriesテーブル確認結果:', categoriesCheck)
      DatabaseUtils.log('info', 'ingredientsテーブル確認結果:', ingredientsCheck)
      DatabaseUtils.log('info', 'recipesテーブル確認結果:', recipesCheck)
      DatabaseUtils.log('info', 'recipe_ingredientsテーブル確認結果:', recipeIngredientsCheck)
      
      const categoriesExists = categoriesCheck?.values && categoriesCheck.values.length > 0
      const ingredientsExists = ingredientsCheck?.values && ingredientsCheck.values.length > 0
      const recipesExists = recipesCheck?.values && recipesCheck.values.length > 0
      const recipeIngredientsExists = recipeIngredientsCheck?.values && recipeIngredientsCheck.values.length > 0
      
      if (!categoriesExists || !ingredientsExists || !recipesExists || !recipeIngredientsExists) {
        DatabaseUtils.log('error', 'テーブルが存在しません:', {
          categories: categoriesExists,
          ingredients: ingredientsExists,
          recipes: recipesExists,
          recipe_ingredients: recipeIngredientsExists
        })
        return {
          success: false,
          message: `テーブルが存在しません: categories=${categoriesExists}, ingredients=${ingredientsExists}, recipes=${recipesExists}, recipe_ingredients=${recipeIngredientsExists}`
        }
      }
      
      return {
        success: true,
        message: '全てのテーブルが存在します'
      }
    } catch (error) {
      DatabaseUtils.log('error', 'テーブル確認エラー:', error)
      return {
        success: false,
        message: `テーブル確認エラー: ${error}`
      }
    }
  }

  /**
   * データベースをリセット（全テーブル削除）
   */
  async resetDatabase(): Promise<DatabaseResult> {
    try {
      DatabaseUtils.log('info', 'データベースをリセット中...')
      
      // Webプラットフォームの場合はデータベースリセットをスキップ
      if (this.isWebPlatform) {
        DatabaseUtils.log('info', 'Webプラットフォームのため、データベースリセットをスキップします')
        return {
          success: true,
          message: 'Webプラットフォーム: データベースリセットをスキップしました'
        }
      }
      
      // 既存のテーブルを削除
      const dropIngredientsQuery = 'DROP TABLE IF EXISTS ingredients'
      const dropCategoriesQuery = 'DROP TABLE IF EXISTS categories'
      const dropRecipesQuery = 'DROP TABLE IF EXISTS recipes'
      const dropRecipeIngredientsQuery = 'DROP TABLE IF EXISTS recipe_ingredients'
      
      await CapacitorSQLite.run({
        database: this.databaseName,
        statement: dropIngredientsQuery,
        values: []
      })
      
      await CapacitorSQLite.run({
        database: this.databaseName,
        statement: dropCategoriesQuery,
        values: []
      })
      
      await CapacitorSQLite.run({
        database: this.databaseName,
        statement: dropRecipesQuery,
        values: []
      })
      
      await CapacitorSQLite.run({
        database: this.databaseName,
        statement: dropRecipeIngredientsQuery,
        values: []
      })
      
      DatabaseUtils.log('info', 'データベースリセット完了')
      
      return {
        success: true,
        message: 'データベースがリセットされました'
      }
    } catch (error) {
      DatabaseUtils.log('error', 'データベースリセットエラー:', error)
      return {
        success: false,
        message: `データベースリセットエラー: ${error}`
      }
    }
  }

  /**
   * プラットフォーム情報を取得
   */
  getPlatformInfo(): {
    isWebPlatform: boolean
    platform: string
    canUseSQLite: boolean
  } {
    return {
      isWebPlatform: this.isWebPlatform,
      platform: this.isWebPlatform ? 'Web' : 'Native',
      canUseSQLite: !this.isWebPlatform
    }
  }
}
