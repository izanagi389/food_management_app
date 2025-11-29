import { ref } from 'vue'

/**
 * モーダル管理の共通composable
 */
export const useModal = () => {
  /** 追加モーダルの表示状態 */
  const showAddModal = ref<boolean>(false)

  /** 編集モーダルの表示状態 */
  const showEditModal = ref<boolean>(false)

  /**
   * 追加モーダルを開く
   */
  const openAddModal = (): void => {
    showAddModal.value = true
  }

  /**
   * 追加モーダルを閉じる
   */
  const closeAddModal = (): void => {
    showAddModal.value = false
  }

  /**
   * 編集モーダルを開く
   */
  const openEditModal = (): void => {
    showEditModal.value = true
  }

  /**
   * 編集モーダルを閉じる
   */
  const closeEditModal = (): void => {
    showEditModal.value = false
  }

  /**
   * 全てのモーダルを閉じる
   */
  const closeAllModals = (): void => {
    showAddModal.value = false
    showEditModal.value = false
  }

  /**
   * モーダル状態をリセット
   */
  const resetModalState = (): void => {
    showAddModal.value = false
    showEditModal.value = false
  }

  return {
    showAddModal,
    showEditModal,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    closeAllModals,
    resetModalState
  }
}
