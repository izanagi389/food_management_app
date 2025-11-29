import { ref } from 'vue'
import { SQLiteManager } from '~/utils/managers/SQLiteManager'

/**
 * データ管理の共通composable
 */
export const useDataManagement = <T = any>() => {
  /** データ一覧 */
  const data = ref<T[]>([])
  
  /** データ件数 */
  const dataCount = ref<number>(0)
  
  /** ローディング状態 */
  const isLoading = ref<boolean>(false)
  
  /** 操作結果メッセージ */
  const result = ref<string>('')
  
  /** SQLiteManagerのインスタンス */
  const dbManager = SQLiteManager.getInstance()

  /**
   * データを取得（プラットフォーム対応）
   * @param getWebData - Webストレージから取得する関数
   * @param getSQLiteData - SQLiteから取得する関数
   * @param dataType - データの種類（ログ用）
   */
  const fetchData = async (
    getWebData: () => Promise<any>,
    getSQLiteData: () => Promise<any>,
    dataType: string = 'データ'
  ): Promise<void> => {
    try {
      // 既にローディング中の場合は重複実行を避ける
      if (isLoading.value) {
        console.log(`既にローディング中のため、${dataType}取得をスキップします`)
        return
      }
      
      isLoading.value = true
      result.value = `${dataType}を取得中...`

      // プラットフォーム情報を取得
      const platformInfo = dbManager.getPlatformInfo()
      console.log(`${dataType}取得時のプラットフォーム情報:`, platformInfo)

      let response
      if (platformInfo.isWebPlatform) {
        // Webプラットフォームの場合はWebストレージから取得
        result.value = `Webストレージから${dataType}を取得中...`
        console.log(`Webストレージから${dataType}を取得します`)
        response = await getWebData()
      } else {
        // ネイティブプラットフォームの場合はSQLiteから取得
        result.value = `SQLiteから${dataType}を取得中...`
        console.log(`SQLiteから${dataType}を取得します`)
        response = await getSQLiteData()
      }

      console.log(`${dataType}取得レスポンス:`, response)

      if (response.success) {
        data.value = response.data || []
        dataCount.value = data.value.length
        result.value = `${platformInfo.platform}から${dataType}数: ${dataCount.value}件を取得しました`
        console.log(`取得した${dataType}:`, data.value)
        console.log(`${dataType}件数:`, dataCount.value)
        
        // データが空の場合、少し待ってから再試行（SQLiteのみ）
        if (dataCount.value === 0 && !platformInfo.isWebPlatform) {
          console.log(`${dataType}が空のため、少し待ってから再試行します`)
          await new Promise(resolve => setTimeout(resolve, 300))
          console.log(`再試行で${dataType}を取得します`)
          const retryResponse = await getSQLiteData()
          if (retryResponse.success && retryResponse.data && retryResponse.data.length > 0) {
            data.value = retryResponse.data
            dataCount.value = data.value.length
            result.value = `${platformInfo.platform}から${dataType}数: ${dataCount.value}件を取得しました（再試行成功）`
            console.log(`再試行で取得した${dataType}:`, data.value)
          } else {
            console.log(`再試行でも${dataType}が取得されませんでした。データが存在しない可能性があります。`)
          }
        }
        
        // Vueのリアクティブシステムを確実に動作させるため、次のティックで更新
        await new Promise(resolve => setTimeout(resolve, 0))
        console.log(`${dataType}取得処理が完了しました。UIを更新します。`)
      } else {
        result.value = response.message
        console.error(`${dataType}取得に失敗:`, response.message)
      }
    } catch (error) {
      result.value = `${dataType}取得エラー: ${error}`
      console.error(`${dataType}取得エラー:`, error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * データを挿入
   * @param insertFunction - 挿入処理を行う関数
   * @param dataType - データの種類（ログ用）
   * @param onSuccess - 成功時のコールバック
   */
  const insertData = async (
    insertFunction: () => Promise<any>,
    dataType: string = 'データ',
    onSuccess?: () => Promise<void>
  ): Promise<void> => {
    try {
      isLoading.value = true
      result.value = `${dataType}を挿入中...`

      const response = await insertFunction()
      result.value = response.message

      if (response.success) {
        if (onSuccess) {
          await onSuccess()
        }
        // データを再取得
        await fetchData(
          () => dbManager.getFoodsFromWebStorage(),
          () => dbManager.getAllFoods(),
          dataType
        )
      }
    } catch (error) {
      result.value = `${dataType}挿入エラー: ${error}`
      console.error(`${dataType}挿入エラー:`, error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * データを更新
   * @param updateFunction - 更新処理を行う関数
   * @param dataType - データの種類（ログ用）
   * @param onSuccess - 成功時のコールバック
   */
  const updateData = async (
    updateFunction: () => Promise<any>,
    dataType: string = 'データ',
    onSuccess?: () => Promise<void>
  ): Promise<void> => {
    try {
      isLoading.value = true
      result.value = `${dataType}を更新中...`

      const response = await updateFunction()
      result.value = response.message

      if (response.success) {
        if (onSuccess) {
          await onSuccess()
        }
        // データを再取得
        await fetchData(
          () => dbManager.getFoodsFromWebStorage(),
          () => dbManager.getAllFoods(),
          dataType
        )
      }
    } catch (error) {
      result.value = `${dataType}更新エラー: ${error}`
      console.error(`${dataType}更新エラー:`, error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * データを削除
   * @param deleteFunction - 削除処理を行う関数
   * @param dataType - データの種類（ログ用）
   * @param onSuccess - 成功時のコールバック
   */
  const deleteData = async (
    deleteFunction: () => Promise<any>,
    dataType: string = 'データ',
    onSuccess?: () => Promise<void>
  ): Promise<void> => {
    try {
      isLoading.value = true
      result.value = `${dataType}を削除中...`

      const response = await deleteFunction()
      result.value = response.message

      if (response.success) {
        if (onSuccess) {
          await onSuccess()
        }
        // データを再取得
        await fetchData(
          () => dbManager.getFoodsFromWebStorage(),
          () => dbManager.getAllFoods(),
          dataType
        )
      }
    } catch (error) {
      result.value = `${dataType}削除エラー: ${error}`
      console.error(`${dataType}削除エラー:`, error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 全データをクリア（プラットフォーム対応）
   * @param dataType - データの種類（ログ用）
   */
  const clearAllData = async (dataType: string = 'データ'): Promise<void> => {
    try {
      isLoading.value = true
      result.value = `全${dataType}をクリア中...`

      // プラットフォーム情報を取得
      const platformInfo = dbManager.getPlatformInfo()

      if (platformInfo.isWebPlatform) {
        // Webプラットフォームの場合はWebストレージをクリア
        result.value = 'Webストレージをクリア中...'
        const webResponse = await dbManager.clearWebStorage()

        if (webResponse.success) {
          result.value = 'Webストレージをクリアしました'
        } else {
          result.value = webResponse.message
        }
      } else {
        // ネイティブプラットフォームの場合はデータベースをリセット
        result.value = 'データベースをリセット中...'
        const dbResponse = await dbManager.resetDatabase()

        if (dbResponse.success) {
          // データベースを再初期化
          await dbManager.createConnection()
          result.value = 'データベースをリセットしました'
        } else {
          result.value = dbResponse.message
        }
      }

      // データをクリア
      data.value = []
      dataCount.value = 0

    } catch (error) {
      result.value = `${dataType}クリアエラー: ${error}`
      console.error(`${dataType}クリアエラー:`, error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 状態をリセット
   */
  const resetState = (): void => {
    data.value = []
    dataCount.value = 0
    isLoading.value = false
    result.value = ''
  }

  return {
    data,
    dataCount,
    isLoading,
    result,
    fetchData,
    insertData,
    updateData,
    deleteData,
    clearAllData,
    resetState
  }
}
