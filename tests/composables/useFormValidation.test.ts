import { describe, it, expect } from 'vitest'
import { useFormValidation } from '~/app/composables/useFormValidation'

describe('useFormValidation', () => {
  it('validates number, text, and select fields', () => {
    const { form, errors, validateNumberField, validateTextField, validateSelectField, isFormValid, getFieldError, resetForm, clearErrors } =
      useFormValidation({ a: '', b: '', c: '' })

    // number field
    expect(validateNumberField('a', '10', true, 1, 20)).toBe(true)
    expect(errors.value['a']).toBeUndefined()
    expect(validateNumberField('a', 'x', true)).toBe(false)
    expect(getFieldError('a')).toContain('数値')

    // text field
    expect(validateTextField('b', 'hello', true, 2, 10)).toBe(true)
    expect(validateTextField('b', '', true)).toBe(false)

    // select field
    expect(validateSelectField('c', 'value', true)).toBe(true)
    expect(validateSelectField('c', '', true)).toBe(false)

    expect(isFormValid.value).toBe(false)
    clearErrors()
    expect(isFormValid.value).toBe(true)

    resetForm()
    expect(form.value).toEqual({ a: '', b: '', c: '' })
  })
})


