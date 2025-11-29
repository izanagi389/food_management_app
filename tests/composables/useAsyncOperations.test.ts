import { describe, it, expect } from 'vitest'
import { useAsyncOperations } from '~/app/composables/useAsyncOperations'

describe('useAsyncOperations', () => {
  it('executeAsync resolves and updates loading state', async () => {
    const ops = useAsyncOperations()
    const promise = Promise.resolve(42)
    const result = await ops.executeAsync(() => promise, 'Loading...')

    expect(result).toBe(42)
    expect(ops.isLoading.value).toBe(false)
  })

  it('executeAsync handles errors and sets result message', async () => {
    const ops = useAsyncOperations()
    const error = new Error('fail')
    const result = await ops.executeAsync(() => Promise.reject(error), 'Loading...')

    expect(result).toBeNull()
    expect(ops.isLoading.value).toBe(false)
    expect(ops.result.value).toContain('操作エラー')
  })

  it('executeWithRetry retries and eventually succeeds', async () => {
    const ops = useAsyncOperations()
    let attempts = 0
    const result = await ops.executeWithRetry(async () => {
      attempts++
      if (attempts < 2) throw new Error('retry')
      return 'ok'
    }, 3, 1)

    expect(result).toBe('ok')
    expect(attempts).toBe(2)
  })
})


