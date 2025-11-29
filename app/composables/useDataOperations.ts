import { ref } from 'vue'
import { showConfirmDialog } from '~/utils/helpers/pageUtils'

/**
 * データ操作の共通composable
 */
export const useDataOperations = () => {
  /** 操作結果メッセージ */
  const result = ref<string>('')

  /** ローディング状態 */
  const isLoading = ref<boolean>(false)

  /**
   * データ削除の確認ダイアログを表示
   * @param itemName - 削除対象のアイテム名
   * @param itemId - 削除対象のアイテムID
   * @returns 確認結果
   */
  const confirmDelete = (itemName: string, itemId?: number | string): boolean => {
    const displayName = itemName || `ID ${itemId}`
    return showConfirmDialog(`「${displayName}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)
  }

  /**
   * 全データクリアの確認ダイアログを表示
   * @param dataType - データの種類（例: "食品", "レシピ", "カテゴリ"）
   * @returns 確認結果
   */
  const confirmClearAll = (dataType: string = 'データ'): boolean => {
    return showConfirmDialog(`全ての${dataType}を削除してもよろしいですか？\n\nこの操作は取り消せません。`)
  }

  /**
   * エラーハンドリングの共通処理
   * @param error - エラーオブジェクト
   * @param operation - 操作名
   */
  const handleError = (error: any, operation: string): void => {
    result.value = `${operation}エラー: ${error}`
    console.error(`${operation}エラー:`, error)
  }

  /**
   * 成功メッセージの設定
   * @param message - 成功メッセージ
   */
  const setSuccessMessage = (message: string): void => {
    result.value = message
  }

  /**
   * ローディング状態の管理
   * @param loading - ローディング状態
   */
  const setLoading = (loading: boolean): void => {
    isLoading.value = loading
  }

  /**
   * 状態をリセット
   */
  const resetState = (): void => {
    result.value = ''
    isLoading.value = false
  }

  return {
    result,
    isLoading,
    confirmDelete,
    confirmClearAll,
    handleError,
    setSuccessMessage,
    setLoading,
    resetState
  }
}
