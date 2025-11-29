import { onMounted, onUnmounted } from 'vue'

/**
 * ライフサイクル管理の共通composable
 */
export const useLifecycle = () => {
  /**
   * コンポーネントマウント時の共通処理
   * @param initFunction - 初期化関数
   */
  const onPageMount = async (initFunction?: () => Promise<void>): Promise<void> => {
    console.log('ページが読み込まれました')
    
    if (initFunction) {
      try {
        await initFunction()
      } catch (error) {
        console.error('初期化処理でエラーが発生しました:', error)
      }
    }
  }

  /**
   * コンポーネントアンマウント時の共通処理
   * @param cleanupFunction - クリーンアップ関数
   */
  const onPageUnmount = (cleanupFunction?: () => void): void => {
    console.log('ページがアンマウントされました')
    
    if (cleanupFunction) {
      try {
        cleanupFunction()
      } catch (error) {
        console.error('クリーンアップ処理でエラーが発生しました:', error)
      }
    }
  }

  /**
   * ページのライフサイクルを設定
   * @param initFunction - 初期化関数
   * @param cleanupFunction - クリーンアップ関数
   */
  const setupPageLifecycle = (
    initFunction?: () => Promise<void>,
    cleanupFunction?: () => void
  ): void => {
    onMounted(() => onPageMount(initFunction))
    onUnmounted(() => onPageUnmount(cleanupFunction))
  }

  return {
    onPageMount,
    onPageUnmount,
    setupPageLifecycle
  }
}
