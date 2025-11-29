<template>
  <ion-page>
    <PageHeader title="ホーム" />

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>食品管理アプリ</ion-card-title>
        </ion-card-header>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>クイックアクセス</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item 
              v-for="route in quickAccessRoutes" 
              :key="route.path" 
              button 
              @click="goToPage(route.path)"
            >
              <ion-icon :icon="getIcon(route.icon)" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h2>{{ route.label }}</h2>
                <p>{{ route.description }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Ionic Vue コンポーネント
import { 
  IonPage, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle,
  IonCardContent,
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon
} from '@ionic/vue'

// Ionicons
import { 
  restaurantOutline, 
  listOutline, 
  bookOutline,
  heartOutline
} from 'ionicons/icons'

// コンポーネント
import PageHeader from '~/components/PageHeader.vue'

// ユーティリティ関数
import { getPageMeta, getAppRoutes } from '~/utils/helpers/pageUtils'
import { navigateTo } from '#app'

/**
 * ページのメタデータを設定
 */
useHead(getPageMeta('ホーム', '食品管理アプリのホーム画面'))

/**
 * クイックアクセス用のルートを取得（主要機能のみ）
 */
const allRoutes = getAppRoutes()
const quickAccessRoutes = allRoutes.slice(0, 4)

/**
 * アイコン名からアイコンコンポーネントを取得するマッピング
 */
const iconMap = {
  restaurantOutline,
  listOutline,
  bookOutline,
  heartOutline
} as const

/**
 * アイコン名から適切なアイコンコンポーネントを取得
 * @param iconName - アイコン名
 * @returns アイコンコンポーネント、見つからない場合はrestaurantOutlineを返す
 */
const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || restaurantOutline
}

/**
 * 指定されたパスにナビゲート
 * @param path - 遷移先のパス
 */
const goToPage = (path: string): void => {
  navigateTo(path)
}
</script>
