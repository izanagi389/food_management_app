<template>
  <ion-page class="recipe-page">
    <PageHeader title="レシピ管理" />

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
          <ion-button expand="block" fill="outline" @click="getAllRecipes" :disabled="isLoading">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : 'レシピ取得' }}
          </ion-button>

          <ion-button expand="block" fill="outline" color="danger" @click="clearAllData" :disabled="isLoading">
            <ion-icon :icon="trashOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : '全データクリア' }}
          </ion-button>

          <ion-button expand="block" color="primary" @click="openAddRecipeModal" :disabled="isLoading">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : '新しいレシピを追加' }}
          </ion-button>
        </template>
      </ActionButtonsCard>

      <!-- データ管理情報 -->
      <DataInfoCard
        :show-card="dataCount > 0"
        :info-items="[
          {
            key: 'recipe-count',
            label: '登録済みレシピ数',
            value: `${dataCount}件`,
            icon: bookOutline,
            color: 'primary'
          }
        ]"
      />

      <!-- レシピデータ表示 -->
      <DataListCard
        :data="recipes"
        title="レシピ一覧"
        :is-loading="isLoading"
        empty-message-title="レシピが登録されていません"
        empty-message-text="「新しいレシピを追加」ボタンをクリックして、レシピを追加してください。"
        :get-id-function="(item: Recipe) => item.id"
        :get-name-function="(item: Recipe) => item.name"
        :get-description-function="(item: Recipe) => item.description || ''"
        :show-edit-button="false"
        @delete="deleteRecipe"
      >
        <template #item="{ item }">
          <ion-icon :icon="bookOutline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p v-if="item.description">📝 {{ item.description }}</p>
            <div class="recipe-details">
              <ion-chip v-if="item.cooking_time" color="primary">
                <ion-icon :icon="timeOutline"></ion-icon>
                <ion-label>{{ item.cooking_time }}分</ion-label>
              </ion-chip>
              <ion-chip v-if="item.servings" color="secondary">
                <ion-icon :icon="peopleOutline"></ion-icon>
                <ion-label>{{ item.servings }}人分</ion-label>
              </ion-chip>
              <ion-chip v-if="item.difficulty" color="tertiary">
                <ion-icon :icon="starOutline"></ion-icon>
                <ion-label>{{ getDifficultyText(item.difficulty) }}</ion-label>
              </ion-chip>
            </div>
            <div
              v-if="item.instruction_steps && item.instruction_steps.length"
              class="recipe-timeline"
            >
              <div class="timeline-header">
                <ion-icon :icon="informationCircleOutline" color="primary"></ion-icon>
                <span>調理手順</span>
              </div>
              <div class="timeline-steps">
                <div
                  v-for="(step, stepIndex) in item.instruction_steps"
                  :key="`recipe-${item.id ?? 'new'}-step-${step.order ?? stepIndex}`"
                  class="timeline-step"
                >
                  <div class="timeline-marker">
                    <span class="timeline-number">{{ stepIndex + 1 }}</span>
                    <div
                      v-if="stepIndex !== item.instruction_steps.length - 1"
                      class="timeline-line"
                    ></div>
                  </div>
                  <div class="timeline-content">
                    <h4>{{ step.title || `ステップ ${stepIndex + 1}` }}</h4>
                    <p>{{ step.description }}</p>
                    <div
                      v-if="step.durationMinutes || step.note"
                      class="timeline-meta"
                    >
                      <ion-chip v-if="step.durationMinutes" color="medium">
                        <ion-icon :icon="timeOutline" slot="start"></ion-icon>
                        <ion-label>{{ step.durationMinutes }}分</ion-label>
                      </ion-chip>
                      <p v-if="step.note" class="timeline-note">💡 {{ step.note }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p class="item-date">登録日: {{ formatDate(item.created_at || item.updated_at) }}</p>
          </ion-label>
        </template>
      </DataListCard>

      <!-- レシピ追加モーダル -->
      <ion-modal :is-open="showAddRecipeModal" @did-dismiss="closeAddRecipeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>新しいレシピを追加</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddRecipeModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="ion-padding">
          <form @submit.prevent="insertRecipeData">
            <ion-item>
              <ion-label position="stacked">レシピ名 *</ion-label>
              <ion-input v-model="name" placeholder="レシピ名を入力" required></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">説明 (任意)</ion-label>
              <ion-textarea v-model="description" placeholder="レシピの説明を入力" :rows="3"></ion-textarea>
            </ion-item>
            
            <!-- 食材選択セクション -->
            <ion-item>
              <ion-label>
                <h3>食材選択</h3>
                <p>レシピに使用する食材を選択してください</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">食材 *</ion-label>
              <ion-select v-model="selectedIngredientId" placeholder="食材を選択" :disabled="availableIngredients.length === 0" @ion-change="onIngredientSelectChange">
                <ion-select-option v-for="ingredient in availableIngredients" :key="ingredient.id" :value="ingredient.id">
                  {{ ingredient.name }}
                </ion-select-option>
                <ion-select-option value="add-new">
                  ➕ 新しい食材を追加
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item v-if="availableIngredients.length === 0">
              <ion-label color="warning">
                <p>食材が登録されていません。</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">使用量 (任意)</ion-label>
              <ion-input v-model="ingredientQuantity" type="number" placeholder="使用量" min="0" step="0.1"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">単位 (任意)</ion-label>
              <ion-input v-model="ingredientUnit" placeholder="単位 (例: g, ml, 個)"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">備考 (任意)</ion-label>
              <ion-input v-model="ingredientNotes" placeholder="備考"></ion-input>
            </ion-item>

            <ion-item>
              <ion-button expand="block" fill="outline" @click="addIngredientToRecipe" :disabled="!selectedIngredientId">
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                食材を追加
              </ion-button>
            </ion-item>

            <!-- 選択された食材一覧 -->
            <ion-item v-if="selectedIngredients.length > 0">
              <ion-label>
                <h3>選択された食材 ({{ selectedIngredients.length }}件)</h3>
              </ion-label>
            </ion-item>

            <ion-list v-if="selectedIngredients.length > 0">
              <ion-item v-for="(ingredient, index) in selectedIngredients" :key="index">
                <ion-label>
                  <h3>{{ getIngredientName(ingredient.ingredient_id) }}</h3>
                  <p v-if="ingredient.quantity || ingredient.unit">
                    {{ ingredient.quantity || '' }}{{ ingredient.unit || '' }}
                  </p>
                  <p v-if="ingredient.notes">{{ ingredient.notes }}</p>
                  <p class="ingredient-index">#{{ index + 1 }}</p>
                </ion-label>
                <ion-button slot="end" fill="clear" color="danger" @click="removeIngredientFromRecipe(index)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </ion-item>
            </ion-list>

            <!-- 調理手順 -->
            <ion-card class="instruction-card">
              <ion-card-header>
                <ion-card-title>調理手順</ion-card-title>
                <p class="instruction-card-description">ステップごとにタイムライン形式で手順を登録できます。</p>
              </ion-card-header>
              <ion-card-content>
                <div
                  v-for="(step, index) in instructionSteps"
                  :key="step.id"
                  class="instruction-step-form"
                >
                  <div class="instruction-step-toolbar">
                    <ion-chip color="primary">
                      <ion-label>Step {{ index + 1 }}</ion-label>
                    </ion-chip>

                    <div class="instruction-step-actions">
                      <ion-button
                        size="small"
                        fill="clear"
                        @click="moveInstructionStep(index, 'up')"
                        :disabled="index === 0"
                      >
                        <ion-icon :icon="chevronUpOutline"></ion-icon>
                      </ion-button>
                      <ion-button
                        size="small"
                        fill="clear"
                        @click="moveInstructionStep(index, 'down')"
                        :disabled="index === instructionSteps.length - 1"
                      >
                        <ion-icon :icon="chevronDownOutline"></ion-icon>
                      </ion-button>
                      <ion-button
                        size="small"
                        fill="clear"
                        color="danger"
                        @click="removeInstructionStep(index)"
                      >
                        <ion-icon :icon="trashOutline"></ion-icon>
                      </ion-button>
                    </div>
                  </div>

                  <ion-item lines="full">
                    <ion-label position="stacked">ステップタイトル (任意)</ion-label>
                    <ion-input
                      v-model="step.title"
                      placeholder="例: 野菜を切る"
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="full">
                    <ion-label position="stacked">説明 *</ion-label>
                    <ion-textarea
                      v-model="step.description"
                      auto-grow
                      :rows="3"
                      placeholder="手順の内容を入力してください"
                    ></ion-textarea>
                  </ion-item>

                  <ion-item lines="full">
                    <ion-label position="stacked">目安時間 (分)</ion-label>
                    <ion-input
                      v-model.number="step.durationMinutes"
                      type="number"
                      min="0"
                      placeholder="例: 5"
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none">
                    <ion-label position="stacked">メモ (任意)</ion-label>
                    <ion-textarea
                      v-model="step.note"
                      auto-grow
                      :rows="2"
                      placeholder="コツや注意点を入力してください"
                    ></ion-textarea>
                  </ion-item>
                </div>

                <div class="instruction-actions">
                  <ion-button expand="block" fill="outline" color="medium" @click="addInstructionStep">
                    <ion-icon :icon="addOutline" slot="start"></ion-icon>
                    手順を追加
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
            
            <ion-item>
              <ion-label position="stacked">調理時間 (任意)</ion-label>
              <ion-input v-model="cooking_time" type="number" placeholder="調理時間 (分)" min="0"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">人数 (任意)</ion-label>
              <ion-input v-model="servings" type="number" placeholder="人数" min="1"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">難易度 (任意)</ion-label>
              <ion-select v-model="difficulty" placeholder="難易度を選択">
                <ion-select-option value="">難易度を選択</ion-select-option>
                <ion-select-option value="easy">簡単</ion-select-option>
                <ion-select-option value="medium">普通</ion-select-option>
                <ion-select-option value="hard">難しい</ion-select-option>
              </ion-select>
            </ion-item>
            
            <div class="ion-padding-top">
              <ion-button expand="block" type="submit" :disabled="isLoading || !name.trim()">
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                {{ isLoading ? '追加中...' : '追加' }}
              </ion-button>
              <ion-button expand="block" fill="outline" @click="closeAddRecipeModal">
                <ion-icon :icon="closeOutline" slot="start"></ion-icon>
                キャンセル
              </ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>

      <!-- 新規食材追加モーダル -->
      <ion-modal :is-open="showAddIngredientModal" @did-dismiss="closeAddIngredientModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>新しい食材を追加</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddIngredientModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="ion-padding">
          <form @submit.prevent="insertNewIngredient">
            <ion-item>
              <ion-label position="stacked">食材名 *</ion-label>
              <ion-input v-model="newIngredientName" placeholder="食材名を入力" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">カテゴリ *</ion-label>
              <ion-select v-model="newIngredientCategory" placeholder="カテゴリを選択" required>
                <ion-select-option v-for="category in availableCategories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item v-if="availableCategories.length === 0">
              <ion-label color="warning">
                <p>カテゴリが登録されていません。先にカテゴリ管理ページでカテゴリを登録してください。</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">URL (任意)</ion-label>
              <ion-input v-model="newIngredientUrl" type="url" placeholder="https://example.com"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">メモ (任意)</ion-label>
              <ion-textarea v-model="newIngredientMemo" placeholder="メモを入力してください" :rows="3"></ion-textarea>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">価格 (任意)</ion-label>
              <ion-input v-model="newIngredientPrice" type="number" placeholder="価格 (円)" min="0"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">消費期限 (任意)</ion-label>
              <ion-datetime v-model="newIngredientExpiryDate" presentation="date" :show-default-buttons="true"></ion-datetime>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">個数 (任意)</ion-label>
              <ion-input v-model="newIngredientQuantity" type="number" placeholder="個数" min="0"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">グラム数 (任意)</ion-label>
              <ion-input v-model="newIngredientWeight" type="number" placeholder="グラム数" min="0" step="0.1"></ion-input>
            </ion-item>
            
            <div class="ion-padding-top">
              <ion-button expand="block" type="submit" :disabled="isLoading || !newIngredientName.trim() || !newIngredientCategory">
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                {{ isLoading ? '追加中...' : '食材を追加' }}
              </ion-button>
              <ion-button expand="block" fill="outline" @click="closeAddIngredientModal">
                <ion-icon :icon="closeOutline" slot="start"></ion-icon>
                キャンセル
              </ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>
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
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonChip
} from '@ionic/vue'

// Ionicons
import { 
  refreshOutline, 
  trashOutline, 
  addOutline, 
  closeOutline, 
  timeOutline,
  peopleOutline,
  starOutline,
  bookOutline,
  informationCircleOutline,
  chevronUpOutline,
  chevronDownOutline
} from 'ionicons/icons'

// ユーティリティとマネージャー
import { SQLiteManager } from '~/utils/managers/SQLiteManager'
import { formatDate, getPageMeta, showConfirmDialog, getDifficultyText } from '~/utils/helpers/pageUtils'

// 型定義
import type { Recipe, Ingredient, RecipeIngredient, Category, RecipeInstructionStep } from '~/types'

/**
 * ページのメタデータを設定
 */
useHead(getPageMeta('レシピ管理', 'レシピデータの管理画面'))

// =================== リアクティブな状態管理 ===================

/** 操作結果メッセージ */
const result = ref<string>('')

/** 接続状態 */
const connectionStatus = ref<string>('未接続')

/** 接続フラグ */
const isConnected = ref<boolean>(false)

/** ローディング状態 */
const isLoading = ref<boolean>(false)

/** レシピ一覧 */
const recipes = ref<Recipe[]>([])

/** データ件数 */
const dataCount = ref<number>(0)

/** 利用可能な食材一覧 */
const availableIngredients = ref<Ingredient[]>([])

/** 選択された食材一覧 */
const selectedIngredients = ref<RecipeIngredient[]>([])

/** 利用可能なカテゴリ一覧 */
const availableCategories = ref<Category[]>([])

// =================== フォーム管理 ===================

/** レシピ名 */
const name = ref<string>('')

/** 説明 */
const description = ref<string>('')

/** 調理時間 */
const cooking_time = ref<number | null>(null)

/** 人数 */
const servings = ref<number | null>(null)

/** 難易度 */
const difficulty = ref<'easy' | 'medium' | 'hard' | ''>('')

// =================== 手順管理 ===================

interface InstructionStepForm {
  id: number
  title: string
  description: string
  durationMinutes: number | null
  note: string
}

const instructionSteps = ref<InstructionStepForm[]>([])
const instructionStepCounter = ref<number>(1)

const createInstructionStep = (): InstructionStepForm => {
  const step: InstructionStepForm = {
    id: instructionStepCounter.value++,
    title: '',
    description: '',
    durationMinutes: null,
    note: ''
  }
  return step
}

const addInstructionStep = (): void => {
  instructionSteps.value.push(createInstructionStep())
}

const removeInstructionStep = (index: number): void => {
  instructionSteps.value.splice(index, 1)
  if (instructionSteps.value.length === 0) {
    addInstructionStep()
  }
}

const moveInstructionStep = (index: number, direction: 'up' | 'down'): void => {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= instructionSteps.value.length) {
    return
  }
  const steps = [...instructionSteps.value]
  const currentStep = steps[index]
  const targetStep = steps[targetIndex]
  if (!currentStep || !targetStep) {
    return
  }
  steps[index] = targetStep
  steps[targetIndex] = currentStep
  instructionSteps.value = steps
}

const resetInstructionSteps = (): void => {
  instructionSteps.value = []
  instructionStepCounter.value = 1
}

const ensureInstructionStep = (): void => {
  if (instructionSteps.value.length === 0) {
    addInstructionStep()
  }
}

// =================== 食材選択管理 ===================

/** 選択された食材ID */
const selectedIngredientId = ref<number | null>(null)

/** 食材数量 */
const ingredientQuantity = ref<number | null>(null)

/** 食材単位 */
const ingredientUnit = ref<string>('')

/** 食材備考 */
const ingredientNotes = ref<string>('')

// =================== モーダル状態管理 ===================

/** レシピ追加モーダルの表示状態 */
const showAddRecipeModal = ref<boolean>(false)

/** 食材追加モーダルの表示状態 */
const showAddIngredientModal = ref<boolean>(false)

// =================== 新規食材追加フォーム ===================

/** 新規食材名 */
const newIngredientName = ref<string>('')

/** 新規食材カテゴリ */
const newIngredientCategory = ref<number | null>(null)

/** 新規食材URL */
const newIngredientUrl = ref<string>('')

/** 新規食材メモ */
const newIngredientMemo = ref<string>('')

/** 新規食材価格 */
const newIngredientPrice = ref<number | null>(null)

/** 新規食材消費期限 */
const newIngredientExpiryDate = ref<string>('')

/** 新規食材個数 */
const newIngredientQuantity = ref<number | null>(null)

/** 新規食材重量 */
const newIngredientWeight = ref<number | null>(null)

// =================== プラットフォーム情報 ===================

/** プラットフォーム情報 */
const platformInfo = ref({
  isWebPlatform: false,
  platform: 'Unknown',
  canUseSQLite: false
})

// =================== データベース管理 ===================

/** SQLiteManagerのインスタンス */
const dbManager = SQLiteManager.getInstance()

// =================== モーダル管理機能 ===================

/**
 * レシピ追加モーダルを開く
 */
const openAddRecipeModal = async (): Promise<void> => {
  showAddRecipeModal.value = true
  ensureInstructionStep()
  await loadAvailableIngredients()
}

/**
 * 食材選択の変更を処理
 * @param event - 選択変更イベント
 */
const onIngredientSelectChange = (event: any): void => {
  const selectedValue = event.detail.value
  
  if (selectedValue === 'add-new') {
    openAddIngredientModal()
    selectedIngredientId.value = null
  }
}

/**
 * 新規食材追加モーダルを開く
 */
const openAddIngredientModal = async (): Promise<void> => {
  showAddIngredientModal.value = true
  await loadAvailableCategories()
}

/**
 * レシピ追加モーダルを閉じる
 */
const closeAddRecipeModal = (): void => {
  showAddRecipeModal.value = false
  
  // フォームをリセット
  name.value = ''
  description.value = ''
  cooking_time.value = null
  servings.value = null
  difficulty.value = ''
  
  // 食材選択をリセット
  selectedIngredients.value = []
  selectedIngredientId.value = null
  ingredientQuantity.value = null
  ingredientUnit.value = ''
  ingredientNotes.value = ''

  // 手順をリセット
  resetInstructionSteps()
}

/**
 * 新規食材追加モーダルを閉じる
 */
const closeAddIngredientModal = (): void => {
  showAddIngredientModal.value = false
  
  // フォームをリセット
  newIngredientName.value = ''
  newIngredientCategory.value = null
  newIngredientUrl.value = ''
  newIngredientMemo.value = ''
  newIngredientPrice.value = null
  newIngredientExpiryDate.value = ''
  newIngredientQuantity.value = null
  newIngredientWeight.value = null
}

// =================== データベース管理機能 ===================

/**
 * データベース接続を作成
 */
const createConnection = async (): Promise<void> => {
  try {
    isLoading.value = true
    result.value = 'データベース接続を作成中...'

    const response = await dbManager.createConnection()

    if (response.success) {
      isConnected.value = true
      connectionStatus.value = '接続済み'
      result.value = response.message
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `接続エラー: ${error}`
    console.error('接続エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * instructions文字列をステップ配列に変換
 */
const parseInstructionStepsFromString = (instructions: string | null | undefined): RecipeInstructionStep[] => {
  if (!instructions) {
    return []
  }

  try {
    const parsed = JSON.parse(instructions)
    if (Array.isArray(parsed)) {
      return parsed
        .map((step: any, index: number) => {
          const description = typeof step?.description === 'string' ? step.description.trim() : ''
          if (!description) {
            return null
          }

          const order =
            typeof step?.order === 'number' && !Number.isNaN(step.order) ? step.order : index + 1

          const title =
            typeof step?.title === 'string' && step.title.trim().length > 0 ? step.title.trim() : undefined

          const durationCandidate =
            typeof step?.durationMinutes === 'number'
              ? step.durationMinutes
              : typeof step?.duration === 'number'
                ? step.duration
                : undefined

          const durationMinutes =
            durationCandidate !== undefined && !Number.isNaN(durationCandidate)
              ? Math.max(0, Math.round(durationCandidate))
              : undefined

          const noteCandidate =
            typeof step?.note === 'string'
              ? step.note.trim()
              : typeof step?.memo === 'string'
                ? step.memo.trim()
                : ''

          return {
            order,
            title,
            description,
            durationMinutes,
            note: noteCandidate.length > 0 ? noteCandidate : undefined
          } as RecipeInstructionStep
        })
        .filter((step): step is RecipeInstructionStep => step !== null)
        .sort((a, b) => a.order - b.order)
    }
  } catch (error) {
    console.warn('手順データの解析に失敗しました:', error)
  }

  return instructions
    .split(/\r?\n/)
    .map(text => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      order: index + 1,
      description: text
    }))
}

/**
 * 画面表示用にレシピへ手順データを付与
 */
const enrichRecipeInstructionSteps = (recipe: Recipe): Recipe => {
  return {
    ...recipe,
    instruction_steps: parseInstructionStepsFromString(recipe.instructions)
  }
}

/**
 * レシピ一覧データをセット
 */
const setRecipeList = (items: Recipe[] = []): void => {
  recipes.value = items.map(enrichRecipeInstructionSteps)
  dataCount.value = recipes.value.length
}

/**
 * 保存用にフォームの手順データを整形
 */
const sanitizeInstructionStepsForSave = (): RecipeInstructionStep[] => {
  return instructionSteps.value
    .map((step, index) => {
      const description = step.description.trim()
      if (!description) {
        return null
      }

      const title = step.title.trim()
      const note = step.note.trim()
      const durationCandidate = step.durationMinutes

      return {
        order: index + 1,
        title: title.length > 0 ? title : undefined,
        description,
        durationMinutes:
          typeof durationCandidate === 'number' && !Number.isNaN(durationCandidate)
            ? Math.max(0, Math.round(durationCandidate))
            : undefined,
        note: note.length > 0 ? note : undefined
      } as RecipeInstructionStep
    })
    .filter((step): step is RecipeInstructionStep => step !== null)
}

/**
 * 保存用のJSON文字列を生成
 */
const buildInstructionPayload = (): string => {
  const sanitized = sanitizeInstructionStepsForSave()
  return sanitized.length > 0 ? JSON.stringify(sanitized) : ''
}

/**
 * 全てのレシピを取得（プラットフォームに応じて自動選択）
 */
const getAllRecipes = async () => {
  try {
    isLoading.value = true
    result.value = 'レシピを取得中...'

    // プラットフォーム情報を取得
    const platformInfo = dbManager.getPlatformInfo()
    
    let response
    if (platformInfo.isWebPlatform) {
      // Webプラットフォームの場合はWebストレージから取得
      result.value = 'Webストレージからレシピを取得中...'
      response = await dbManager.getRecipesFromWebStorage()
    } else {
      // ネイティブプラットフォームの場合はSQLiteから取得
      result.value = 'SQLiteからレシピを取得中...'
      response = await dbManager.getAllRecipes()
    }

    if (response.success) {
      const fetchedRecipes = (response.data || []) as Recipe[]
      setRecipeList(fetchedRecipes)
      result.value = `${platformInfo.platform}からレシピ数: ${dataCount.value}件を取得しました`
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `レシピ取得エラー: ${error}`
    console.error('レシピ取得エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * レシピを挿入
 */
const insertRecipeData = async () => {
  const sanitizedSteps = sanitizeInstructionStepsForSave()

  if (sanitizedSteps.length === 0) {
    result.value = '調理手順を1つ以上入力してください'
    return
  }

  const instructionPayload = JSON.stringify(sanitizedSteps)

  const recipeData: Recipe = {
    name: name.value,
    description: description.value.trim() || undefined,
    instructions: instructionPayload,
    cooking_time: cooking_time.value || undefined,
    servings: servings.value || undefined,
    difficulty: difficulty.value || undefined,
  }

  try {
    isLoading.value = true
    result.value = 'レシピを挿入中...'

    const response = await dbManager.insertRecipe(recipeData)
    
    if (response.success) {
      result.value = 'レシピを挿入しました。食材の関連付けを追加中...'
      
      // レシピが作成された場合、選択された食材を関連付け
      if (selectedIngredients.value.length > 0 && response.data?.changes?.lastId) {
        const recipeId = response.data.changes.lastId
        
        for (const ingredient of selectedIngredients.value) {
          try {
            await dbManager.addIngredientToRecipe(
              recipeId,
              ingredient.ingredient_id,
              ingredient.quantity,
              ingredient.unit,
              ingredient.notes
            )
          } catch (error) {
            console.error('食材関連付けエラー:', error)
            result.value = `レシピは作成されましたが、食材の関連付けでエラーが発生しました: ${error}`
          }
        }
        
        result.value = 'レシピと食材の関連付けが完了しました'
      } else {
        result.value = response.message
      }
      
      // 成功時はモーダルを閉じる
      closeAddRecipeModal()
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `レシピ挿入エラー: ${error}`
    console.error('レシピ挿入エラー:', error)
  } finally {
    // データを再取得
    await getAllRecipes()
    isLoading.value = false
  }
}

/**
 * 全データをクリア（プラットフォームに応じて自動選択）
 */
const clearAllData = async () => {
  // 確認ダイアログを表示
  const confirmed = showConfirmDialog('全てのレシピデータを削除してもよろしいですか？\n\nこの操作は取り消せません。')
  
  if (!confirmed) {
    return
  }

  try {
    isLoading.value = true
    result.value = '全データをクリア中...'

    // プラットフォーム情報を取得
    const platformInfo = dbManager.getPlatformInfo()
    
    if (platformInfo.isWebPlatform) {
      // Webプラットフォームの場合はWebストレージをクリア
      result.value = 'Webストレージをクリア中...'
      const webResponse = await dbManager.clearWebStorage()
      
      if (webResponse.success) {
        result.value = 'Webストレージをクリアしました'
      } else {
        result.value = webResponse.message
      }
    } else {
      // ネイティブプラットフォームの場合はデータベースをリセット
      result.value = 'データベースをリセット中...'
      const dbResponse = await dbManager.resetDatabase()
      
      if (dbResponse.success) {
        // データベースを再初期化
        await createConnection()
        result.value = 'データベースをリセットしました'
      } else {
        result.value = dbResponse.message
      }
    }

    // データをクリア
    recipes.value = []
    dataCount.value = 0
    
  } catch (error) {
    result.value = `データクリアエラー: ${error}`
    console.error('データクリアエラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * レシピを削除
 */
const deleteRecipe = async (id: number) => {
  // 削除対象のレシピを検索
  const recipe = recipes.value.find(item => item.id === id)
  const recipeName = recipe?.name || `ID ${id}`
  
  // 確認ダイアログを表示
  const confirmed = showConfirmDialog(`「${recipeName}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)
  
  if (!confirmed) {
    return
  }

  try {
    isLoading.value = true
    result.value = `ID ${id} のレシピを削除中...`

    const response = await dbManager.deleteRecipe(id)

    if (response.success) {
      // 削除後にデータを再取得
      await getAllRecipes()
      result.value = response.message
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `レシピ削除エラー: ${error}`
    console.error('レシピ削除エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 利用可能な食材を読み込む
 */
const loadAvailableIngredients = async () => {
  try {
    const response = await dbManager.getAllFoods()
    if (response.success && response.data) {
      availableIngredients.value = response.data
    } else {
      availableIngredients.value = []
    }
  } catch (error) {
    console.error('食材データ取得エラー:', error)
    availableIngredients.value = []
  }
}

/**
 * 利用可能なカテゴリを読み込む
 */
const loadAvailableCategories = async () => {
  try {
    const response = await dbManager.getAllCategories()
    if (response.success && response.data) {
      availableCategories.value = response.data
    } else {
      availableCategories.value = []
    }
  } catch (error) {
    console.error('カテゴリデータ取得エラー:', error)
    availableCategories.value = []
  }
}

/**
 * 新規食材を追加
 */
const insertNewIngredient = async () => {
  if (!newIngredientCategory.value) {
    result.value = 'カテゴリを選択してください'
    return
  }

  const ingredientData = {
    name: newIngredientName.value,
    category_id: newIngredientCategory.value,
    url: newIngredientUrl.value.trim() || undefined,
    memo: newIngredientMemo.value.trim() || undefined,
    price: newIngredientPrice.value || undefined,
    expiry_date: newIngredientExpiryDate.value || undefined,
    quantity: newIngredientQuantity.value || undefined,
    weight: newIngredientWeight.value || undefined,
  }

  try {
    isLoading.value = true
    result.value = '食材を追加中...'

    const response = await dbManager.insertFood(ingredientData)
    
    if (response.success) {
      result.value = '食材を追加しました'
      
      // 食材リストを更新
      await loadAvailableIngredients()
      
      // 新しく追加された食材を選択状態にする
      if (response.data?.changes?.lastId) {
        const newIngredientId = response.data.changes.lastId
        selectedIngredientId.value = newIngredientId
      }
      
      // モーダルを閉じる
      closeAddIngredientModal()
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `食材追加エラー: ${error}`
    console.error('食材追加エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * レシピに食材を追加
 */
const addIngredientToRecipe = () => {
  if (!selectedIngredientId.value) return

  const newIngredient: RecipeIngredient = {
    recipe_id: 0, // レシピ作成時は仮の値
    ingredient_id: selectedIngredientId.value,
    quantity: ingredientQuantity.value || undefined,
    unit: ingredientUnit.value || undefined,
    notes: ingredientNotes.value || undefined
  }

  selectedIngredients.value.push(newIngredient)

  // フォームをリセット
  selectedIngredientId.value = null
  ingredientQuantity.value = null
  ingredientUnit.value = ''
  ingredientNotes.value = ''

  result.value = '食材を追加しました'
}

/**
 * レシピから食材を削除
 */
const removeIngredientFromRecipe = (index: number) => {
  selectedIngredients.value.splice(index, 1)
  result.value = '食材を削除しました'
}

/**
 * 食材IDから食材名を取得
 */
const getIngredientName = (ingredientId: number): string => {
  const ingredient = availableIngredients.value.find(ing => ing.id === ingredientId)
  return ingredient?.name || '不明な食材'
}

// =====================================
// Lifecycle Management
// =====================================

/**
 * コンポーネントマウント時の初期化処理
 */
onMounted(async (): Promise<void> => {
  // プラットフォーム情報を初期化
  platformInfo.value = dbManager.getPlatformInfo()
  
  // データベース接続とデータ取得
  await createConnection()
  await getAllRecipes()
  
  // 接続状態を更新
  isConnected.value = dbManager.getConnectionStatus()
  connectionStatus.value = isConnected.value ? '接続済み' : '未接続'
})

/**
 * コンポーネントアンマウント時のクリーンアップ処理
 */
onUnmounted((): void => {
  // データのリセット
  recipes.value = []
  dataCount.value = 0
  availableIngredients.value = []
  selectedIngredients.value = []
  availableCategories.value = []
  
  // フォームデータのリセット
  name.value = ''
  description.value = ''
  cooking_time.value = null
  servings.value = null
  difficulty.value = ''
  selectedIngredientId.value = null
  ingredientQuantity.value = null
  ingredientUnit.value = ''
  ingredientNotes.value = ''
  resetInstructionSteps()
  newIngredientName.value = ''
  newIngredientCategory.value = null
  newIngredientUrl.value = ''
  newIngredientMemo.value = ''
  newIngredientPrice.value = null
  newIngredientExpiryDate.value = ''
  newIngredientQuantity.value = null
  newIngredientWeight.value = null
  
  // モーダル状態のリセット
  showAddRecipeModal.value = false
  showAddIngredientModal.value = false
  
  // その他の状態リセット
  result.value = ''
  connectionStatus.value = '未接続'
  isConnected.value = false
  isLoading.value = false
})
</script>


