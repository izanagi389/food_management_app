<template>
  <ion-page class="health-page">
    <PageHeader title="健康管理" />

    <ion-content class="ion-padding">
      <!-- プロファイル情報カード（リンク） -->
      <ion-card v-if="!userProfile" button @click="goToProfilePage">
        <ion-card-content>
          <ion-item>
            <ion-icon :icon="informationCircleOutline" slot="start" color="warning"></ion-icon>
            <ion-label>
              <h3>プロファイルが未登録です</h3>
              <p>プロファイル管理ページでプロファイルを登録してください。</p>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <ion-card v-else button @click="goToProfilePage">
        <ion-card-header>
          <ion-card-title>プロファイル情報</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-icon :icon="personOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ userProfile.name || '名前未設定' }}</h3>
              <p>{{ userProfile.age }}歳 / {{ userProfile.gender === 'male' ? '男性' : '女性' }} / {{ userProfile.height }}cm / {{ userProfile.weight }}kg</p>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- 統計情報カード -->
      <ion-card v-if="statistics && statistics.recordCount > 0">
        <ion-card-header>
          <ion-card-title>健康統計</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row v-if="statistics.latestWeight">
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="scaleOutline" slot="start" color="primary"></ion-icon>
                  <ion-label>
                    <h3>現在の体重</h3>
                    <p class="stat-value">{{ statistics.latestWeight }}kg</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="trendingUpOutline" slot="start" :color="getWeightChangeColor()"></ion-icon>
                  <ion-label>
                    <h3>体重変化</h3>
                    <p class="stat-value" :style="{ color: getWeightChangeColor() === 'success' ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }">
                      {{ (statistics.weightChange ?? 0) > 0 ? '+' : '' }}{{ statistics.weightChange ?? 0 }}kg
                    </p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
            <ion-row v-if="statistics.latestBodyFat || getBMI()">
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="bodyOutline" slot="start" color="secondary"></ion-icon>
                  <ion-label>
                    <h3>体脂肪率</h3>
                    <p class="stat-value">{{ statistics.latestBodyFat }}%</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="calculatorOutline" slot="start" :color="getBMIColor()"></ion-icon>
                  <ion-label>
                    <h3>BMI</h3>
                    <p class="stat-value" :style="{ color: getBMIColor() === 'success' ? 'var(--ion-color-success)' : getBMIColor() === 'warning' ? 'var(--ion-color-warning)' : 'var(--ion-color-danger)' }">
                      {{ getBMI() ? getBMI()!.toFixed(1) : '-' }}
                    </p>
                    <p class="bmi-category" v-if="getBMI()">{{ getBMICategory() }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
            <ion-row v-if="statistics.averageSystolicPressure && statistics.averageDiastolicPressure">
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="pulseOutline" slot="start" color="tertiary"></ion-icon>
                  <ion-label>
                    <h3>平均血圧</h3>
                    <p class="stat-value">{{ statistics.averageSystolicPressure }}/{{ statistics.averageDiastolicPressure }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="trendingUpOutline" slot="start" color="medium"></ion-icon>
                  <ion-label>
                    <h3>理想体重</h3>
                    <p class="stat-value">{{ getIdealWeight() ? getIdealWeight()!.toFixed(1) + 'kg' : '-' }}</p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="fitnessOutline" slot="start" color="warning"></ion-icon>
                  <ion-label>
                    <h3>平均運動時間</h3>
                    <p class="stat-value" v-if="statistics.averageExerciseDuration">{{ statistics.averageExerciseDuration }}分</p>
                    <p class="stat-value" v-else>-</p>
                  </ion-label>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item lines="none">
                  <ion-icon :icon="bedOutline" slot="start" color="medium"></ion-icon>
                  <ion-label>
                    <h3>平均睡眠時間</h3>
                    <p class="stat-value" v-if="statistics.averageSleepDuration">{{ statistics.averageSleepDuration }}時間</p>
                    <p class="stat-value" v-else>-</p>
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- 健康指標カード -->
      <ion-card v-if="userProfile">
        <ion-card-header>
          <ion-card-title>健康指標</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-icon :icon="calculatorOutline" slot="start" :color="getBMIColor()"></ion-icon>
              <ion-label>
                <h3>BMI</h3>
                <p class="health-value" :style="{ color: getBMIColor() === 'success' ? 'var(--ion-color-success)' : getBMIColor() === 'warning' ? 'var(--ion-color-warning)' : 'var(--ion-color-danger)' }">
                  {{ getBMI() ? getBMI()!.toFixed(1) : '計算不可' }}
                </p>
                <p class="bmi-category" v-if="getBMI()">{{ getBMICategory() }}</p>
              </ion-label>
              <ion-button slot="end" fill="clear" size="small" @click="openBMIModal" :disabled="!getBMI()">
                <ion-icon :icon="informationCircleOutline" color="medium"></ion-icon>
              </ion-button>
            </ion-item>
            <ion-item>
              <ion-icon :icon="trendingUpOutline" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>理想体重</h3>
                <p class="health-value">{{ getIdealWeight() ? getIdealWeight()!.toFixed(1) + 'kg' : '計算不可' }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="userProfile.target_weight">
              <ion-icon :icon="flagOutline" slot="start" color="tertiary"></ion-icon>
              <ion-label>
                <h3>目標体重との差</h3>
                <p class="health-value" :style="{ color: getWeightDifference() > 0 ? 'var(--ion-color-danger)' : 'var(--ion-color-success)' }">
                  {{ getWeightDifference() > 0 ? '+' : '' }}{{ getWeightDifference().toFixed(1) }}kg
                </p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="heartOutline" slot="start" color="danger"></ion-icon>
              <ion-label>
                <h3>基礎代謝量（推定）</h3>
                <p class="health-value">{{ getBasalMetabolicRate() ? getBasalMetabolicRate()!.toFixed(0) + 'kcal' : '計算不可' }}</p>
              </ion-label>
              <ion-button slot="end" fill="clear" size="small" @click="openBMRModal" :disabled="!getBasalMetabolicRate()">
                <ion-icon :icon="informationCircleOutline" color="medium"></ion-icon>
              </ion-button>
            </ion-item>
            <ion-item v-if="userProfile.activity_level">
              <ion-icon :icon="flashOutline" slot="start" color="warning"></ion-icon>
              <ion-label>
                <h3>1日の消費カロリー（推定）</h3>
                <p class="health-value">{{ getDailyCalorieBurn() ? getDailyCalorieBurn()!.toFixed(0) + 'kcal' : '計算不可' }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- 健康記録一覧 -->
      <ion-card v-if="healthRecords.length > 0">
        <ion-card-header>
          <ion-card-title>健康記録一覧 ({{ healthRecords.length }}件)</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item v-for="record in healthRecords" :key="record.id">
              <ion-label>
                <h2>📅 {{ formatDate(record.record_date) }}</h2>
                <div class="record-details">
                  <p v-if="record.weight">⚖️ 体重: {{ record.weight }}kg</p>
                  <p v-if="record.body_fat_percentage">📊 体脂肪率: {{ record.body_fat_percentage }}%</p>
                  <p v-if="record.systolic_pressure && record.diastolic_pressure">
                    💓 血圧: {{ record.systolic_pressure }}/{{ record.diastolic_pressure }} mmHg
                  </p>
                  <p v-if="record.exercise_duration">🏃 運動: {{ record.exercise_duration }}分</p>
                  <p v-if="record.sleep_duration">😴 睡眠: {{ record.sleep_duration }}時間</p>
                  <p v-if="record.water_intake">💧 水分: {{ record.water_intake }}ml</p>
                  <p v-if="record.calorie_intake">🍽️ カロリー: {{ record.calorie_intake }}kcal</p>
                  <p v-if="record.memo" class="memo-text">📝 {{ record.memo }}</p>
                </div>
              </ion-label>
              <ion-button slot="end" fill="clear" @click="openEditModal(record)" :disabled="isLoading">
                <ion-icon :icon="createOutline"></ion-icon>
              </ion-button>
              <ion-button slot="end" fill="clear" color="danger" @click="deleteRecord(record.id!)" :disabled="isLoading">
                <ion-icon :icon="trashOutline"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>


      <!-- BMI詳細情報モーダル -->
      <InfoModal
        :is-open="showBMIModal"
        title="BMI詳細情報"
        card-title="あなたのBMI情報"
        @close="closeBMIModal"
      >
        <template #content>
          <div class="bmi-info">
            <div class="bmi-value-display">
              <h2 class="bmi-number">{{ getBMI()?.toFixed(1) }}</h2>
              <p class="bmi-category-large">{{ getBMICategory() }}</p>
              <p class="bmi-description">{{ getBMIDescription() }}</p>
            </div>
            
            <div class="bmi-categories">
              <h3>BMIカテゴリ</h3>
              <ion-list>
                <ion-item>
                  <ion-label>
                    <h4>低体重</h4>
                    <p>BMI 18.5未満</p>
                  </ion-label>
                  <ion-icon :icon="getBMICategoryIcon('underweight')" :color="getBMICategoryColor('underweight')" slot="end"></ion-icon>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h4>普通体重</h4>
                    <p>BMI 18.5-24.9</p>
                  </ion-label>
                  <ion-icon :icon="getBMICategoryIcon('normal')" :color="getBMICategoryColor('normal')" slot="end"></ion-icon>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h4>肥満度1</h4>
                    <p>BMI 25.0-29.9</p>
                  </ion-label>
                  <ion-icon :icon="getBMICategoryIcon('overweight')" :color="getBMICategoryColor('overweight')" slot="end"></ion-icon>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h4>肥満度2</h4>
                    <p>BMI 30.0-34.9</p>
                  </ion-label>
                  <ion-icon :icon="getBMICategoryIcon('obese1')" :color="getBMICategoryColor('obese1')" slot="end"></ion-icon>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h4>肥満度3</h4>
                    <p>BMI 35.0以上</p>
                  </ion-label>
                  <ion-icon :icon="getBMICategoryIcon('obese2')" :color="getBMICategoryColor('obese2')" slot="end"></ion-icon>
                </ion-item>
              </ion-list>
            </div>

            <div class="bmi-tips">
              <h3>BMI改善のヒント</h3>
              <ion-list>
                <ion-item v-for="tip in getBMITips()" :key="tip">
                  <ion-icon :icon="bulbOutline" slot="start" color="warning"></ion-icon>
                  <ion-label>
                    <p>{{ tip }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </div>

            <div class="bmi-note">
              <ion-item>
                <ion-icon :icon="informationCircleOutline" slot="start" color="medium"></ion-icon>
                <ion-label>
                  <h4>BMIについて</h4>
                  <p>BMI（Body Mass Index）は身長と体重から計算される肥満度の指標です。ただし、筋肉量や骨密度は考慮されないため、あくまで目安として使用してください。</p>
                </ion-label>
              </ion-item>
            </div>
          </div>
        </template>
      </InfoModal>

      <!-- 基礎代謝量詳細情報モーダル -->
      <InfoModal
        :is-open="showBMRModal"
        title="基礎代謝量詳細情報"
        card-title="あなたの基礎代謝量情報"
        @close="closeBMRModal"
      >
        <template #content>
          <div class="bmr-info">
            <div class="bmr-value-display">
              <h2 class="bmr-number">{{ getBasalMetabolicRate()?.toFixed(0) }} kcal</h2>
              <p class="bmr-description">{{ getBMRDescription() }}</p>
            </div>
            
            <div class="bmr-calculation">
              <h3>計算方法</h3>
              <ion-item>
                <ion-icon :icon="calculatorOutline" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h4>ハリス・ベネディクト式</h4>
                  <p>{{ userProfile?.gender === 'male' ? '男性' : '女性' }}用の計算式を使用しています</p>
                </ion-label>
              </ion-item>
            </div>

            <div class="bmr-factors">
              <h3>基礎代謝量に影響する要因</h3>
              <ion-list>
                <ion-item>
                  <ion-icon :icon="personOutline" slot="start" color="primary"></ion-icon>
                  <ion-label>
                    <h4>年齢</h4>
                    <p>{{ userProfile?.age }}歳 - 年齢が上がるほど基礎代謝量は低下します</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="resizeOutline" slot="start" color="success"></ion-icon>
                  <ion-label>
                    <h4>身長</h4>
                    <p>{{ userProfile?.height }}cm - 身長が高いほど基礎代謝量は高くなります</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="scaleOutline" slot="start" color="warning"></ion-icon>
                  <ion-label>
                    <h4>体重</h4>
                    <p>{{ userProfile?.weight }}kg - 体重が重いほど基礎代謝量は高くなります</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="maleOutline" slot="start" :color="userProfile?.gender === 'male' ? 'tertiary' : 'danger'"></ion-icon>
                  <ion-label>
                    <h4>性別</h4>
                    <p>{{ userProfile?.gender === 'male' ? '男性' : '女性' }} - 男性の方が一般的に基礎代謝量が高いです</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </div>

            <div class="bmr-tips">
              <h3>基礎代謝量を上げる方法</h3>
              <ion-list>
                <ion-item v-for="tip in getBMRTips()" :key="tip">
                  <ion-icon :icon="bulbOutline" slot="start" color="warning"></ion-icon>
                  <ion-label>
                    <p>{{ tip }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </div>

            <div class="bmr-note">
              <ion-item>
                <ion-icon :icon="informationCircleOutline" slot="start" color="medium"></ion-icon>
                <ion-label>
                  <h4>基礎代謝量について</h4>
                  <p>基礎代謝量は、生命維持に必要な最小限のエネルギー消費量です。安静時に消費されるカロリーの目安として使用されます。実際の消費カロリーは活動レベルによって変わります。</p>
                </ion-label>
              </ion-item>
            </div>
          </div>
        </template>
      </InfoModal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// =====================================
// Vue Composition API Imports
// =====================================
import { ref, onMounted, onUnmounted } from 'vue'
import { navigateTo } from '#app'

// =====================================
// Ionic Vue Components
// =====================================
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
  IonDatetime,
  IonGrid,
  IonRow,
  IonCol,
  IonToolbar,
  IonTitle,
  IonHeader,
} from '@ionic/vue'

// =====================================
// Ionicons
// =====================================
import {
  createOutline,
  trashOutline,
  scaleOutline,
  bodyOutline,
  pulseOutline,
  fitnessOutline,
  bedOutline,
  trendingUpOutline,
  informationCircleOutline,
  personOutline,
  chevronForwardOutline,
  calculatorOutline,
  flagOutline,
  heartOutline,
  flashOutline,
  bulbOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  maleOutline,
  resizeOutline,
} from 'ionicons/icons'

// =====================================
// Utilities and Managers
// =====================================
import { SQLiteManager } from '~/utils/managers/SQLiteManager'
import { formatDate, getPageMeta, showConfirmDialog } from '~/utils/helpers/pageUtils'

// =====================================
// Common Components
// =====================================
import InfoModal from '~/components/common/InfoModal.vue'
import PageHeader from '~/components/PageHeader.vue'

// =====================================
// Type Definitions
// =====================================
import type { HealthRecord, HealthStatistics, UserProfile } from '~/types'

// =====================================
// Page Configuration
// =====================================

/**
 * ページのメタデータ設定
 */
useHead(getPageMeta('健康管理', '健康データの管理画面'))

// =====================================
// Reactive State Management
// =====================================

/** ローディング状態 */
const isLoading = ref<boolean>(false)

/** 健康記録一覧 */
const healthRecords = ref<HealthRecord[]>([])

/** 統計情報 */
const statistics = ref<HealthStatistics | null>(null)

/** ユーザープロファイル情報（表示のみ） */
const userProfile = ref<UserProfile | null>(null)

// =====================================
// Modal State Management
// =====================================


/** 編集モーダルの表示状態 */
const showEditModal = ref<boolean>(false)

/** BMI詳細モーダルの表示状態 */
const showBMIModal = ref<boolean>(false)

/** 基礎代謝量詳細モーダルの表示状態 */
const showBMRModal = ref<boolean>(false)

// =====================================
// Form State Management
// =====================================


/** 編集対象の健康記録 */
const editingRecord = ref<HealthRecord | null>(null)

/** 健康記録編集フォーム */
const editForm = ref({
  record_date: '',
  weight: null as number | null,
  body_fat_percentage: null as number | null,
  systolic_pressure: null as number | null,
  diastolic_pressure: null as number | null,
  exercise_duration: null as number | null,
  sleep_duration: null as number | null,
  water_intake: null as number | null,
  calorie_intake: null as number | null,
  memo: '',
})

// =====================================
// Database Management
// =====================================

/** SQLiteManagerのインスタンス */
const dbManager = SQLiteManager.getInstance()

// =====================================
// Profile Management Functions
// =====================================

/**
 * プロファイル情報を取得
 */
const fetchProfile = async (): Promise<void> => {
  try {
    const response = await dbManager.getProfile()
    
    if (response.success && response.data) {
      userProfile.value = response.data
    } else {
      userProfile.value = null
    }
  } catch (error) {
    console.error('プロファイル取得エラー:', error)
    userProfile.value = null
  }
}

/**
 * プロファイルページに移動
 */
const goToProfilePage = (): void => {
  navigateTo('/management/health/user')
}

// =====================================
// Statistics and Display Functions
// =====================================

/**
 * 体重変化の色を取得
 */
const getWeightChangeColor = (): string => {
  if (!statistics.value?.weightChange) return 'medium'
  return statistics.value.weightChange <= 0 ? 'success' : 'danger'
}

/**
 * BMIを計算
 */
const getBMI = (): number | null => {
  try {
    if (!userProfile.value?.height || !userProfile.value?.weight) {
      return null
    }
    
    const heightInMeters = userProfile.value.height / 100
    return userProfile.value.weight / (heightInMeters * heightInMeters)
  } catch (error) {
    console.error('BMI計算エラー:', error)
    return null
  }
}

/**
 * BMIカテゴリを取得
 */
const getBMICategory = (): string => {
  const bmi = getBMI()
  if (!bmi) return ''
  
  if (bmi < 18.5) return '低体重'
  if (bmi < 25) return '普通体重'
  if (bmi < 30) return '肥満度1'
  if (bmi < 35) return '肥満度2'
  return '肥満度3'
}

/**
 * BMIの色を取得
 */
const getBMIColor = (): string => {
  const bmi = getBMI()
  if (!bmi) return 'medium'
  
  if (bmi < 18.5) return 'warning'
  if (bmi < 25) return 'success'
  if (bmi < 30) return 'warning'
  return 'danger'
}

/**
 * 理想体重を計算（BMI 22を基準）
 */
const getIdealWeight = (): number | null => {
  if (!userProfile.value?.height) {
    return null
  }
  
  const heightInMeters = userProfile.value.height / 100
  return 22 * (heightInMeters * heightInMeters)
}

/**
 * 目標体重との差を計算
 */
const getWeightDifference = (): number => {
  if (!userProfile.value?.weight || !userProfile.value?.target_weight) {
    return 0
  }
  
  return userProfile.value.weight - userProfile.value.target_weight
}

/**
 * 基礎代謝量を計算（ハリス・ベネディクト式）
 */
const getBasalMetabolicRate = (): number | null => {
  try {
    if (!userProfile.value?.age || !userProfile.value?.height || !userProfile.value?.weight || !userProfile.value?.gender) {
      return null
    }
    
    const { age, height, weight, gender } = userProfile.value
    
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    }
  } catch (error) {
    console.error('基礎代謝量計算エラー:', error)
    return null
  }
}

/**
 * 1日の消費カロリーを計算（基礎代謝量 × 活動レベル係数）
 */
const getDailyCalorieBurn = (): number | null => {
  const bmr = getBasalMetabolicRate()
  if (!bmr || !userProfile.value?.activity_level) {
    return null
  }
  
  const activityMultipliers = {
    sedentary: 1.2,      // 座り仕事中心
    light: 1.375,        // 軽い運動
    moderate: 1.55,      // 中程度の運動
    active: 1.725,       // 活発な運動
    very_active: 1.9     // 非常に活発な運動
  }
  
  const multiplier = activityMultipliers[userProfile.value.activity_level] || 1.2
  return bmr * multiplier
}

/**
 * BMIの詳細説明を取得
 */
const getBMIDescription = (): string => {
  try {
    const bmi = getBMI()
    if (!bmi) return ''
    
    if (bmi < 18.5) return 'やせすぎの可能性があります。適切な栄養摂取を心がけましょう。'
    if (bmi < 25) return '健康的な体重範囲です。この状態を維持しましょう。'
    if (bmi < 30) return '軽度の肥満です。食事と運動で改善を目指しましょう。'
    if (bmi < 35) return '中程度の肥満です。医師に相談することをお勧めします。'
    return '高度の肥満です。医師の指導のもと、適切な減量を行いましょう。'
  } catch (error) {
    console.error('BMI説明取得エラー:', error)
    return ''
  }
}

/**
 * BMIカテゴリのアイコンを取得
 */
const getBMICategoryIcon = (category: string) => {
  const bmi = getBMI()
  if (!bmi) return informationCircleOutline
  
  const currentCategory = getBMICategory()
  
  if (category === 'underweight') return currentCategory === '低体重' ? checkmarkCircleOutline : alertCircleOutline
  if (category === 'normal') return currentCategory === '普通体重' ? checkmarkCircleOutline : informationCircleOutline
  if (category === 'overweight') return currentCategory === '肥満度1' ? alertCircleOutline : informationCircleOutline
  if (category === 'obese1') return currentCategory === '肥満度2' ? alertCircleOutline : informationCircleOutline
  if (category === 'obese2') return currentCategory === '肥満度3' ? alertCircleOutline : informationCircleOutline
  
  return informationCircleOutline
}

/**
 * BMIカテゴリの色を取得
 */
const getBMICategoryColor = (category: string): string => {
  const bmi = getBMI()
  if (!bmi) return 'medium'
  
  const currentCategory = getBMICategory()
  
  if (category === 'underweight') return currentCategory === '低体重' ? 'warning' : 'medium'
  if (category === 'normal') return currentCategory === '普通体重' ? 'success' : 'medium'
  if (category === 'overweight') return currentCategory === '肥満度1' ? 'warning' : 'medium'
  if (category === 'obese1') return currentCategory === '肥満度2' ? 'danger' : 'medium'
  if (category === 'obese2') return currentCategory === '肥満度3' ? 'danger' : 'medium'
  
  return 'medium'
}

/**
 * BMI改善のヒントを取得
 */
const getBMITips = (): string[] => {
  const bmi = getBMI()
  if (!bmi) return []
  
  const tips: string[] = []
  
  if (bmi < 18.5) {
    tips.push('適切な栄養摂取を心がけましょう')
    tips.push('規則正しい食事を3食摂りましょう')
    tips.push('適度な運動で筋肉量を増やしましょう')
  } else if (bmi < 25) {
    tips.push('現在の体重を維持しましょう')
    tips.push('バランスの良い食事を続けましょう')
    tips.push('定期的な運動習慣を保ちましょう')
  } else {
    tips.push('カロリー制限を意識した食事を心がけましょう')
    tips.push('有酸素運動を週3回以上行いましょう')
    tips.push('筋力トレーニングで筋肉量を維持しましょう')
    tips.push('医師や栄養士に相談することをお勧めします')
  }
  
  return tips
}

/**
 * 基礎代謝量の詳細説明を取得
 */
const getBMRDescription = (): string => {
  const bmr = getBasalMetabolicRate()
  if (!bmr) return ''
  
  const age = userProfile.value?.age || 0
  const gender = userProfile.value?.gender || 'male'
  
  if (gender === 'male') {
    if (age < 30) {
      return '若い男性の平均的な基礎代謝量です。活発な代謝を維持しましょう。'
    } else if (age < 50) {
      return '中年男性の平均的な基礎代謝量です。運動習慣を維持しましょう。'
    } else {
      return '高齢男性の平均的な基礎代謝量です。筋力維持が重要です。'
    }
  } else {
    if (age < 30) {
      return '若い女性の平均的な基礎代謝量です。健康的な生活を心がけましょう。'
    } else if (age < 50) {
      return '中年女性の平均的な基礎代謝量です。バランスの良い食事が重要です。'
    } else {
      return '高齢女性の平均的な基礎代謝量です。適度な運動を継続しましょう。'
    }
  }
}

/**
 * 基礎代謝量を上げる方法のヒントを取得
 */
const getBMRTips = (): string[] => {
  const tips: string[] = []
  
  tips.push('筋力トレーニングで筋肉量を増やしましょう')
  tips.push('有酸素運動を定期的に行いましょう')
  tips.push('十分な睡眠を取ることで代謝を改善しましょう')
  tips.push('タンパク質を適切に摂取して筋肉を維持しましょう')
  tips.push('水分を十分に摂取して代謝を促進しましょう')
  tips.push('ストレスを減らしてリラックスする時間を作りましょう')
  
  return tips
}

// =====================================
// Database Management Functions
// =====================================

/**
 * 全ての健康記録を取得
 */
const fetchAllRecords = async (): Promise<void> => {
  try {
    isLoading.value = true
    const response = await dbManager.getAllHealthRecords()

    if (response.success) {
      healthRecords.value = response.data || []
      
      // 統計データを取得
      const statsResponse = await dbManager.getHealthStatistics()
      if (statsResponse.success) {
        statistics.value = statsResponse.data || null
      }
    }
  } catch (error) {
    console.error('健康記録取得エラー:', error)
  } finally {
    isLoading.value = false
  }
}


/**
 * 健康記録を更新
 */
const updateRecord = async (): Promise<void> => {
  if (!editingRecord.value?.id) return

  try {
    isLoading.value = true

    const updateData: Partial<HealthRecord> = {
      record_date: editForm.value.record_date,
      weight: editForm.value.weight || undefined,
      body_fat_percentage: editForm.value.body_fat_percentage || undefined,
      systolic_pressure: editForm.value.systolic_pressure || undefined,
      diastolic_pressure: editForm.value.diastolic_pressure || undefined,
      exercise_duration: editForm.value.exercise_duration || undefined,
      sleep_duration: editForm.value.sleep_duration || undefined,
      water_intake: editForm.value.water_intake || undefined,
      calorie_intake: editForm.value.calorie_intake || undefined,
      memo: editForm.value.memo.trim() || undefined,
    }

    const response = await dbManager.updateHealthRecord(editingRecord.value.id, updateData)

    if (response.success) {
      closeEditModal()
      await fetchAllRecords()
    }
  } catch (error) {
    console.error('健康記録更新エラー:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 健康記録を削除
 */
const deleteRecord = async (id: number): Promise<void> => {
  const record = healthRecords.value.find(r => r.id === id)
  const recordDate = record?.record_date ? formatDate(record.record_date) : `ID ${id}`

  const confirmed = showConfirmDialog(`${recordDate}の記録を削除してもよろしいですか？\n\nこの操作は取り消せません。`)

  if (!confirmed) {
    return
  }

  try {
    isLoading.value = true
    const response = await dbManager.deleteHealthRecord(id)

    if (response.success) {
      await fetchAllRecords()
    }
  } catch (error) {
    console.error('健康記録削除エラー:', error)
  } finally {
    isLoading.value = false
  }
}

// =====================================
// Modal Management Functions
// =====================================


/**
 * 編集モーダルを開く
 */
const openEditModal = (record: HealthRecord): void => {
  editingRecord.value = record
  editForm.value = {
    record_date: record.record_date,
    weight: record.weight || null,
    body_fat_percentage: record.body_fat_percentage || null,
    systolic_pressure: record.systolic_pressure || null,
    diastolic_pressure: record.diastolic_pressure || null,
    exercise_duration: record.exercise_duration || null,
    sleep_duration: record.sleep_duration || null,
    water_intake: record.water_intake || null,
    calorie_intake: record.calorie_intake || null,
    memo: record.memo || '',
  }
  showEditModal.value = true
}

/**
 * 編集モーダルを閉じる
 */
const closeEditModal = (): void => {
  showEditModal.value = false
  editingRecord.value = null
  editForm.value = {
    record_date: '',
    weight: null,
    body_fat_percentage: null,
    systolic_pressure: null,
    diastolic_pressure: null,
    exercise_duration: null,
    sleep_duration: null,
    water_intake: null,
    calorie_intake: null,
    memo: '',
  }
}

/**
 * BMI詳細モーダルを開く
 */
const openBMIModal = (): void => {
  try {
    showBMIModal.value = true
  } catch (error) {
    console.error('BMIモーダルを開く際のエラー:', error)
  }
}

/**
 * BMI詳細モーダルを閉じる
 */
const closeBMIModal = (): void => {
  showBMIModal.value = false
}

/**
 * 基礎代謝量詳細モーダルを開く
 */
const openBMRModal = (): void => {
  try {
    showBMRModal.value = true
  } catch (error) {
    console.error('BMRモーダルを開く際のエラー:', error)
  }
}

/**
 * 基礎代謝量詳細モーダルを閉じる
 */
const closeBMRModal = (): void => {
  showBMRModal.value = false
}

// =====================================
// Lifecycle Management
// =====================================

/**
 * コンポーネントマウント時の初期化処理
 */
onMounted(async (): Promise<void> => {
  await fetchProfile()
  await fetchAllRecords()
})

/**
 * コンポーネントアンマウント時のクリーンアップ処理
 */
onUnmounted((): void => {
  // データのリセット
  healthRecords.value = []
  statistics.value = null
  userProfile.value = null
  editingRecord.value = null
  
  // モーダル状態のリセット
  showEditModal.value = false
  
  // その他の状態リセット
  isLoading.value = false
})
</script>

 

