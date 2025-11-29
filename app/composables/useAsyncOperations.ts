import { ref } from 'vue'

/**
 * 非同期操作の共通composable
 */
export const useAsyncOperations = () => {
  /** ローディング状態 */
  const isLoading = ref<boolean>(false)
  
  /** 操作結果メッセージ */
  const result = ref<string>('')

  /**
   * 非同期操作を実行
   * @param operation - 実行する操作
   * @param loadingMessage - ローディング中のメッセージ
   * @param onSuccess - 成功時のコールバック
   * @param onError - エラー時のコールバック
   */
  const executeAsync = async <T>(
    operation: () => Promise<T>,
    loadingMessage: string = '処理中...',
    onSuccess?: (result: T) => void | Promise<void>,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      isLoading.value = true
      result.value = loadingMessage

      const operationResult = await operation()
      
      if (onSuccess) {
        await onSuccess(operationResult)
      }
      
      return operationResult
    } catch (error) {
      const errorMessage = `操作エラー: ${error}`
      result.value = errorMessage
      console.error('非同期操作エラー:', error)
      
      if (onError) {
        onError(error)
      }
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * リトライ機能付きの非同期操作
   * @param operation - 実行する操作
   * @param maxRetries - 最大リトライ回数
   * @param retryDelay - リトライ間隔（ミリ秒）
   * @param loadingMessage - ローディング中のメッセージ
   */
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    loadingMessage: string = '処理中...'
  ): Promise<T | null> => {
    let lastError: any = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        isLoading.value = true
        result.value = attempt === 1 ? loadingMessage : `${loadingMessage} (再試行 ${attempt}/${maxRetries})`

        const operationResult = await operation()
        result.value = '処理が完了しました'
        return operationResult
      } catch (error) {
        lastError = error
        console.error(`操作エラー (試行 ${attempt}/${maxRetries}):`, error)
        
        if (attempt < maxRetries) {
          result.value = `エラーが発生しました。${retryDelay}ms後に再試行します...`
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      } finally {
        if (attempt === maxRetries) {
          isLoading.value = false
        }
      }
    }
    
    result.value = `操作に失敗しました (${maxRetries}回試行)`
    console.error('最大リトライ回数に達しました:', lastError)
    return null
  }

  /**
   * バッチ操作（複数の操作を順次実行）
   * @param operations - 実行する操作の配列
   * @param loadingMessage - ローディング中のメッセージ
   * @param onProgress - 進捗更新のコールバック
   */
  const executeBatch = async <T>(
    operations: Array<() => Promise<T>>,
    loadingMessage: string = 'バッチ処理中...',
    onProgress?: (completed: number, total: number) => void
  ): Promise<T[]> => {
    const results: T[] = []
    
    try {
      isLoading.value = true
      result.value = loadingMessage

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i]
        if (!operation) {
          console.warn(`操作 ${i + 1} が undefined です。スキップします。`)
          continue
        }
        
        result.value = `${loadingMessage} (${i + 1}/${operations.length})`
        
        try {
          const operationResult = await operation()
          results.push(operationResult)
          
          if (onProgress) {
            onProgress(i + 1, operations.length)
          }
        } catch (error) {
          console.error(`バッチ操作エラー (${i + 1}/${operations.length}):`, error)
          // エラーが発生しても次の操作を続行
        }
      }
      
      result.value = `バッチ処理が完了しました (${results.length}/${operations.length}件成功)`
      return results
    } catch (error) {
      result.value = 'バッチ処理エラー'
      console.error('バッチ処理エラー:', error)
      return results
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 並列操作（複数の操作を同時実行）
   * @param operations - 実行する操作の配列
   * @param loadingMessage - ローディング中のメッセージ
   * @param maxConcurrency - 最大同時実行数
   */
  const executeParallel = async <T>(
    operations: Array<() => Promise<T>>,
    loadingMessage: string = '並列処理中...',
    maxConcurrency: number = 5
  ): Promise<T[]> => {
    try {
      isLoading.value = true
      result.value = loadingMessage

      const results: T[] = []
      
      // チャンクに分割して並列実行
      for (let i = 0; i < operations.length; i += maxConcurrency) {
        const chunk = operations.slice(i, i + maxConcurrency)
        result.value = `${loadingMessage} (${i + 1}-${Math.min(i + maxConcurrency, operations.length)}/${operations.length})`
        
        const chunkResults = await Promise.allSettled(
          chunk.map(operation => operation())
        )
        
        chunkResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            console.error('並列操作エラー:', result.reason)
          }
        })
      }
      
      result.value = `並列処理が完了しました (${results.length}/${operations.length}件成功)`
      return results
    } catch (error) {
      result.value = '並列処理エラー'
      console.error('並列処理エラー:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 状態をリセット
   */
  const resetState = (): void => {
    isLoading.value = false
    result.value = ''
  }

  return {
    isLoading,
    result,
    executeAsync,
    executeWithRetry,
    executeBatch,
    executeParallel,
    resetState
  }
}
