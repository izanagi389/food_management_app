/**
 * キャッシュ管理クラス
 * データベースクエリ結果のキャッシュ機能を提供
 */
export class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5分

  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   * @returns CacheManagerのインスタンス
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * キャッシュにデータを保存
   * @param key キャッシュキー
   * @param data 保存するデータ
   * @param ttl 生存時間（ミリ秒）
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * キャッシュからデータを取得
   * @param key キャッシュキー
   * @returns キャッシュされたデータまたはnull
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      return null
    }

    // TTLチェック
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * キャッシュからデータを削除
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 特定のパターンにマッチするキャッシュを削除
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 全キャッシュをクリア
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 期限切れのキャッシュをクリーンアップ
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * キャッシュ統計を取得
   */
  getStats(): {
    totalEntries: number
    expiredEntries: number
    memoryUsage: number
  } {
    const now = Date.now()
    let expiredEntries = 0
    let memoryUsage = 0

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        expiredEntries++
      }
      memoryUsage += key.length + JSON.stringify(cached.data).length
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries,
      memoryUsage
    }
  }

  /**
   * キャッシュキーを生成
   */
  generateKey(prefix: string, ...params: any[]): string {
    const paramString = params.map(p => 
      typeof p === 'object' ? JSON.stringify(p) : String(p)
    ).join('_')
    
    return `${prefix}_${paramString}`
  }
}
