<template>
  <ion-modal :is-open="isMenuOpen" @did-dismiss="closeMenu">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>食品管理アプリ</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeMenu">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item button @click="goToPage('/')">
          <ion-icon :icon="homeOutline" slot="start"></ion-icon>
          <ion-label>
            <h2>ホーム</h2>
            <p>アプリのホーム</p>
          </ion-label>
        </ion-item>
        
        <ion-item 
          v-for="route in appRoutes" 
          :key="route.path" 
          button 
          @click="goToPage(route.path)"
        >
          <ion-icon :icon="getIcon(route.icon)" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ route.label }}</h2>
            <p>{{ route.description }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel,
  IonIcon,
  IonButtons,
  IonButton
} from '@ionic/vue'
import { 
  homeOutline,
  restaurantOutline, 
  listOutline, 
  bookOutline,
  heartOutline,
  closeOutline
} from 'ionicons/icons'
import { getAppRoutes } from '~/utils/helpers/pageUtils'
import { useGlobalMenu } from '~/composables/useGlobalMenu'
import { navigateTo } from '#app'

// アプリケーションルート情報を取得
const appRoutes = getAppRoutes()

// グローバルメニュー管理
const { isMenuOpen, closeMenu } = useGlobalMenu()

// アイコン名からアイコンコンポーネントを取得するマッピング
const iconMap = {
  homeOutline,
  restaurantOutline,
  listOutline,
  bookOutline,
  heartOutline
} as const

/**
 * アイコン名から適切なアイコンコンポーネントを取得
 */
const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || homeOutline
}

/**
 * 指定されたパスにナビゲート
 */
const goToPage = async (path: string): Promise<void> => {
  // メニューを閉じる
  closeMenu()
  // ページに遷移
  navigateTo(path)
}
</script>
