import { ref } from 'vue'

/**
 * フォーム管理の共通composable
 */
export const useForm = <T extends Record<string, any>>(initialForm: T) => {
  /** フォームデータ */
  const form = ref<T>({ ...initialForm })

  /** 編集フォームデータ */
  const editForm = ref<T>({ ...initialForm })

  /**
   * フォームをリセット
   */
  const resetForm = (): void => {
    form.value = { ...initialForm }
  }

  /**
   * 編集フォームをリセット
   */
  const resetEditForm = (): void => {
    editForm.value = { ...initialForm }
  }

  /**
   * 編集フォームにデータを設定
   * @param data - 設定するデータ
   */
  const setEditForm = (data: T): void => {
    editForm.value = { ...data }
  }

  /**
   * フォームのバリデーション（基本的な実装）
   * @param requiredFields - 必須フィールドの配列
   * @returns バリデーション結果
   */
  const validateForm = (requiredFields: (keyof T)[] = []): boolean => {
    for (const field of requiredFields) {
      const value = form.value[field]
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        return false
      }
    }
    return true
  }

  /**
   * 編集フォームのバリデーション（基本的な実装）
   * @param requiredFields - 必須フィールドの配列
   * @returns バリデーション結果
   */
  const validateEditForm = (requiredFields: (keyof T)[] = []): boolean => {
    for (const field of requiredFields) {
      const value = editForm.value[field]
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        return false
      }
    }
    return true
  }

  /**
   * 全てのフォームをリセット
   */
  const resetAllForms = (): void => {
    resetForm()
    resetEditForm()
  }

  return {
    form,
    editForm,
    resetForm,
    resetEditForm,
    setEditForm,
    validateForm,
    validateEditForm,
    resetAllForms
  }
}
