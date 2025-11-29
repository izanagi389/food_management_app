<template>
  <ion-page>
    <PageHeader title="プロファイル管理" />

    <ion-content class="ion-padding">
      <!-- エラーメッセージ表示 -->
      <ion-card v-if="result && result.includes('エラー')" color="danger">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="alertCircleOutline" slot="start"></ion-icon>
            エラー
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>{{ result }}</p>
        </ion-card-content>
      </ion-card>

      <!-- 情報メッセージ表示 -->
      <ion-card v-else-if="result && !result.includes('エラー')" color="light">
        <ion-card-content>
          <ion-icon :icon="informationCircleOutline" slot="start" color="primary"></ion-icon>
          {{ result }}
        </ion-card-content>
      </ion-card>


      <!-- データ管理情報 -->
      <ion-card v-if="userProfile">
        <ion-card-header>
          <ion-card-title>プロファイル情報</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-icon :icon="personOutline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>名前</h3>
                <p>{{ userProfile.name || '未設定' }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="calendarOutline" slot="start" color="secondary"></ion-icon>
              <ion-label>
                <h3>年齢</h3>
                <p>{{ userProfile.age }}歳</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="maleOutline" slot="start" :color="userProfile.gender === 'male' ? 'tertiary' : 'danger'"></ion-icon>
              <ion-label>
                <h3>性別</h3>
                <p>{{ userProfile.gender === 'male' ? '男性' : '女性' }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="resizeOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>身長</h3>
                <p>{{ userProfile.height }}cm</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="scaleOutline" slot="start" color="warning"></ion-icon>
              <ion-label>
                <h3>体重</h3>
                <p>{{ userProfile.weight }}kg</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="userProfile.target_weight">
              <ion-icon :icon="flagOutline" slot="start" color="tertiary"></ion-icon>
              <ion-label>
                <h3>目標体重</h3>
                <p>{{ userProfile.target_weight }}kg</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="userProfile.activity_level">
              <ion-icon :icon="fitnessOutline" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>活動レベル</h3>
                <p>{{ activityLevelLabels[userProfile.activity_level] }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="userProfile.created_at">
              <ion-icon :icon="timeOutline" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>登録日</h3>
                <p>{{ formatDate(userProfile.created_at) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <div class="ion-padding-top">
            <ion-button expand="block" fill="outline" @click="openEditModal" :disabled="isLoading">
              <ion-icon :icon="createOutline" slot="start"></ion-icon>
              プロファイルを編集
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- プロファイル新規登録フォーム -->
      <ion-card v-if="!userProfile">
        <ion-card-header>
          <ion-card-title>プロファイルを登録</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <form @submit.prevent="saveProfile">
            <ion-item>
              <ion-label position="stacked">名前（任意）</ion-label>
              <ion-input v-model="profileForm.name" placeholder="例: 太郎"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">年齢 *</ion-label>
              <ion-input v-model="profileForm.age" type="number" placeholder="例: 30" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">性別 *</ion-label>
              <ion-select v-model="profileForm.gender" placeholder="性別を選択" required>
                <ion-select-option value="male">男性</ion-select-option>
                <ion-select-option value="female">女性</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">身長 (cm) *</ion-label>
              <ion-input v-model="profileForm.height" type="number" step="0.1" placeholder="例: 170" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">体重 (kg) *</ion-label>
              <ion-input v-model="profileForm.weight" type="number" step="0.1" placeholder="例: 70" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">目標体重 (kg)（任意）</ion-label>
              <ion-input v-model="profileForm.target_weight" type="number" step="0.1" placeholder="例: 65"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">活動レベル（任意）</ion-label>
              <ion-select v-model="profileForm.activity_level" placeholder="活動レベルを選択">
                <ion-select-option value="sedentary">{{ activityLevelLabels.sedentary }}</ion-select-option>
                <ion-select-option value="light">{{ activityLevelLabels.light }}</ion-select-option>
                <ion-select-option value="moderate">{{ activityLevelLabels.moderate }}</ion-select-option>
                <ion-select-option value="active">{{ activityLevelLabels.active }}</ion-select-option>
                <ion-select-option value="very_active">{{ activityLevelLabels.very_active }}</ion-select-option>
              </ion-select>
            </ion-item>

            <div class="ion-padding-top">
              <ion-button expand="block" type="submit" :disabled="isLoading || !isFormValid">
                <ion-icon :icon="saveOutline" slot="start"></ion-icon>
                {{ isLoading ? '保存中...' : '保存' }}
              </ion-button>
            </div>
          </form>
        </ion-card-content>
      </ion-card>

      <!-- プロファイル編集モーダル -->
      <ion-modal :is-open="showEditModal" @did-dismiss="closeEditModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>プロファイルを編集</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeEditModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <form @submit.prevent="updateProfile">
            <ion-item>
              <ion-label position="stacked">名前（任意）</ion-label>
              <ion-input v-model="editForm.name" placeholder="例: 太郎"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">年齢 *</ion-label>
              <ion-input v-model="editForm.age" type="number" placeholder="例: 30" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">性別 *</ion-label>
              <ion-select v-model="editForm.gender" placeholder="性別を選択" required>
                <ion-select-option value="male">男性</ion-select-option>
                <ion-select-option value="female">女性</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">身長 (cm) *</ion-label>
              <ion-input v-model="editForm.height" type="number" step="0.1" placeholder="例: 170" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">体重 (kg) *</ion-label>
              <ion-input v-model="editForm.weight" type="number" step="0.1" placeholder="例: 70" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">目標体重 (kg)（任意）</ion-label>
              <ion-input v-model="editForm.target_weight" type="number" step="0.1" placeholder="例: 65"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">活動レベル（任意）</ion-label>
              <ion-select v-model="editForm.activity_level" placeholder="活動レベルを選択">
                <ion-select-option value="sedentary">{{ activityLevelLabels.sedentary }}</ion-select-option>
                <ion-select-option value="light">{{ activityLevelLabels.light }}</ion-select-option>
                <ion-select-option value="moderate">{{ activityLevelLabels.moderate }}</ion-select-option>
                <ion-select-option value="active">{{ activityLevelLabels.active }}</ion-select-option>
                <ion-select-option value="very_active">{{ activityLevelLabels.very_active }}</ion-select-option>
              </ion-select>
            </ion-item>

            <div class="ion-padding-top">
              <ion-button expand="block" type="submit" :disabled="isLoading || !isEditFormValid">
                <ion-icon :icon="saveOutline" slot="start"></ion-icon>
                {{ isLoading ? '更新中...' : '更新' }}
              </ion-button>
              <ion-button expand="block" fill="outline" @click="closeEditModal">
                <ion-icon :icon="closeOutline" slot="start"></ion-icon>
                キャンセル
              </ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>


      <!-- 操作ボタン -->
      <ActionButtonsCard :is-loading="isLoading">
        <template #buttons>
          <ion-button expand="block" fill="outline" @click="fetchProfile" :disabled="isLoading">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : 'データ取得' }}
          </ion-button>

          <ion-button v-if="userProfile" expand="block" fill="outline" color="danger" @click="deleteProfile" :disabled="isLoading">
            <ion-icon :icon="trashOutline" slot="start"></ion-icon>
            {{ isLoading ? '処理中...' : 'プロファイルを削除' }}
          </ion-button>
        </template>
      </ActionButtonsCard>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Vue Composition API
import { ref, onMounted, onUnmounted, computed } from 'vue'

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
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/vue'

// Ionicons
import {
  personOutline,
  calendarOutline,
  maleOutline,
  resizeOutline,
  scaleOutline,
  flagOutline,
  fitnessOutline,
  timeOutline,
  saveOutline,
  refreshOutline,
  trashOutline,
  informationCircleOutline,
  alertCircleOutline,
  createOutline,
  closeOutline,
} from 'ionicons/icons'

// ユーティリティとマネージャー
import { SQLiteManager } from '~/utils/managers/SQLiteManager'
import { formatDate, getPageMeta, showConfirmDialog } from '~/utils/helpers/pageUtils'

// 型定義
import type { UserProfile } from '~/types'
import { ACTIVITY_LEVEL_LABELS } from '~/types'

/**
 * ページのメタデータを設定
 */
useHead(getPageMeta('プロファイル管理', 'ユーザープロファイルの管理画面'))

// =================== リアクティブな状態管理 ===================

/** ローディング状態 */
const isLoading = ref<boolean>(false)

/** ユーザープロファイル */
const userProfile = ref<UserProfile | null>(null)

/** 操作結果メッセージ */
const result = ref<string>('')

/** プロファイルフォーム */
const profileForm = ref({
  name: '',
  age: '' as string,
  gender: null as 'male' | 'female' | null,
  height: '' as string,
  weight: '' as string,
  target_weight: '' as string,
  activity_level: undefined as UserProfile['activity_level']
})

/** 編集モーダルの表示状態 */
const showEditModal = ref<boolean>(false)

/** 編集フォーム */
const editForm = ref({
  name: '',
  age: '' as string,
  gender: null as 'male' | 'female' | null,
  height: '' as string,
  weight: '' as string,
  target_weight: '' as string,
  activity_level: undefined as UserProfile['activity_level']
})

/** 活動レベルのラベル */
const activityLevelLabels = ACTIVITY_LEVEL_LABELS

// =================== データベース管理 ===================

/** SQLiteManagerのインスタンス */
const dbManager = SQLiteManager.getInstance()

// =================== フォーム管理 ===================

/**
 * フォームのバリデーション
 */
const isFormValid = computed((): boolean => {
  const age = Number(profileForm.value.age)
  const height = Number(profileForm.value.height)
  const weight = Number(profileForm.value.weight)
  
  return (
    profileForm.value.age !== '' && !isNaN(age) && age > 0 &&
    profileForm.value.gender !== null &&
    profileForm.value.height !== '' && !isNaN(height) && height > 0 &&
    profileForm.value.weight !== '' && !isNaN(weight) && weight > 0
  )
})

/**
 * 編集フォームのバリデーション
 */
const isEditFormValid = computed((): boolean => {
  const age = Number(editForm.value.age)
  const height = Number(editForm.value.height)
  const weight = Number(editForm.value.weight)
  
  return (
    editForm.value.age !== '' && !isNaN(age) && age > 0 &&
    editForm.value.gender !== null &&
    editForm.value.height !== '' && !isNaN(height) && height > 0 &&
    editForm.value.weight !== '' && !isNaN(weight) && weight > 0
  )
})


// =================== プロファイル管理機能 ===================

/**
 * データベース接続を作成
 */
const createConnection = async (): Promise<void> => {
  try {
    isLoading.value = true
    result.value = 'データベース接続を作成中...'

    const response = await dbManager.createConnection()

    if (response.success) {
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
 * プロファイルを取得
 */
const fetchProfile = async (): Promise<void> => {
  try {
    isLoading.value = true
    result.value = 'プロファイルを取得中...'

    const response = await dbManager.getProfile()

    if (response.success && response.data) {
      userProfile.value = response.data
      result.value = 'プロファイルを取得しました'
      
      // フォームにデータを設定
      profileForm.value = {
        name: userProfile.value.name || '',
        age: String(userProfile.value.age),
        gender: userProfile.value.gender,
        height: String(userProfile.value.height),
        weight: String(userProfile.value.weight),
        target_weight: userProfile.value.target_weight ? String(userProfile.value.target_weight) : '',
        activity_level: userProfile.value.activity_level
      }
    } else if (response.success && !response.data) {
      userProfile.value = null
      result.value = 'プロファイルが登録されていません'
    } else {
      userProfile.value = null
      result.value = `データ取得エラー: ${response.message || '不明なエラーが発生しました'}`
    }
  } catch (error) {
    userProfile.value = null
    result.value = `プロファイル取得エラー: ${error}`
    console.error('プロファイル取得エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * プロファイルを保存
 */
const saveProfile = async (): Promise<void> => {
  if (!isFormValid.value) {
    result.value = 'フォームが無効です'
    return
  }

  try {
    isLoading.value = true
    result.value = 'プロファイルを保存中...'

    // フォームデータを数値に変換
    const ageValue = String(profileForm.value.age).trim()
    const heightValue = String(profileForm.value.height).trim()
    const weightValue = String(profileForm.value.weight).trim()
    const targetWeightValue = String(profileForm.value.target_weight).trim()
    
    const age = Number(ageValue)
    const height = Number(heightValue)
    const weight = Number(weightValue)
    const target_weight = targetWeightValue !== '' ? Number(targetWeightValue) : undefined
    
    // 数値変換の検証
    if (ageValue === '' || isNaN(age) || age <= 0) {
      result.value = `年齢が無効です: "${ageValue}"`
      isLoading.value = false
      return
    }
    
    if (heightValue === '' || isNaN(height) || height <= 0) {
      result.value = `身長が無効です: "${heightValue}"`
      isLoading.value = false
      return
    }
    
    if (weightValue === '' || isNaN(weight) || weight <= 0) {
      result.value = `体重が無効です: "${weightValue}"`
      isLoading.value = false
      return
    }
    
    if (target_weight !== undefined && isNaN(target_weight)) {
      result.value = `目標体重が無効です: "${targetWeightValue}"`
      isLoading.value = false
      return
    }

    const profile: UserProfile = {
      id: userProfile.value?.id,
      name: profileForm.value.name || undefined,
      age,
      gender: profileForm.value.gender!,
      height,
      weight,
      target_weight,
      activity_level: profileForm.value.activity_level,
      created_at: userProfile.value?.created_at,
    }
    
    const response = await dbManager.saveProfile(profile)

    if (response.success && response.data) {
      userProfile.value = response.data
      result.value = 'プロファイルを保存しました'
      
      // フォームデータも更新
      profileForm.value = {
        name: response.data.name || '',
        age: String(response.data.age),
        gender: response.data.gender,
        height: String(response.data.height),
        weight: String(response.data.weight),
        target_weight: response.data.target_weight ? String(response.data.target_weight) : '',
        activity_level: response.data.activity_level
      }
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `プロファイル保存エラー: ${error}`
    console.error('プロファイル保存エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * プロファイルを更新
 */
const updateProfile = async (): Promise<void> => {
  if (!isEditFormValid.value) {
    result.value = 'フォームが無効です'
    return
  }

  try {
    isLoading.value = true
    result.value = 'プロファイルを更新中...'

    // フォームデータを数値に変換
    const ageValue = String(editForm.value.age).trim()
    const heightValue = String(editForm.value.height).trim()
    const weightValue = String(editForm.value.weight).trim()
    const targetWeightValue = String(editForm.value.target_weight).trim()
    
    const age = Number(ageValue)
    const height = Number(heightValue)
    const weight = Number(weightValue)
    const target_weight = targetWeightValue !== '' ? Number(targetWeightValue) : undefined
    
    // 数値変換の検証
    if (ageValue === '' || isNaN(age) || age <= 0) {
      result.value = `年齢が無効です: "${ageValue}"`
      isLoading.value = false
      return
    }
    
    if (heightValue === '' || isNaN(height) || height <= 0) {
      result.value = `身長が無効です: "${heightValue}"`
      isLoading.value = false
      return
    }
    
    if (weightValue === '' || isNaN(weight) || weight <= 0) {
      result.value = `体重が無効です: "${weightValue}"`
      isLoading.value = false
      return
    }
    
    if (target_weight !== undefined && isNaN(target_weight)) {
      result.value = `目標体重が無効です: "${targetWeightValue}"`
      isLoading.value = false
      return
    }

    const profile: UserProfile = {
      id: userProfile.value?.id,
      name: editForm.value.name || undefined,
      age,
      gender: editForm.value.gender!,
      height,
      weight,
      target_weight,
      activity_level: editForm.value.activity_level,
      created_at: userProfile.value?.created_at,
    }
    
    const response = await dbManager.saveProfile(profile)

    if (response.success && response.data) {
      userProfile.value = response.data
      result.value = 'プロファイルを更新しました'
      closeEditModal()
      
      // フォームデータも更新
      profileForm.value = {
        name: response.data.name || '',
        age: String(response.data.age),
        gender: response.data.gender,
        height: String(response.data.height),
        weight: String(response.data.weight),
        target_weight: response.data.target_weight ? String(response.data.target_weight) : '',
        activity_level: response.data.activity_level
      }
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `プロファイル更新エラー: ${error}`
    console.error('プロファイル更新エラー:', error)
  } finally {
    isLoading.value = false
  }
}

// =================== モーダル管理機能 ===================

/**
 * 編集モーダルを開く
 */
const openEditModal = (): void => {
  if (!userProfile.value) return
  
  // 編集フォームに現在のデータを設定
  editForm.value = {
    name: userProfile.value.name || '',
    age: String(userProfile.value.age),
    gender: userProfile.value.gender,
    height: String(userProfile.value.height),
    weight: String(userProfile.value.weight),
    target_weight: userProfile.value.target_weight ? String(userProfile.value.target_weight) : '',
    activity_level: userProfile.value.activity_level
  }
  
  showEditModal.value = true
}

/**
 * 編集モーダルを閉じる
 */
const closeEditModal = (): void => {
  showEditModal.value = false
  editForm.value = {
    name: '',
    age: '',
    gender: null,
    height: '',
    weight: '',
    target_weight: '',
    activity_level: undefined
  }
}

// =================== データ削除機能 ===================

/**
 * プロファイルを削除
 */
const deleteProfile = async (): Promise<void> => {
  const confirmed = showConfirmDialog('プロファイルを削除してもよろしいですか？\n\nこの操作は取り消せません。')

  if (!confirmed) {
    return
  }

  try {
    isLoading.value = true
    result.value = 'プロファイルを削除中...'

    const response = await dbManager.deleteProfile()

    if (response.success) {
      userProfile.value = null
      result.value = 'プロファイルを削除しました'
      
      // フォームをクリア
      profileForm.value = {
        name: '',
        age: '',
        gender: null,
        height: '',
        weight: '',
        target_weight: '',
        activity_level: undefined
      }
    } else {
      result.value = response.message
    }
  } catch (error) {
    result.value = `プロファイル削除エラー: ${error}`
    console.error('プロファイル削除エラー:', error)
  } finally {
    isLoading.value = false
  }
}

// =================== ライフサイクル管理 ===================

/**
 * コンポーネントマウント時の処理
 */
onMounted(async (): Promise<void> => {
  console.log('プロファイル管理ページが読み込まれました')
  
  await createConnection()
  await fetchProfile()
})

/**
 * コンポーネントアンマウント時の処理
 */
onUnmounted((): void => {
  // 状態のリセット
  userProfile.value = null
  profileForm.value = {
    name: '',
    age: '',
    gender: null,
    height: '',
    weight: '',
    target_weight: '',
    activity_level: undefined
  }
  editForm.value = {
    name: '',
    age: '',
    gender: null,
    height: '',
    weight: '',
    target_weight: '',
    activity_level: undefined
  }
  showEditModal.value = false
  result.value = ''
  isLoading.value = false
})
</script>
