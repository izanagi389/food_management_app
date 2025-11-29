import type { Food, Category, Recipe, DatabaseResult, Ingredient, IngredientWithCategory, RecipeIngredient, RecipeIngredientWithDetails, HealthRecord, HealthStatistics, BMIResult, CalorieCalculationInput, CalorieCalculationResult, UserProfile } from '~/types'
import { WebStorageManager } from './WebStorageManager'
import { DatabaseConnection } from '../database/DatabaseConnection'
import { TableManager } from '../database/TableManager'
import { IngredientManager } from './IngredientManager'
import { CategoryManager } from './CategoryManager'
import { RecipeManager } from './RecipeManager'
import { HealthManager } from './HealthManager'
import { ProfileManager } from './ProfileManager'

/**
 * SQLiteデータベース管理クラス（ファサードパターン）
 * 各機能別のマネージャークラスを統合して提供
 * 食材、カテゴリ、レシピ、健康データ、プロファイルの管理を統括
 */
export class SQLiteManager {
  private static instance: SQLiteManager
  private databaseName = 'food_management.db'
  private isWebPlatform: boolean
  private webStorageManager: WebStorageManager
  private connection: DatabaseConnection
  private tableManager: TableManager
  private ingredientManager: IngredientManager
  private categoryManager: CategoryManager
  private recipeManager: RecipeManager
  private healthManager: HealthManager
  private profileManager: ProfileManager

  private constructor() {
    this.isWebPlatform = DatabaseConnection.detectPlatform()
    this.webStorageManager = WebStorageManager.getInstance()
    this.connection = new DatabaseConnection(this.databaseName, this.isWebPlatform)
    this.tableManager = new TableManager(this.databaseName, this.isWebPlatform)
    this.ingredientManager = new IngredientManager(this.databaseName, this.isWebPlatform, this.webStorageManager)
    this.categoryManager = new CategoryManager(this.databaseName, this.isWebPlatform, this.webStorageManager)
    this.recipeManager = new RecipeManager(this.databaseName, this.isWebPlatform, this.webStorageManager)
    this.healthManager = new HealthManager(this.databaseName, this.isWebPlatform, this.webStorageManager)
    this.profileManager = new ProfileManager(this.databaseName, this.isWebPlatform, this.webStorageManager)
  }

  /**
   * シングルトンインスタンスを取得
   * @returns SQLiteManagerのインスタンス
   */
  public static getInstance(): SQLiteManager {
    if (!SQLiteManager.instance) {
      SQLiteManager.instance = new SQLiteManager()
    }
    return SQLiteManager.instance
  }

  // ==================== データベース接続関連 ====================

  /**
   * データベース接続を作成・開く
   */
  async createConnection(): Promise<DatabaseResult> {
    try {
      const result = await this.connection.createConnection()
      if (result.success) {
        // テーブルを作成
        const tableResult = await this.tableManager.createTables()
        if (!tableResult.success) {
          console.error('テーブル作成エラー:', tableResult.message)
          return tableResult
        }
      }
      return result
    } catch (error) {
      console.error('接続エラー:', error)
      return {
        success: false,
        message: `接続エラー: ${error}`
      }
    }
  }

  /**
   * データベース接続を閉じる
   */
  async closeConnection(): Promise<DatabaseResult> {
    return await this.connection.closeConnection()
  }

  /**
   * 接続状態を取得
   */
  getConnectionStatus(): boolean {
    return this.connection.getConnectionStatus()
  }

  /**
   * データベース接続とテーブル存在を確認し、必要に応じて初期化
   */
  async ensureDatabaseReady(): Promise<DatabaseResult> {
    return await this.connection.ensureDatabaseReady(() => this.tableManager.createTables())
  }

  /**
   * データベースをリセット（全テーブル削除）
   */
  async resetDatabase(): Promise<DatabaseResult> {
    return await this.connection.resetDatabase()
  }

  /**
   * プラットフォーム情報を取得
   */
  public getPlatformInfo(): {
    isWebPlatform: boolean
    platform: string
    canUseSQLite: boolean
  } {
    return this.connection.getPlatformInfo()
  }

  /**
   * ProfileManagerのデバッグコールバックを設定
   */
  setProfileManagerDebugCallback(callback: (message: string) => void): void {
    this.profileManager.setDebugLogCallback(callback)
  }

  // ==================== テーブル管理関連 ====================

  /**
   * 全てのテーブルを作成
   */
  async createTables(): Promise<DatabaseResult> {
    return await this.tableManager.createTables()
  }

  /**
   * データベーススキーマを更新
   */
  async updateDatabaseSchema(): Promise<DatabaseResult> {
    return await this.tableManager.updateDatabaseSchema()
  }

  /**
   * テーブルが存在するかチェック
   */
  async checkTablesExist(): Promise<DatabaseResult> {
    return await this.connection.checkTablesExist()
  }

  // ==================== 食材管理関連 ====================

  /**
   * 食品データを追加
   */
  async insertFood(food: Food): Promise<DatabaseResult> {
    return await this.ingredientManager.insertFood(food)
  }

  /**
   * 複数の食品データを一括追加
   */
  async insertMultipleFoods(foods: Food[]): Promise<DatabaseResult> {
    return await this.ingredientManager.insertMultipleFoods(foods)
  }

  /**
   * 全ての食品データを取得（カテゴリ情報付き）
   */
  async getAllFoods(): Promise<DatabaseResult> {
    return await this.ingredientManager.getAllFoods()
  }

  /**
   * IDで食品データを取得
   */
  async getFoodById(id: number): Promise<DatabaseResult> {
    return await this.ingredientManager.getFoodById(id)
  }

  /**
   * 食品データを更新
   */
  async updateFood(id: number, food: Partial<Food>): Promise<DatabaseResult> {
    return await this.ingredientManager.updateFood(id, food)
  }

  /**
   * 食品データを削除
   */
  async deleteFood(id: number): Promise<DatabaseResult> {
    return await this.ingredientManager.deleteFood(id)
  }

  /**
   * 全ての食品データを削除
   */
  async deleteAllFoods(): Promise<DatabaseResult> {
    return await this.ingredientManager.deleteAllFoods()
  }

  /**
   * Webストレージから食品データを取得
   */
  public getFoodsFromWebStorage(): DatabaseResult {
    return this.ingredientManager.getFoodsFromWebStorage()
  }

  // ==================== カテゴリ管理関連 ====================

  /**
   * カテゴリを追加
   */
  async insertCategory(category: Category): Promise<DatabaseResult> {
    return await this.categoryManager.insertCategory(category)
  }

  /**
   * 全てのカテゴリを取得
   */
  async getAllCategories(): Promise<DatabaseResult> {
    return await this.categoryManager.getAllCategories()
  }

  /**
   * カテゴリを削除
   */
  async deleteCategory(id: number): Promise<DatabaseResult> {
    return await this.categoryManager.deleteCategory(id)
  }

  /**
   * 初期カテゴリデータを挿入
   */
  async insertInitialCategories(): Promise<DatabaseResult> {
    return await this.categoryManager.insertInitialCategories()
  }

  /**
   * Webストレージからカテゴリデータを取得
   */
  public getCategoriesFromWebStorage(): DatabaseResult {
    return this.categoryManager.getCategoriesFromWebStorage()
  }

  // ==================== レシピ管理関連 ====================

  /**
   * レシピを追加
   */
  async insertRecipe(recipe: Recipe): Promise<DatabaseResult> {
    return await this.recipeManager.insertRecipe(recipe)
  }

  /**
   * 全てのレシピを取得
   */
  async getAllRecipes(): Promise<DatabaseResult> {
    return await this.recipeManager.getAllRecipes()
  }

  /**
   * レシピを更新
   */
  async updateRecipe(id: number, recipe: Partial<Recipe>): Promise<DatabaseResult> {
    return await this.recipeManager.updateRecipe(id, recipe)
  }

  /**
   * レシピを削除
   */
  async deleteRecipe(id: number): Promise<DatabaseResult> {
    return await this.recipeManager.deleteRecipe(id)
  }

  /**
   * Webストレージからレシピデータを取得
   */
  public getRecipesFromWebStorage(): DatabaseResult {
    return this.recipeManager.getRecipesFromWebStorage()
  }

  // ==================== レシピ食材関連管理 ====================

  /**
   * レシピに食材を関連付ける
   */
  async addIngredientToRecipe(recipeId: number, ingredientId: number, quantity?: number, unit?: string, notes?: string): Promise<DatabaseResult> {
    return await this.recipeManager.addIngredientToRecipe(recipeId, ingredientId, quantity, unit, notes)
  }

  /**
   * レシピから食材の関連付けを削除
   */
  async removeIngredientFromRecipe(recipeId: number, ingredientId: number): Promise<DatabaseResult> {
    return await this.recipeManager.removeIngredientFromRecipe(recipeId, ingredientId)
  }

  /**
   * レシピの食材関連付けを取得
   */
  async getRecipeIngredients(recipeId: number): Promise<DatabaseResult> {
    return await this.recipeManager.getRecipeIngredients(recipeId)
  }

  /**
   * Webストレージからレシピ食材関連データを取得
   */
  public getRecipeIngredientsFromWebStorage(recipeId?: number): DatabaseResult {
    return this.recipeManager.getRecipeIngredientsFromWebStorage(recipeId)
  }

  // ==================== Webストレージ関連 ====================

  /**
   * Webストレージの同期状態を取得
   */
  public getWebStorageSyncStatus(): {
    hasLocalData: boolean
    hasSessionData: boolean
    lastSyncTime?: string
    storageAvailability: {
      localStorage: boolean
      sessionStorage: boolean
    }
  } {
    const syncStatus = this.webStorageManager.getSyncStatus()
    const availability = this.webStorageManager.checkStorageAvailability()

    return {
      ...syncStatus,
      storageAvailability: availability
    }
  }

  /**
   * Webストレージをクリア
   */
  public clearWebStorage(): DatabaseResult {
    try {
      const localResult = this.webStorageManager.clearLocalStorage()
      const sessionResult = this.webStorageManager.clearSessionStorage()

      if (localResult.success && sessionResult.success) {
        return {
          success: true,
          message: 'Webストレージをクリアしました'
        }
      } else {
        return {
          success: false,
          message: `Webストレージクリアエラー: ${localResult.message}, ${sessionResult.message}`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Webストレージクリアエラー: ${error}`
      }
    }
  }

  // ==================== アプリ初期化関連 ====================

  /**
   * アプリ起動時の初期化処理
   * DBとテーブルが存在しない場合に作成し、初期データを挿入
   */
  async initializeApp(): Promise<DatabaseResult> {
    try {
      console.log('アプリ初期化を開始...')
      
      // Webプラットフォームの場合は初期化をスキップ
      if (this.isWebPlatform) {
        console.log('Webプラットフォームのため、SQLite初期化をスキップします')
        return {
          success: true,
          message: 'Webプラットフォーム: SQLite初期化をスキップしました'
        }
      }
      
      // データベース接続を作成（テーブル作成も含む）
      const connectionResult = await this.createConnection()
      if (!connectionResult.success) {
        console.error('データベース接続に失敗:', connectionResult.message)
        return connectionResult
      }
      
      console.log('データベース接続とテーブル作成が完了しました')
      
      // テーブルが正しく作成されたか確認
      const tableCheckResult = await this.checkTablesExist()
      if (!tableCheckResult.success) {
        console.error('テーブル確認に失敗:', tableCheckResult.message)
        return tableCheckResult
      }
      
      console.log('テーブルの存在確認が完了しました')
      
      // スキーマ更新を実行
      const schemaUpdateResult = await this.updateDatabaseSchema()
      if (!schemaUpdateResult.success) {
        console.error('スキーマ更新に失敗:', schemaUpdateResult.message)
        return schemaUpdateResult
      }
      
      console.log('スキーマ更新が完了しました')
      
      // 既存のカテゴリを確認
      const categoriesResult = await this.getAllCategories()
      if (!categoriesResult.success) {
        console.error('カテゴリ取得に失敗:', categoriesResult.message)
        return categoriesResult
      }
      
      // カテゴリが存在しない場合は初期カテゴリを挿入
      if (!categoriesResult.data || categoriesResult.data.length === 0) {
        console.log('初期カテゴリが存在しないため、初期カテゴリを挿入します')
        const initialCategoriesResult = await this.insertInitialCategories()
        if (!initialCategoriesResult.success) {
          console.error('初期カテゴリ挿入に失敗:', initialCategoriesResult.message)
          return initialCategoriesResult
        }
        console.log('初期カテゴリの挿入が完了しました')
      } else {
        console.log(`既存のカテゴリが ${categoriesResult.data.length} 件見つかりました`)
      }
      
      console.log('アプリ初期化が完了しました')
      
      return {
        success: true,
        message: 'アプリの初期化が完了しました'
      }
    } catch (error) {
      console.error('アプリ初期化エラー:', error)
      return {
        success: false,
        message: `アプリ初期化エラー: ${error}`
      }
    }
  }

  /**
   * テストデータを挿入
   */
  async insertTestData(): Promise<DatabaseResult> {
    // まずカテゴリを取得
    const categoriesResponse = await this.getAllCategories()
    if (!categoriesResponse.success || !categoriesResponse.data || categoriesResponse.data.length === 0) {
        return {
          success: false,
        message: 'カテゴリが存在しません。先にカテゴリを作成してください。'
      }
    }
    
    // カテゴリIDをマッピング
    const categoryMap = new Map()
    categoriesResponse.data.forEach((cat: any) => {
      categoryMap.set(cat.name, cat.id)
    })
    
    const testData: Food[] = [
      { name: 'りんご', category_id: categoryMap.get('果物') || 1 },
      { name: '牛乳', category_id: categoryMap.get('乳製品') || 2 },
      { name: 'パン', category_id: categoryMap.get('穀物') || 3 }
    ]
    
    return await this.insertMultipleFoods(testData)
  }

  /**
   * Webプラットフォーム用の初期データを作成
   */
  public createInitialWebData(): DatabaseResult {
    try {
      if (!this.isWebPlatform) {
        return {
          success: false,
          message: 'Webプラットフォームではありません'
        }
      }

      // 初期カテゴリを作成
      const initialCategories = [
        { id: 1, name: '果物', created_at: new Date().toISOString() },
        { id: 2, name: '野菜', created_at: new Date().toISOString() },
        { id: 3, name: '肉類', created_at: new Date().toISOString() },
        { id: 4, name: '魚類', created_at: new Date().toISOString() },
        { id: 5, name: '乳製品', created_at: new Date().toISOString() },
        { id: 6, name: '穀物', created_at: new Date().toISOString() },
        { id: 7, name: '調味料', created_at: new Date().toISOString() },
        { id: 8, name: 'その他', created_at: new Date().toISOString() }
      ]

      // Webストレージに保存
      this.webStorageManager.saveCategoriesToLocal(initialCategories)
      this.webStorageManager.saveCategoriesToSession(initialCategories)
      this.webStorageManager.saveLastSyncTime()
      
      return {
        success: true,
        message: 'Webプラットフォーム用の初期データを作成しました',
        data: initialCategories
      }
    } catch (error) {
      return {
        success: false,
        message: `初期データ作成エラー: ${error}`
      }
    }
  }

  // ==================== 健康管理関連 ====================

  /**
   * 健康記録を追加
   */
  async insertHealthRecord(record: HealthRecord): Promise<DatabaseResult<HealthRecord>> {
    return await this.healthManager.insertHealthRecord(record)
  }

  /**
   * 全ての健康記録を取得
   */
  async getAllHealthRecords(): Promise<DatabaseResult<HealthRecord[]>> {
    return await this.healthManager.getAllHealthRecords()
  }

  /**
   * 健康記録を更新
   */
  async updateHealthRecord(id: number, record: Partial<HealthRecord>): Promise<DatabaseResult<void>> {
    return await this.healthManager.updateHealthRecord(id, record)
  }

  /**
   * 健康記録を削除
   */
  async deleteHealthRecord(id: number): Promise<DatabaseResult<void>> {
    return await this.healthManager.deleteHealthRecord(id)
  }

  /**
   * BMIを計算
   */
  calculateBMI(weight: number, height: number): BMIResult {
    return this.healthManager.calculateBMI(weight, height)
  }

  /**
   * 必要カロリーを計算
   */
  calculateCalories(input: CalorieCalculationInput): CalorieCalculationResult {
    return this.healthManager.calculateCalories(input)
  }

  /**
   * 健康統計データを取得
   */
  async getHealthStatistics(dateFrom?: string, dateTo?: string): Promise<DatabaseResult<HealthStatistics>> {
    return await this.healthManager.getHealthStatistics(dateFrom, dateTo)
  }

  // ==================== プロファイル管理関連 ====================

  /**
   * プロファイルを保存
   */
  async saveProfile(profile: UserProfile): Promise<DatabaseResult<UserProfile>> {
    return await this.profileManager.saveProfile(profile)
  }

  /**
   * プロファイルを取得
   */
  async getProfile(): Promise<DatabaseResult<UserProfile | null>> {
    return await this.profileManager.getProfile()
  }

  /**
   * プロファイルを削除
   */
  async deleteProfile(): Promise<DatabaseResult<boolean>> {
    return await this.profileManager.deleteProfile()
  }

}
