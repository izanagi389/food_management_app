<template>
  <ion-page>
    <PageHeader title="カテゴリ管理" />

    <ion-content class="ion-padding">
      <!-- ステータス表示 -->
      <!-- <SystemStatusCard 
        :connection-status="connectionStatus"
        :platform-info="platformInfo"
        :result="result"
      /> -->

      <!-- 操作ボタン -->
      <ActionButtonsCard :is-loading="isLoading">
        <template #buttons>
          <ion-button expand="block" fill="outline" @click="getAllCategories" :disabled="isLoading">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : 'カテゴリ一覧取得' }}
          </ion-button>

          <ion-button expand="block" fill="outline" color="secondary" @click="insertInitialCategories" :disabled="isLoading">
            <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : '初期カテゴリ追加' }}
          </ion-button>

          <ion-button expand="block" color="primary" @click="openAddCategoryModal" :disabled="isLoading">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : '新しいカテゴリを追加' }}
          </ion-button>
        </template>
      </ActionButtonsCard>

      <!-- カテゴリ表示 -->
      <DataListCard 
        :data="categories"
        title="カテゴリ一覧"
        :is-loading="isLoading"
        empty-message-title="カテゴリが登録されていません"
        empty-message-text="「初期カテゴリ追加」ボタンをクリックして、基本的なカテゴリを追加してください。"
        :get-id-function="(item: Category) => item.id"
        :get-name-function="(item: Category) => item.name"
        :get-description-function="(item: Category) => `ID: ${item.id}`"
        :get-date-function="(item: Category) => `登録日: ${formatDate(item.created_at)}`"
        @edit="openEditCategoryModal"
        @delete="deleteCategory"
      >
        <template #item="{ item }">
          <ion-icon :icon="pricetag" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h2>{{ (item as Category).name }}</h2>
            <p>ID: {{ (item as Category).id }}</p>
            <p>登録日: {{ formatDate((item as Category).created_at) }}</p>
          </ion-label>
          <ion-button 
            slot="end" 
            fill="clear" 
            @click="openEditCategoryModal(item as Category)" 
            :disabled="isLoading"
          >
            <ion-icon :icon="createOutline"></ion-icon>
          </ion-button>
          <ion-button 
            slot="end" 
            fill="clear" 
            color="danger" 
            @click="deleteCategory((item as Category).id!)" 
            :disabled="isLoading"
          >
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </template>
      </DataListCard>

      <!-- カテゴリ追加モーダル -->
      <FormModal
        :is-open="showAddCategoryModal"
        title="新しいカテゴリを追加"
        :is-loading="isLoading"
        :is-form-valid="isFormValid"
        submit-text="追加"
        loading-text="追加中..."
        :submit-icon="addOutline"
        @close="closeAddCategoryModal"
        @submit="insertCategoryData"
      >
        <template #form-fields>
          <FormField
            label="カテゴリ名"
            type="text"
            v-model="categoryForm.name"
            placeholder="カテゴリ名を入力"
            :required="true"
          />
        </template>
      </FormModal>

      <!-- カテゴリ編集モーダル -->
      <FormModal
        :is-open="showEditModal"
        :title="`カテゴリを編集: ${editingCategory?.name || ''}`"
        :is-loading="isLoading"
        :is-form-valid="isEditFormValid"
        submit-text="更新"
        loading-text="更新中..."
        :submit-icon="saveOutline"
        @close="closeEditCategoryModal"
        @submit="updateCategoryData"
      >
        <template #form-fields>
          <FormField
            label="カテゴリ名"
            type="text"
            v-model="editForm.name"
            placeholder="カテゴリ名を入力"
            :required="true"
          />
        </template>
      </FormModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Vue Composition API
import { ref, computed } from 'vue'

// Ionic Vue コンポーネント
import { 
  IonPage, 
  IonContent, 
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonInput,
  IonLabel
} from '@ionic/vue'

// Ionicons
import { 
  refreshOutline, 
  addCircleOutline, 
  addOutline, 
  closeOutline, 
  trashOutline, 
  pricetag,
  saveOutline,
  createOutline
} from 'ionicons/icons'

// ユーティリティとマネージャー
import { formatDate, getPageMeta } from '~/utils/helpers/pageUtils'

// 共通コンポーネント
import FormModal from '~/components/common/FormModal.vue'
import FormField from '~/components/common/FormField.vue'

// 共通composables
import { usePageState } from '~/composables/usePageState'
import { useModal } from '~/composables/useModal'
import { useDataOperations } from '~/composables/useDataOperations'
import { useForm } from '~/composables/useForm'
import { useLifecycle } from '~/composables/useLifecycle'
import { useDataManagement } from '~/composables/useDataManagement'
import { useFormValidation } from '~/composables/useFormValidation'
import { usePlatformAware } from '~/composables/usePlatformAware'
import { useAsyncOperations } from '~/composables/useAsyncOperations'

// 型定義
import type { Category } from '~/types'

/**
 * ページのメタデータを設定
 */
useHead(getPageMeta('カテゴリ管理', '食品カテゴリの管理画面'))

// =================== 共通composables ===================

const {
  result,
  connectionStatus,
  isConnected,
  isLoading,
  platformInfo,
  dbManager,
  initializePlatformInfo,
  updateConnectionStatus,
  createConnection,
  resetState
} = usePageState()

const {
  showAddModal,
  showEditModal,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  resetModalState
} = useModal()

const {
  confirmDelete,
  handleError,
  setSuccessMessage,
  setLoading
} = useDataOperations()

const {
  form: categoryForm,
  resetForm,
  validateForm
} = useForm({
  name: ''
})

const { setupPageLifecycle } = useLifecycle()

// 新しい共通composables
const {
  data: categories,
  dataCount,
  fetchData,
  insertData,
  deleteData,
  clearAllData: clearAllCategories
} = useDataManagement<Category>()

const {
  form: validationForm,
  validateForm: validateFormFields,
  isFormValid: isValidationFormValid,
  resetForm: resetValidationForm
} = useFormValidation({
  name: ''
})

const {
  initializePlatformSpecific,
  cleanupPlatformSpecific
} = usePlatformAware()

const {
  executeAsync,
  executeWithRetry
} = useAsyncOperations()

// =================== ページ固有の状態 ===================

/** カテゴリ追加モーダルの表示状態（共通モーダルを使用） */
const showAddCategoryModal = computed(() => showAddModal.value)

/** 編集中のカテゴリ */
const editingCategory = ref<Category | null>(null)

/** 編集フォーム */
const editForm = ref({
  name: ''
})

/** フォームのバリデーション */
const isFormValid = computed((): boolean => {
  return validateForm(['name'])
})

/** 編集フォームのバリデーション */
const isEditFormValid = computed((): boolean => {
  return editForm.value.name.trim() !== ''
})


// =================== カテゴリ管理機能 ===================

/**
 * 全てのカテゴリを取得
 */
const getAllCategories = async (): Promise<void> => {
  await fetchData(
    () => dbManager.getAllCategories(), // Webストレージ用（カテゴリはWebストレージにないので同じ関数を使用）
    () => dbManager.getAllCategories(), // SQLite用
    'カテゴリ'
  )
}

/**
 * カテゴリを挿入
 */
const insertCategoryData = async (): Promise<void> => {
  if (!categoryForm.value.name.trim()) {
    setSuccessMessage('カテゴリ名を入力してください')
    return
  }

  const categoryData: Category = {
    name: categoryForm.value.name.trim(),
  }

  await insertData(
    () => dbManager.insertCategory(categoryData),
    'カテゴリ',
    async () => {
      closeAddModal()
      resetForm()
    }
  )
}

/**
 * 初期カテゴリを挿入
 */
const insertInitialCategories = async (): Promise<void> => {
  await executeAsync(
    () => dbManager.insertInitialCategories(),
    '初期カテゴリを挿入中...',
    async (response) => {
      if (response.success) {
        await getAllCategories()
      }
    }
  )
}

// =================== モーダル管理機能 ===================

/**
 * カテゴリ追加モーダルを開く
 */
const openAddCategoryModal = (): void => {
  openAddModal()
}

/**
 * カテゴリ追加モーダルを閉じる
 */
const closeAddCategoryModal = (): void => {
  closeAddModal()
  resetForm()
}

/**
 * カテゴリ編集モーダルを開く
 * @param item - 編集対象のカテゴリ
 */
const openEditCategoryModal = (item: Category): void => {
  editingCategory.value = item
  editForm.value = {
    name: item.name || ''
  }
  openEditModal()
}

/**
 * カテゴリ編集モーダルを閉じる
 */
const closeEditCategoryModal = (): void => {
  closeEditModal()
  editingCategory.value = null
  editForm.value = {
    name: ''
  }
}

// =================== データ削除機能 ===================

/**
 * カテゴリデータを更新
 */
const updateCategoryData = async (): Promise<void> => {
  if (!editingCategory.value?.id) return

  if (!editForm.value.name.trim()) {
    setSuccessMessage('カテゴリ名を入力してください')
    return
  }

  const updateData: Partial<Category> = {
    name: editForm.value.name.trim()
  }

  try {
    isLoading.value = true
    result.value = 'カテゴリを更新中...'

    const response = await dbManager.updateCategory(editingCategory.value.id, updateData)
    result.value = response.message

    if (response.success) {
      await getAllCategories()
      closeEditCategoryModal()
    }
  } catch (error) {
    result.value = `カテゴリ更新エラー: ${error}`
    console.error('カテゴリ更新エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * カテゴリを削除
 * @param id - 削除するカテゴリのID
 */
const deleteCategory = async (id: number): Promise<void> => {
  const category = categories.value.find(cat => cat.id === id)
  const categoryName = category?.name || `ID ${id}`
  
  if (!confirmDelete(categoryName, id)) {
    return
  }

  try {
    isLoading.value = true
    result.value = `カテゴリ「${categoryName}」を削除中...`

    const response = await dbManager.deleteCategory(id)
    result.value = response.message

    if (response.success) {
      await getAllCategories()
    }
  } catch (error) {
    result.value = `カテゴリ削除エラー: ${error}`
    console.error('カテゴリ削除エラー:', error)
  } finally {
    isLoading.value = false
  }
}

// =================== ライフサイクル管理 ===================

/**
 * 初期化処理
 */
const initializePage = async (): Promise<void> => {
  // プラットフォーム固有の初期化
  await initializePlatformSpecific()
  
  // カテゴリを取得
  await getAllCategories()
}

/**
 * クリーンアップ処理
 */
const cleanupPage = async (): Promise<void> => {
  // プラットフォーム固有のクリーンアップ
  await cleanupPlatformSpecific()
  
  // 状態のリセット
  resetForm()
  resetModalState()
  resetState()
}

// ライフサイクルを設定
setupPageLifecycle(initializePage, cleanupPage)
</script>

