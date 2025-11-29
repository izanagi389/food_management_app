import type { Food, Category, FoodWithCategory, HealthRecord, UserProfile } from '~/types'

export interface StorageResult<T = any> {
  success: boolean
  data?: T
  message: string
}

export class WebStorageManager {
  private static instance: WebStorageManager
  private readonly FOODS_KEY = 'food_management_foods'
  private readonly CATEGORIES_KEY = 'food_management_categories'
  private readonly HEALTH_RECORDS_KEY = 'food_management_health_records'
  private readonly USER_PROFILE_KEY = 'food_management_user_profile'
  private readonly LAST_SYNC_KEY = 'food_management_last_sync'
  private debugLogCallback?: (message: string) => void

  private constructor() {}

  public static getInstance(): WebStorageManager {
    if (!WebStorageManager.instance) {
      WebStorageManager.instance = new WebStorageManager()
    }
    return WebStorageManager.instance
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
  private addDebugLog(message: string): void {
    if (this.debugLogCallback) {
      this.debugLogCallback(message)
    } else {
      console.log(message)
    }
  }

  /**
   * ローカルストレージが利用可能かチェック
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * セッションストレージが利用可能かチェック
   */
  private isSessionStorageAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * データをローカルストレージに保存
   */
  private setLocalStorageItem(key: string, value: any): StorageResult {
    try {
      this.addDebugLog(`WebStorageManager: ローカルストレージに保存中 (key: ${key})`)
      this.addDebugLog(`WebStorageManager: 保存する値: ${JSON.stringify(value)}`)
      
      if (!this.isLocalStorageAvailable()) {
        this.addDebugLog('WebStorageManager: ローカルストレージが利用できません')
        return {
          success: false,
          message: 'ローカルストレージが利用できません'
        }
      }

      const serializedValue = JSON.stringify(value)
      this.addDebugLog(`WebStorageManager: シリアライズされた値 (${key}): ${serializedValue}`)
      
      localStorage.setItem(key, serializedValue)
      this.addDebugLog(`WebStorageManager: ローカルストレージに保存完了 (${key})`)
      
      return {
        success: true,
        message: 'ローカルストレージに保存しました'
      }
    } catch (error) {
      this.addDebugLog(`WebStorageManager: ローカルストレージ保存エラー (${key}): ${error}`)
      return {
        success: false,
        message: `ローカルストレージ保存エラー: ${error}`
      }
    }
  }

  /**
   * データをローカルストレージから取得
   */
  private getLocalStorageItem<T>(key: string): StorageResult<T> {
    try {
      this.addDebugLog(`WebStorageManager: ローカルストレージから取得中 (key: ${key})`)
      
      if (!this.isLocalStorageAvailable()) {
        this.addDebugLog('WebStorageManager: ローカルストレージが利用できません')
        return {
          success: false,
          message: 'ローカルストレージが利用できません'
        }
      }

      const item = localStorage.getItem(key)
      this.addDebugLog(`WebStorageManager: 取得したアイテム (${key}): ${item}`)
      
      if (item === null) {
        this.addDebugLog(`WebStorageManager: データが見つかりません (${key})`)
        return {
          success: true,
          data: undefined,
          message: 'データが見つかりません'
        }
      }

      const parsedValue = JSON.parse(item)
      this.addDebugLog(`WebStorageManager: パースされたデータ (${key}): ${JSON.stringify(parsedValue)}`)
      return {
        success: true,
        data: parsedValue,
        message: 'データを取得しました'
      }
    } catch (error) {
      this.addDebugLog(`WebStorageManager: ローカルストレージ取得エラー (${key}): ${error}`)
      return {
        success: false,
        message: `ローカルストレージ取得エラー: ${error}`
      }
    }
  }

  /**
   * データをセッションストレージに保存
   */
  private setSessionStorageItem(key: string, value: any): StorageResult {
    try {
      if (!this.isSessionStorageAvailable()) {
        return {
          success: false,
          message: 'セッションストレージが利用できません'
        }
      }

      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
      
      return {
        success: true,
        message: 'セッションストレージに保存しました'
      }
    } catch (error) {
      return {
        success: false,
        message: `セッションストレージ保存エラー: ${error}`
      }
    }
  }

  /**
   * データをセッションストレージから取得
   */
  private getSessionStorageItem<T>(key: string): StorageResult<T> {
    try {
      if (!this.isSessionStorageAvailable()) {
        return {
          success: false,
          message: 'セッションストレージが利用できません'
        }
      }

      const item = sessionStorage.getItem(key)
      if (item === null) {
        return {
          success: true,
          data: undefined,
          message: 'データが見つかりません'
        }
      }

      const parsedValue = JSON.parse(item)
      return {
        success: true,
        data: parsedValue,
        message: 'データを取得しました'
      }
    } catch (error) {
      return {
        success: false,
        message: `セッションストレージ取得エラー: ${error}`
      }
    }
  }

  /**
   * 食品データをローカルストレージに保存
   */
  public saveFoodsToLocal(foods: FoodWithCategory[]): StorageResult {
    return this.setLocalStorageItem(this.FOODS_KEY, foods)
  }

  /**
   * 食品データをローカルストレージから取得
   */
  public getFoodsFromLocal(): StorageResult<FoodWithCategory[]> {
    return this.getLocalStorageItem<FoodWithCategory[]>(this.FOODS_KEY)
  }

  /**
   * カテゴリデータをローカルストレージに保存
   */
  public saveCategoriesToLocal(categories: Category[]): StorageResult {
    return this.setLocalStorageItem(this.CATEGORIES_KEY, categories)
  }

  /**
   * カテゴリデータをローカルストレージから取得
   */
  public getCategoriesFromLocal(): StorageResult<Category[]> {
    return this.getLocalStorageItem<Category[]>(this.CATEGORIES_KEY)
  }

  /**
   * 食品データをセッションストレージに保存
   */
  public saveFoodsToSession(foods: FoodWithCategory[]): StorageResult {
    return this.setSessionStorageItem(this.FOODS_KEY, foods)
  }

  /**
   * 食品データをセッションストレージから取得
   */
  public getFoodsFromSession(): StorageResult<FoodWithCategory[]> {
    return this.getSessionStorageItem<FoodWithCategory[]>(this.FOODS_KEY)
  }

  /**
   * カテゴリデータをセッションストレージに保存
   */
  public saveCategoriesToSession(categories: Category[]): StorageResult {
    return this.setSessionStorageItem(this.CATEGORIES_KEY, categories)
  }

  /**
   * カテゴリデータをセッションストレージから取得
   */
  public getCategoriesFromSession(): StorageResult<Category[]> {
    return this.getSessionStorageItem<Category[]>(this.CATEGORIES_KEY)
  }

  /**
   * 最後の同期時刻を保存
   */
  public saveLastSyncTime(): StorageResult {
    const now = new Date().toISOString()
    return this.setLocalStorageItem(this.LAST_SYNC_KEY, now)
  }

  /**
   * 最後の同期時刻を取得
   */
  public getLastSyncTime(): StorageResult<string> {
    return this.getLocalStorageItem<string>(this.LAST_SYNC_KEY)
  }

  /**
   * 健康記録をローカルストレージに保存
   */
  public saveHealthRecords(records: HealthRecord[]): void {
    this.setLocalStorageItem(this.HEALTH_RECORDS_KEY, records)
  }

  /**
   * 健康記録をローカルストレージから取得
   */
  public getHealthRecords(): HealthRecord[] {
    const result = this.getLocalStorageItem<HealthRecord[]>(this.HEALTH_RECORDS_KEY)
    return result.success && result.data ? result.data : []
  }

  /**
   * ユーザープロファイルをローカルストレージに保存
   */
  public saveUserProfile(profile: UserProfile): void {
    this.addDebugLog('WebStorageManager: プロファイルを保存中...')
    this.addDebugLog(`WebStorageManager: 保存するデータ: ${JSON.stringify(profile)}`)
    this.addDebugLog(`WebStorageManager: データの型チェック: ${JSON.stringify({
      id: typeof profile.id,
      name: typeof profile.name,
      age: typeof profile.age,
      gender: typeof profile.gender,
      height: typeof profile.height,
      weight: typeof profile.weight,
      target_weight: typeof profile.target_weight
    })}`)
    
    const result = this.setLocalStorageItem(this.USER_PROFILE_KEY, profile)
    this.addDebugLog(`WebStorageManager: 保存結果: ${JSON.stringify(result)}`)
    
    // 保存直後に取得して確認
    const verification = this.getUserProfile()
    this.addDebugLog(`WebStorageManager: 保存後の確認: ${JSON.stringify(verification)}`)
  }

  /**
   * ユーザープロファイルをローカルストレージから取得
   */
  public getUserProfile(): UserProfile | null {
    this.addDebugLog('WebStorageManager: プロファイルを取得中...')
    const result = this.getLocalStorageItem<UserProfile>(this.USER_PROFILE_KEY)
    this.addDebugLog(`WebStorageManager: 取得結果: ${JSON.stringify(result)}`)
    
    if (result.success && result.data) {
      this.addDebugLog(`WebStorageManager: プロファイルデータを取得しました: ${JSON.stringify(result.data)}`)
      return result.data
    } else {
      this.addDebugLog('WebStorageManager: プロファイルデータが見つかりません')
      return null
    }
  }

  /**
   * ユーザープロファイルをローカルストレージから削除
   */
  public deleteUserProfile(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.USER_PROFILE_KEY)
    }
  }

  /**
   * ローカルストレージの全データをクリア
   */
  public clearLocalStorage(): StorageResult {
    try {
      if (!this.isLocalStorageAvailable()) {
        return {
          success: false,
          message: 'ローカルストレージが利用できません'
        }
      }

      localStorage.removeItem(this.FOODS_KEY)
      localStorage.removeItem(this.CATEGORIES_KEY)
      localStorage.removeItem(this.HEALTH_RECORDS_KEY)
      localStorage.removeItem(this.USER_PROFILE_KEY)
      localStorage.removeItem(this.LAST_SYNC_KEY)
      
      return {
        success: true,
        message: 'ローカルストレージをクリアしました'
      }
    } catch (error) {
      return {
        success: false,
        message: `ローカルストレージクリアエラー: ${error}`
      }
    }
  }

  /**
   * セッションストレージの全データをクリア
   */
  public clearSessionStorage(): StorageResult {
    try {
      if (!this.isSessionStorageAvailable()) {
        return {
          success: false,
          message: 'セッションストレージが利用できません'
        }
      }

      sessionStorage.removeItem(this.FOODS_KEY)
      sessionStorage.removeItem(this.CATEGORIES_KEY)
      sessionStorage.removeItem(this.HEALTH_RECORDS_KEY)
      sessionStorage.removeItem(this.USER_PROFILE_KEY)
      
      return {
        success: true,
        message: 'セッションストレージをクリアしました'
      }
    } catch (error) {
      return {
        success: false,
        message: `セッションストレージクリアエラー: ${error}`
      }
    }
  }

  /**
   * ストレージの利用可能性をチェック
   */
  public checkStorageAvailability(): {
    localStorage: boolean
    sessionStorage: boolean
  } {
    return {
      localStorage: this.isLocalStorageAvailable(),
      sessionStorage: this.isSessionStorageAvailable()
    }
  }

  /**
   * データの同期状態を取得
   */
  public getSyncStatus(): {
    hasLocalData: boolean
    hasSessionData: boolean
    lastSyncTime?: string
  } {
    const localFoods = this.getFoodsFromLocal()
    const sessionFoods = this.getFoodsFromSession()
    const lastSync = this.getLastSyncTime()

    return {
      hasLocalData: localFoods.success && localFoods.data !== undefined,
      hasSessionData: sessionFoods.success && sessionFoods.data !== undefined,
      lastSyncTime: lastSync.success ? lastSync.data : undefined
    }
  }
}
