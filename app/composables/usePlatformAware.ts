import { ref } from 'vue'
import { SQLiteManager } from '~/utils/managers/SQLiteManager'

/**
 * プラットフォーム対応の共通composable
 */
export const usePlatformAware = () => {
  /** プラットフォーム情報 */
  const platformInfo = ref({
    isWebPlatform: false,
    platform: 'Unknown',
    canUseSQLite: false
  })

  /** 接続状態 */
  const isConnected = ref<boolean>(false)

  /** 接続状態メッセージ */
  const connectionStatus = ref<string>('未接続')

  /** SQLiteManagerのインスタンス */
  const dbManager = SQLiteManager.getInstance()

  /**
   * プラットフォーム情報を初期化
   */
  const initializePlatformInfo = (): void => {
    platformInfo.value = dbManager.getPlatformInfo()
  }

  /**
   * 接続状態を更新
   */
  const updateConnectionStatus = (): void => {
    isConnected.value = dbManager.getConnectionStatus()
    connectionStatus.value = isConnected.value ? '接続済み' : '未接続'
  }

  /**
   * データベース接続を作成
   */
  const createConnection = async (): Promise<void> => {
    try {
      const response = await dbManager.createConnection()

      if (response.success) {
        isConnected.value = true
        connectionStatus.value = '接続済み'
      } else {
        connectionStatus.value = '接続失敗'
      }
    } catch (error) {
      connectionStatus.value = '接続エラー'
      console.error('接続エラー:', error)
    }
  }

  /**
   * プラットフォームに応じたデータ取得
   * @param getWebData - Webストレージから取得する関数
   * @param getSQLiteData - SQLiteから取得する関数
   */
  const getDataByPlatform = async (
    getWebData: () => Promise<any>,
    getSQLiteData: () => Promise<any>
  ): Promise<any> => {
    if (platformInfo.value.isWebPlatform) {
      return await getWebData()
    } else {
      return await getSQLiteData()
    }
  }

  /**
   * プラットフォームに応じたデータ保存
   * @param saveWebData - Webストレージに保存する関数
   * @param saveSQLiteData - SQLiteに保存する関数
   */
  const saveDataByPlatform = async (
    saveWebData: () => Promise<any>,
    saveSQLiteData: () => Promise<any>
  ): Promise<any> => {
    if (platformInfo.value.isWebPlatform) {
      return await saveWebData()
    } else {
      return await saveSQLiteData()
    }
  }

  /**
   * プラットフォームに応じたデータ削除
   * @param deleteWebData - Webストレージから削除する関数
   * @param deleteSQLiteData - SQLiteから削除する関数
   */
  const deleteDataByPlatform = async (
    deleteWebData: () => Promise<any>,
    deleteSQLiteData: () => Promise<any>
  ): Promise<any> => {
    if (platformInfo.value.isWebPlatform) {
      return await deleteWebData()
    } else {
      return await deleteSQLiteData()
    }
  }

  /**
   * プラットフォームに応じたデータクリア
   * @param clearWebData - Webストレージをクリアする関数
   * @param clearSQLiteData - SQLiteをクリアする関数
   */
  const clearDataByPlatform = async (
    clearWebData: () => Promise<any>,
    clearSQLiteData: () => Promise<any>
  ): Promise<any> => {
    if (platformInfo.value.isWebPlatform) {
      return await clearWebData()
    } else {
      return await clearSQLiteData()
    }
  }

  /**
   * Webストレージの状態を取得
   */
  const getWebStorageStatus = () => {
    return dbManager.getWebStorageSyncStatus()
  }

  /**
   * プラットフォーム固有の初期化処理
   */
  const initializePlatformSpecific = async (): Promise<void> => {
    initializePlatformInfo()
    
    if (!platformInfo.value.isWebPlatform) {
      await createConnection()
    }
    
    updateConnectionStatus()
  }

  /**
   * プラットフォーム固有のクリーンアップ処理
   */
  const cleanupPlatformSpecific = async (): Promise<void> => {
    if (!platformInfo.value.isWebPlatform && isConnected.value) {
      try {
        await dbManager.closeConnection()
      } catch (error) {
        console.error('接続終了エラー:', error)
      }
    }
  }

  return {
    platformInfo,
    isConnected,
    connectionStatus,
    initializePlatformInfo,
    updateConnectionStatus,
    createConnection,
    getDataByPlatform,
    saveDataByPlatform,
    deleteDataByPlatform,
    clearDataByPlatform,
    getWebStorageStatus,
    initializePlatformSpecific,
    cleanupPlatformSpecific
  }
}
