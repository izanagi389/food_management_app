<template>
    <ion-page>
        <PageHeader title="食品管理" />

        <ion-content class="ion-padding">
            <!-- ステータス表示 -->
            <!-- <SystemStatusCard :connection-status="connectionStatus" :platform-info="platformInfo" :result="result" /> -->

            <!-- Webストレージ状態表示 -->
            <!-- <ion-card>
                <ion-card-header>
                    <ion-card-title>ストレージ状態</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-item>
                        <ion-label>
                            <h3>ローカルストレージ</h3>
                            <p>{{ storageStatus.storageAvailability.localStorage ? '利用可能' : '利用不可' }}</p>
                        </ion-label>
                        <ion-icon :icon="storageStatus.storageAvailability.localStorage ? checkmarkCircle : closeCircle"
                            slot="end"
                            :color="storageStatus.storageAvailability.localStorage ? 'success' : 'danger'"></ion-icon>
                    </ion-item>
                    <ion-item>
                        <ion-label>
                            <h3>ローカルデータ</h3>
                            <p>{{ storageStatus.hasLocalData ? 'あり' : 'なし' }}</p>
                        </ion-label>
                        <ion-icon :icon="storageStatus.hasLocalData ? checkmarkCircle : closeCircle" slot="end"
                            :color="storageStatus.hasLocalData ? 'success' : 'warning'"></ion-icon>
                    </ion-item>
                </ion-card-content>
            </ion-card> -->

            <!-- データ管理情報 -->
            <DataInfoCard
                :show-card="dataCount > 0"
                :info-items="[
                    {
                        key: 'food-count',
                        label: '登録済み食品数',
                        value: `${dataCount}件`,
                        icon: restaurantOutline,
                        color: 'primary'
                    },
                    {
                        key: 'category-count',
                        label: '登録済みカテゴリ数',
                        value: `${categories.length}件`,
                        icon: listOutline,
                        color: 'secondary'
                    }
                ]"
            />

            <!-- 食品データ表示 -->
            <DataListCard
                :data="data"
                title="食品データ一覧"
                :is-loading="isLoading"
                empty-message-title="食品が登録されていません"
                empty-message-text="「新しい食品を追加」ボタンをクリックして、食品を追加してください。"
                :get-id-function="(item: FoodWithCategory) => item.id"
                :get-name-function="(item: FoodWithCategory) => item.name"
                :get-description-function="(item: FoodWithCategory) => item.category_name"
                :get-date-function="(item: FoodWithCategory) => `登録日: ${formatDate(item.created_at)}`"
                @edit="openEditModalLocal"
                @delete="deleteItem"
            >
                <template #item="{ item }">
                    <ion-icon :icon="restaurantOutline" slot="start" color="primary"></ion-icon>
                    <ion-label>
                        <h2>{{ item.name }}</h2>
                        <p>
                            <ion-chip color="primary">{{ item.category_name }}</ion-chip>
                        </p>
                        <div v-if="item.url">
                            <ion-chip color="tertiary" @click="openUrl(item.url)">
                                <ion-icon :icon="linkOutline"></ion-icon>
                                <ion-label>URL</ion-label>
                            </ion-chip>
                        </div>
                        <div v-if="item.memo">
                            <p class="memo-text">📝 {{ item.memo }}</p>
                        </div>
                        <div v-if="item.price">
                            <p class="price-text">💰 {{ item.price.toLocaleString() }}円</p>
                        </div>
                        <div v-if="item.expiry_date" class="expiry-date-text">
                            <p>📅 消費期限: {{ formatDate(item.expiry_date) }}</p>
                        </div>
                        <div v-if="item.quantity">
                            <p class="quantity-text">🔢 個数: {{ item.quantity }}個</p>
                        </div>
                        <div v-if="item.weight">
                            <p class="weight-text">⚖️ グラム数: {{ item.weight }}g</p>
                        </div>
                        <p class="item-date">登録日: {{ formatDate(item.created_at) }}</p>
                    </ion-label>
                </template>
            </DataListCard>

            <!-- 食品追加モーダル -->
            <FormModal
                :is-open="showAddModal"
                title="新しい食品を追加"
                :is-loading="isLoading"
                :is-form-valid="isFormValid"
                submit-text="追加"
                loading-text="追加中..."
                :submit-icon="addOutline"
                @close="closeAddModal"
                @submit="insertData"
            >
                <template #form-fields>
                    <FormField
                        label="食品名"
                        type="text"
                        v-model="foodForm.name"
                        placeholder="食品名を入力"
                        :required="true"
                    />
                    
                    <FormField
                        label="カテゴリ"
                        type="select"
                        v-model="foodForm.category"
                        placeholder="カテゴリを選択"
                        :required="true"
                        :options="categories"
                        :get-option-value="(cat: Category) => cat.name"
                        :get-option-label="(cat: Category) => cat.name"
                    />
                    
                    <ion-item v-if="categories.length === 0">
                        <ion-label color="warning">
                            <p>カテゴリが登録されていません。</p>
                            <p>カテゴリ管理ページでカテゴリを追加してください。</p>
                        </ion-label>
                    </ion-item>
                    
                    <FormField
                        label="URL"
                        type="url"
                        v-model="foodForm.url"
                        placeholder="https://example.com"
                    />
                    
                    <FormField
                        label="メモ"
                        type="textarea"
                        v-model="foodForm.memo"
                        placeholder="メモを入力してください"
                        :rows="3"
                    />
                    
                    <FormField
                        label="価格"
                        type="number"
                        v-model="foodForm.price"
                        placeholder="価格 (円)"
                        :min="0"
                    />
                    
                    <FormField
                        label="消費期限"
                        type="datetime"
                        v-model="foodForm.expiry_date"
                        datetime-presentation="date"
                    />
                    
                    <FormField
                        label="個数"
                        type="number"
                        v-model="foodForm.quantity"
                        placeholder="個数"
                        :min="0"
                    />
                    
                    <FormField
                        label="グラム数"
                        type="number"
                        v-model="foodForm.weight"
                        placeholder="グラム数"
                        :min="0"
                        :step="0.1"
                    />
                </template>
            </FormModal>

            <!-- 編集モーダル -->
            <FormModal
                    :is-open="showEditModal"
                    :title="`食品を編集: ${editingItem?.name || ''}`"
                    :is-loading="isLoading"
                    :is-form-valid="isEditFormValid"
                    submit-text="更新"
                    loading-text="更新中..."
                    :submit-icon="saveOutline"
                    @close="closeEditModal"
                    @submit="updateItemData"
                >
                <template #form-fields>
                    <FormField
                        label="食品名"
                        type="text"
                        v-model="editForm.name"
                        placeholder="食品名を入力"
                        :required="true"
                    />
                    
                    <FormField
                        label="カテゴリ"
                        type="select"
                        v-model="editForm.category"
                        placeholder="カテゴリを選択"
                        :required="true"
                        :options="categories"
                        :get-option-value="(cat: Category) => cat.name"
                        :get-option-label="(cat: Category) => cat.name"
                    />
                    
                    <FormField
                        label="URL"
                        type="url"
                        v-model="editForm.url"
                        placeholder="https://example.com"
                    />
                    
                    <FormField
                        label="メモ"
                        type="textarea"
                        v-model="editForm.memo"
                        placeholder="メモを入力してください"
                        :rows="3"
                    />
                    
                    <FormField
                        label="価格"
                        type="number"
                        v-model="editForm.price"
                        placeholder="価格 (円)"
                        :min="0"
                    />
                    
                    <FormField
                        label="消費期限"
                        type="datetime"
                        v-model="editForm.expiry_date"
                        datetime-presentation="date"
                    />
                    
                    <FormField
                        label="個数"
                        type="number"
                        v-model="editForm.quantity"
                        placeholder="個数"
                        :min="0"
                    />
                    
                    <FormField
                        label="グラム数"
                        type="number"
                        v-model="editForm.weight"
                        placeholder="グラム数"
                        :min="0"
                        :step="0.1"
                    />
                </template>
            </FormModal>

                        <!-- 操作ボタン -->
                        <ActionButtonsCard :is-loading="isLoading">
                <template #buttons>
                    <ion-button expand="block" fill="outline" @click="getAllData" :disabled="isLoading">
                        <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
                        {{ isLoading ? '処理中...' : 'データ取得' }}
                    </ion-button>

                    <ion-button expand="block" fill="outline" color="danger" @click="clearAllData"
                        :disabled="isLoading">
                        <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                        {{ isLoading ? '処理中...' : '全データクリア' }}
                    </ion-button>

                    <ion-button 
                        v-if="dataCount === 0"
                        expand="block" 
                        fill="outline" 
                        color="tertiary" 
                        @click="insertTestData"
                        :disabled="isLoading">
                        <ion-icon :icon="cubeOutline" slot="start"></ion-icon>
                        {{ isLoading ? '処理中...' : '初期の食品データを追加' }}
                    </ion-button>

                    <ion-button expand="block" color="primary" @click="openAddModal" :disabled="isLoading">
                        <ion-icon :icon="addOutline" slot="start"></ion-icon>
                        {{ isLoading ? '処理中...' : '新しい食品を追加' }}
                    </ion-button>
                </template>
            </ActionButtonsCard>

        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
// Vue Composition API
import { ref, onMounted, onUnmounted } from 'vue'

// Ionic Vue コンポーネント
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonChip,
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonDatetime
} from '@ionic/vue'

// Ionicons
import {
    refreshOutline,
    trashOutline,
    createOutline,
    addOutline,
    closeOutline,
    restaurantOutline,
    listOutline,
    linkOutline,
    saveOutline,
    cubeOutline
} from 'ionicons/icons'

// ユーティリティとマネージャー
import { SQLiteManager } from '~/utils/managers/SQLiteManager'
import { formatDate, getPageMeta, showConfirmDialog } from '~/utils/helpers/pageUtils'

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
import type { Food, FoodWithCategory, Category } from '~/types'

/**
 * ページのメタデータを設定
 */
useHead(getPageMeta('食品管理', '食品データの管理画面'))

// =================== 共通composables ===================

const {
  result,
  connectionStatus,
  isConnected,
  isLoading,
  platformInfo,
  dbManager: pageDbManager,
  initializePlatformInfo,
  updateConnectionStatus,
  createConnection: pageCreateConnection,
  resetState
} = usePageState()

const {
  showAddModal,
  showEditModal,
  openAddModal,
  closeAddModal,
  openEditModal: composableOpenEditModal,
  closeEditModal: composableCloseEditModal,
  resetModalState
} = useModal()

const {
  confirmDelete,
  handleError,
  setSuccessMessage,
  setLoading
} = useDataOperations()

const {
  form: foodForm,
  resetForm,
  validateForm
} = useForm({
  name: '',
  category: '',
  url: '',
  memo: '',
  price: null as number | null,
  expiry_date: '',
  quantity: null as number | null,
  weight: null as number | null
})

const { setupPageLifecycle } = useLifecycle()

// 新しい共通composables
const {
  data,
  dataCount,
  fetchData,
  insertData: composableInsertData,
  updateData,
  deleteData,
  clearAllData: clearAllDataFromComposable
} = useDataManagement<FoodWithCategory>()

const {
  form: validationForm,
  validateForm: validateFormFields,
  isFormValid: isValidationFormValid,
  resetForm: resetValidationForm
} = useFormValidation({
  name: '',
  category: '',
  url: '',
  memo: '',
  price: null as number | null,
  expiry_date: '',
  quantity: null as number | null,
  weight: null as number | null
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

/** カテゴリ一覧 */
const categories = ref<Category[]>([])

/** 編集中のアイテム */
const editingItem = ref<FoodWithCategory | null>(null)

/** 編集フォーム */
const editForm = ref({
    name: '',
    category: '',
    url: '',
    memo: '',
    price: null as number | null,
    expiry_date: '',
    quantity: null as number | null,
    weight: null as number | null
})

/** フォームのバリデーション */
const isFormValid = computed((): boolean => {
    return foodForm.value.name.trim() !== '' && foodForm.value.category.trim() !== ''
})

/** 編集フォームのバリデーション */
const isEditFormValid = computed((): boolean => {
    return editForm.value.name.trim() !== '' && editForm.value.category.trim() !== ''
})

/** Webストレージ状態管理 */
const storageStatus = ref({
    hasLocalData: false,
    hasSessionData: false,
    lastSyncTime: undefined as string | undefined,
    storageAvailability: {
        localStorage: false,
        sessionStorage: false
    }
})

// =================== データベース管理 ===================

/** SQLiteManagerのインスタンス */
const dbManager = pageDbManager

// =================== ユーティリティ機能 ===================

/**
 * URLを開く
 * @param url - 開くURL
 */
const openUrl = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer')
}

// =================== モーダル管理機能 ===================

/**
 * 編集モーダルを開く
 * @param item - 編集対象の食品データ
 */
const openEditModalLocal = (item: FoodWithCategory): void => {
    editingItem.value = item
    editForm.value = {
        name: item.name || '',
        category: item.category_name || '',
        url: item.url || '',
        memo: item.memo || '',
        price: item.price || null,
        expiry_date: item.expiry_date || '',
        quantity: item.quantity || null,
        weight: item.weight || null
    }
    composableOpenEditModal()
}

/**
 * 編集モーダルを閉じる
 */
const closeEditModal = (): void => {
    composableCloseEditModal()
    editingItem.value = null
    editForm.value = {
        name: '',
        category: '',
        url: '',
        memo: '',
        price: null,
        expiry_date: '',
        quantity: null,
        weight: null
    }
}

// =================== データ更新機能 ===================

/**
 * アイテムデータを更新
 */
const updateItemData = async (): Promise<void> => {
    if (!editingItem.value?.id) return

    // カテゴリ名からIDを取得
    const selectedCategory = categories.value.find((cat: Category) => cat.name === editForm.value.category)
    if (!selectedCategory) {
        result.value = '選択されたカテゴリが見つかりません。'
        return
    }

    const updateData: Partial<Food> = {
        name: editForm.value.name.trim(),
        category_id: selectedCategory.id || 1,
        url: editForm.value.url.trim() || undefined,
        memo: editForm.value.memo.trim() || undefined,
        price: editForm.value.price || undefined,
        expiry_date: editForm.value.expiry_date || undefined,
        quantity: editForm.value.quantity || undefined,
        weight: editForm.value.weight || undefined,
    }

    try {
        isLoading.value = true
        result.value = 'データを更新中...'

        const response = await dbManager.updateFood(editingItem.value.id, updateData)
        result.value = response.message

        if (response.success) {
            await getAllData()
            closeEditModal()
        }
    } catch (error) {
        result.value = `データ更新エラー: ${error}`
        console.error('データ更新エラー:', error)
    } finally {
        isLoading.value = false
    }
}

/**
 * 食品追加モーダルを開く
 */
const openAddFoodModal = (): void => {
    if (isLoading.value) {
        return
    }
    openAddModal()
}

/**
 * 食品追加モーダルを閉じる
 */
const closeAddFoodModal = (): void => {
    closeAddModal()
    resetForm()
}




/**
 * データベース接続を作成
 */
const createConnection = async () => {
    await pageCreateConnection()
}



/**
 * 全てのカテゴリを取得
 */
const getAllCategories = async () => {
    try {
        const response = await dbManager.getAllCategories()

        if (response.success) {
            categories.value = response.data || []
        } else {
            console.error('カテゴリ取得エラー:', response.message)
        }
    } catch (error) {
        console.error('カテゴリ取得エラー:', error)
    }
}

/**
 * データを挿入
 */
const insertData = async () => {
    // カテゴリが存在しない場合はエラー
    if (categories.value.length === 0) {
        result.value = 'カテゴリが存在しません。先にカテゴリを作成してください。'
        return
    }

    // 選択されたカテゴリ名からIDを取得
    const selectedCategory = categories.value.find((cat: Category) => cat.name === foodForm.value.category)
    if (!selectedCategory) {
        result.value = '選択されたカテゴリが見つかりません。'
        return
    }

    const food: Food = {
        name: foodForm.value.name,
        category_id: selectedCategory.id || 1,
        url: foodForm.value.url.trim(),
        memo: foodForm.value.memo.trim(),
        price: foodForm.value.price || undefined,
        expiry_date: foodForm.value.expiry_date || undefined,
        quantity: foodForm.value.quantity || undefined,
        weight: foodForm.value.weight || undefined,
    }

    await composableInsertData(
        () => {
            const platformInfo = dbManager.getPlatformInfo()
            console.log('食品追加時のプラットフォーム情報:', platformInfo)
            console.log('追加する食品データ:', food)
            return dbManager.insertFood(food)
        },
        '食品データ',
        async () => {
            closeAddModal()
            resetForm()
        }
    )
}




/**
 * テストデータを挿入
 */
const insertTestData = async () => {
    try {
        isLoading.value = true
        result.value = '初期データを追加中...'
        
        // まずカテゴリが存在するか確認
        const categoriesResponse = await dbManager.getAllCategories()
        
        // カテゴリが存在しない場合は初期カテゴリを追加
        if (!categoriesResponse.success || !categoriesResponse.data || categoriesResponse.data.length === 0) {
            result.value = 'カテゴリが存在しません。初期カテゴリを追加中...'
            const insertCategoriesResponse = await dbManager.insertInitialCategories()
            
            if (!insertCategoriesResponse.success) {
                result.value = `初期カテゴリの追加に失敗しました: ${insertCategoriesResponse.message}`
                isLoading.value = false
                return
            }
            
            // カテゴリ一覧を更新
            await getAllCategories()
            result.value = '初期カテゴリを追加しました。食品データを追加中...'
        }
        
        // テストデータを挿入
        const testDataResponse = await dbManager.insertTestData()
        
        if (testDataResponse.success) {
            result.value = testDataResponse.message
            await getAllData()
        } else {
            result.value = `食品データの追加に失敗しました: ${testDataResponse.message}`
        }
    } catch (error) {
        result.value = `初期データ追加エラー: ${error}`
        console.error('初期データ追加エラー:', error)
    } finally {
        isLoading.value = false
    }
}


/**
 * 全てのデータを取得（プラットフォームに応じて自動選択）
 */
const getAllData = async () => {
    await fetchData(
        async () => await dbManager.getFoodsFromWebStorage(),
        async () => await dbManager.getAllFoods(),
        '食品データ'
    )
    
    // ストレージ状態を更新
    updateStorageStatus()
}


/**
 * 全データをクリア（プラットフォームに応じて自動選択）
 */
const clearAllData = async () => {
    // 確認ダイアログを表示
    const confirmed = showConfirmDialog('全てのデータを削除してもよろしいですか？\n\nこの操作は取り消せません。')

    if (!confirmed) {
        return
    }

    await clearAllDataFromComposable('食品データ')
    
    // ストレージ状態を更新
    updateStorageStatus()
}

/**
 * ストレージ状態を更新
 */
const updateStorageStatus = () => {
    const status = dbManager.getWebStorageSyncStatus()
    storageStatus.value = {
        hasLocalData: status.hasLocalData,
        hasSessionData: status.hasSessionData,
        lastSyncTime: status.lastSyncTime,
        storageAvailability: status.storageAvailability
    }
}


/**
 * Webプラットフォーム用の初期データを作成
 */
const createInitialWebData = async () => {
    try {
        isLoading.value = true
        result.value = 'Webプラットフォーム用の初期データを作成中...'

        const response = dbManager.createInitialWebData()

        if (response.success) {
            result.value = response.message
            // カテゴリを再取得
            await getAllCategories()
            // ストレージ状態を更新
            updateStorageStatus()
        } else {
            result.value = response.message
        }
    } catch (error) {
        result.value = `初期データ作成エラー: ${error}`
        console.error('初期データ作成エラー:', error)
    } finally {
        isLoading.value = false
    }
}



/**
 * 個別データを削除
 */
const deleteItem = async (id: number) => {
    // 削除対象の食品を検索
    const food = data.value.find(item => item.id === id)
    const foodName = food?.name || `ID ${id}`

    // 確認ダイアログを表示
    const confirmed = showConfirmDialog(`「${foodName}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)

    if (!confirmed) {
        return
    }

    try {
        isLoading.value = true
        result.value = `ID ${id} のデータを削除中...`

        console.log('削除処理を開始します:', id)
        const response = await dbManager.deleteFood(id)
        console.log('削除処理レスポンス:', response)

        if (response.success) {
            console.log('削除が成功しました。データを再取得します。')
            
            // 削除後にデータを再取得（ローディング状態を一時的に解除）
            isLoading.value = false
            
            // 少し待機してからデータ再取得
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // データ再取得を実行
            try {
                await getAllData()
            } catch (error) {
                console.error('データ再取得でエラーが発生しました:', error)
            }
            
            result.value = response.message
            console.log('削除処理が完了しました。')
            
            // Vueのリアクティブシステムを確実に動作させるため、次のティックで更新
            await new Promise(resolve => setTimeout(resolve, 0))
            console.log('UIの更新を確実にします。')
        } else {
            result.value = response.message
            console.error('削除に失敗しました:', response.message)
        }
    } catch (error) {
        result.value = `データ削除エラー: ${error}`
        console.error('データ削除エラー:', error)
    } finally {
        // ローディング状態を必ず解除（成功時は既に解除済み）
        if (isLoading.value) {
            isLoading.value = false
            console.log('削除処理のローディング状態を解除しました')
        }
    }
}

/**
 * 接続を終了
 */
const closeConnection = async () => {
    try {
        isLoading.value = true
        result.value = '接続を終了中...'

        const response = await dbManager.closeConnection()

        if (response.success) {
            isConnected.value = false
            connectionStatus.value = '未接続'
            result.value = response.message
            data.value = []
            dataCount.value = 0
        } else {
            result.value = response.message
        }
    } catch (error) {
        result.value = `接続終了エラー: ${error}`
        console.error('接続終了エラー:', error)
    } finally {
        isLoading.value = false
    }
}



// =================== ライフサイクル管理 ===================

/**
 * コンポーネントマウント時の処理
 */
onMounted(async (): Promise<void> => {
    console.log('食品管理ページが読み込まれました')
    
    // プラットフォーム情報を初期化
    platformInfo.value = dbManager.getPlatformInfo()
    
    // データベース接続
    await createConnection()
    
    // データ取得
    await getAllCategories()
    await getAllData()
    
    // 接続状態を更新
    isConnected.value = dbManager.getConnectionStatus()
    connectionStatus.value = isConnected.value ? '接続済み' : '未接続'
})

/**
 * コンポーネントアンマウント時の処理
 */
onUnmounted((): void => {
    // 状態のリセット
    data.value = []
    dataCount.value = 0
    categories.value = []
    foodForm.value = {
        name: '',
        category: '',
        url: '',
        memo: '',
        price: null,
        expiry_date: '',
        quantity: null,
        weight: null
    }
    editingItem.value = null
    showAddModal.value = false
    showEditModal.value = false
    result.value = ''
    connectionStatus.value = '未接続'
    isConnected.value = false
    isLoading.value = false
})
</script>
