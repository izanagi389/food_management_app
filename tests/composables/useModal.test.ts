import { describe, it, expect } from 'vitest'
import { useModal } from '~/app/composables/useModal'

describe('useModal', () => {
  it('toggles add/edit modals correctly', () => {
    const modal = useModal()

    expect(modal.showAddModal.value).toBe(false)
    expect(modal.showEditModal.value).toBe(false)

    modal.openAddModal()
    expect(modal.showAddModal.value).toBe(true)
    modal.closeAddModal()
    expect(modal.showAddModal.value).toBe(false)

    modal.openEditModal()
    expect(modal.showEditModal.value).toBe(true)
    modal.closeEditModal()
    expect(modal.showEditModal.value).toBe(false)

    modal.openAddModal()
    modal.openEditModal()
    modal.closeAllModals()
    expect(modal.showAddModal.value).toBe(false)
    expect(modal.showEditModal.value).toBe(false)
  })
})


