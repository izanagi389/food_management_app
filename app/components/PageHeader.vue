<template>
  <ion-header class="page-header">
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="start">
        <!-- メニューボタンを追加 -->
        <ion-button fill="clear" @click="openMenu">
          <ion-icon :icon="menuOutline"></ion-icon>
        </ion-button>
        <!-- 必要に応じて戻るボタンも表示 -->
        <ion-button v-if="showBackButton" @click="handleGoBack" fill="clear" class="back-button">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon
} from '@ionic/vue'
import { arrowBackOutline, menuOutline } from 'ionicons/icons'
import { goBack } from '~/utils/helpers/pageUtils'
import { useGlobalMenu } from '~/composables/useGlobalMenu'

interface Props {
  title: string
  showBackButton?: boolean
}

withDefaults(defineProps<Props>(), {
  showBackButton: false
})

// グローバルメニュー管理
const { openMenu } = useGlobalMenu()

/**
 * 戻るボタンのクリック処理（iOS対応）
 */
const handleGoBack = () => {
  try {
    console.log('戻るボタンがクリックされました')
    goBack()
  } catch (error) {
    console.error('戻る処理でエラーが発生しました:', error)
    // フォールバック処理
    window.location.href = '/'
  }
}
</script>
