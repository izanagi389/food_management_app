import { ref, type Ref } from 'vue'
import { SQLiteManager } from '~/utils/managers/SQLiteManager'

/**
 * データベース操作の共通ロジック
 */
export const useDatabase = () => {
  const dbManager = SQLiteManager.getInstance()
  
  const isLoading = ref(false)
  const result = ref('')
  const connectionStatus = ref('未接続')
  const isConnected = ref(false)
  
  const platformInfo = ref({
    isWebPlatform: false,
    platform: 'Unknown',
    canUseSQLite: false
  })

  /**
   * データベース接続を作成
   */
  const createConnection = async () => {
    try {
      isLoading.value = true
      result.value = 'データベース接続を作成中...'

      const response = await dbManager.createConnection()

      if (response.success) {
        isConnected.value = true
        connectionStatus.value = '接続済み'
        result.value = response.message
      } else {
        result.value = response.message
      }
    } catch (error) {
      result.value = `接続エラー: ${error}`
      console.error('接続エラー:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * プラットフォーム情報を初期化
   */
  const initializePlatform = () => {
    platformInfo.value = dbManager.getPlatformInfo()
  }

  /**
   * 初期化処理
   */
  const initialize = async () => {
    initializePlatform()
    await createConnection()
    isConnected.value = dbManager.getConnectionStatus()
    connectionStatus.value = isConnected.value ? '接続済み' : '未接続'
  }

  /**
   * 全データクリア（プラットフォーム自動判定）
   */
  const clearAllData = async () => {
    try {
      isLoading.value = true
      result.value = '全データをクリア中...'

      const info = dbManager.getPlatformInfo()
      
      if (info.isWebPlatform) {
        result.value = 'Webストレージをクリア中...'
        const webResponse = await dbManager.clearWebStorage()
        result.value = webResponse.success ? 'Webストレージをクリアしました' : webResponse.message
      } else {
        result.value = 'データベースをリセット中...'
        const dbResponse = await dbManager.resetDatabase()
        
        if (dbResponse.success) {
          await createConnection()
          result.value = 'データベースをリセットしました'
        } else {
          result.value = dbResponse.message
        }
      }
    } catch (error) {
      result.value = `データクリアエラー: ${error}`
      console.error('データクリアエラー:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状態
    isLoading: readonly(isLoading),
    result: readonly(result),
    connectionStatus: readonly(connectionStatus),
    isConnected: readonly(isConnected),
    platformInfo: readonly(platformInfo),
    
    // メソッド
    createConnection,
    initializePlatform,
    initialize,
    clearAllData,
    
    // DBマネージャー
    dbManager
  }
}
