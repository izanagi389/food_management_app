import { ref, computed } from 'vue'

/**
 * フォームバリデーションの共通composable
 */
export const useFormValidation = <T extends Record<string, any>>(initialForm: T) => {
  /** フォームデータ */
  const form = ref<T>({ ...initialForm })
  
  /** バリデーションエラー */
  const errors = ref<Record<string, string>>({})

  /**
   * 数値フィールドをバリデーション
   * @param fieldName - フィールド名
   * @param value - 値
   * @param required - 必須かどうか
   * @param min - 最小値
   * @param max - 最大値
   */
  const validateNumberField = (
    fieldName: string,
    value: string | number | null | undefined,
    required: boolean = false,
    min?: number,
    max?: number
  ): boolean => {
    const stringValue = String(value).trim()
    
    if (required && (stringValue === '' || stringValue === 'null' || stringValue === 'undefined')) {
      errors.value[fieldName] = `${fieldName}は必須です`
      return false
    }
    
    if (stringValue !== '' && stringValue !== 'null' && stringValue !== 'undefined') {
      const numValue = Number(stringValue)
      
      if (isNaN(numValue)) {
        errors.value[fieldName] = `${fieldName}は数値で入力してください`
        return false
      }
      
      if (min !== undefined && numValue < min) {
        errors.value[fieldName] = `${fieldName}は${min}以上で入力してください`
        return false
      }
      
      if (max !== undefined && numValue > max) {
        errors.value[fieldName] = `${fieldName}は${max}以下で入力してください`
        return false
      }
    }
    
    delete errors.value[fieldName]
    return true
  }

  /**
   * テキストフィールドをバリデーション
   * @param fieldName - フィールド名
   * @param value - 値
   * @param required - 必須かどうか
   * @param minLength - 最小文字数
   * @param maxLength - 最大文字数
   */
  const validateTextField = (
    fieldName: string,
    value: string | null | undefined,
    required: boolean = false,
    minLength?: number,
    maxLength?: number
  ): boolean => {
    const stringValue = String(value || '').trim()
    
    if (required && stringValue === '') {
      errors.value[fieldName] = `${fieldName}は必須です`
      return false
    }
    
    if (stringValue !== '') {
      if (minLength !== undefined && stringValue.length < minLength) {
        errors.value[fieldName] = `${fieldName}は${minLength}文字以上で入力してください`
        return false
      }
      
      if (maxLength !== undefined && stringValue.length > maxLength) {
        errors.value[fieldName] = `${fieldName}は${maxLength}文字以下で入力してください`
        return false
      }
    }
    
    delete errors.value[fieldName]
    return true
  }

  /**
   * 選択フィールドをバリデーション
   * @param fieldName - フィールド名
   * @param value - 値
   * @param required - 必須かどうか
   */
  const validateSelectField = (
    fieldName: string,
    value: any,
    required: boolean = false
  ): boolean => {
    if (required && (value === null || value === undefined || value === '')) {
      errors.value[fieldName] = `${fieldName}を選択してください`
      return false
    }
    
    delete errors.value[fieldName]
    return true
  }

  /**
   * フォーム全体をバリデーション
   * @param validationRules - バリデーションルール
   */
  const validateForm = (validationRules: Record<string, any>): boolean => {
    let isValid = true
    
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = form.value[fieldName as keyof T]
      
      switch (rules.type) {
        case 'number':
          if (!validateNumberField(fieldName, value, rules.required, rules.min, rules.max)) {
            isValid = false
          }
          break
        case 'text':
          if (!validateTextField(fieldName, value, rules.required, rules.minLength, rules.maxLength)) {
            isValid = false
          }
          break
        case 'select':
          if (!validateSelectField(fieldName, value, rules.required)) {
            isValid = false
          }
          break
      }
    }
    
    return isValid
  }

  /**
   * 特定のフィールドのエラーメッセージを取得
   * @param fieldName - フィールド名
   */
  const getFieldError = (fieldName: string): string => {
    return errors.value[fieldName] || ''
  }

  /**
   * フォームが有効かどうか
   */
  const isFormValid = computed((): boolean => {
    return Object.keys(errors.value).length === 0
  })

  /**
   * フォームをリセット
   */
  const resetForm = (): void => {
    form.value = { ...initialForm }
    errors.value = {}
  }

  /**
   * エラーをクリア
   */
  const clearErrors = (): void => {
    errors.value = {}
  }

  /**
   * 特定のフィールドのエラーをクリア
   * @param fieldName - フィールド名
   */
  const clearFieldError = (fieldName: string): void => {
    delete errors.value[fieldName]
  }

  return {
    form,
    errors,
    validateNumberField,
    validateTextField,
    validateSelectField,
    validateForm,
    getFieldError,
    isFormValid,
    resetForm,
    clearErrors,
    clearFieldError
  }
}
