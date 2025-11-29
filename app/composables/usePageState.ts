import { ref } from 'vue'
import { SQLiteManager } from '~/utils/managers/SQLiteManager'

/**
 * ページの共通状態管理composable
 */
export const usePageState = () => {
  /** 操作結果メッセージ */
  const result = ref<string>('')

  /** 接続状態 */
  const connectionStatus = ref<string>('未接続')

  /** 接続フラグ */
  const isConnected = ref<boolean>(false)

  /** ローディング状態 */
  const isLoading = ref<boolean>(false)

  /** プラットフォーム情報 */
  const platformInfo = ref({
    isWebPlatform: false,
    platform: 'Unknown',
    canUseSQLite: false
  })

  /** SQLiteManagerのインスタンス */
  const dbManager = SQLiteManager.getInstance()

  /**
   * プラットフォーム情報を初期化
   */
  const initializePlatformInfo = () => {
    platformInfo.value = dbManager.getPlatformInfo()
  }

  /**
   * 接続状態を更新
   */
  const updateConnectionStatus = () => {
    isConnected.value = dbManager.getConnectionStatus()
    connectionStatus.value = isConnected.value ? '接続済み' : '未接続'
  }

  /**
   * データベース接続を作成
   */
  const createConnection = async (): Promise<void> => {
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
   * 状態をリセット
   */
  const resetState = () => {
    result.value = ''
    connectionStatus.value = '未接続'
    isConnected.value = false
    isLoading.value = false
  }

  return {
    result,
    connectionStatus,
    isConnected,
    isLoading,
    platformInfo,
    dbManager,
    initializePlatformInfo,
    updateConnectionStatus,
    createConnection,
    resetState
  }
}
