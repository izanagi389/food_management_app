<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>システム状態</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-item>
        <ion-label>
          <h3>接続状態</h3>
          <p>{{ connectionStatus }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h3>プラットフォーム</h3>
          <p>{{ platformInfo.platform }}</p>
        </ion-label>
      </ion-item>
      <ion-item v-if="platformInfo.canUseSQLite">
        <ion-label>
          <h3>SQLite利用可能</h3>
          <p>{{ platformInfo.canUseSQLite ? 'はい' : 'いいえ' }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h3>結果</h3>
          <p>{{ result }}</p>
        </ion-label>
      </ion-item>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonItem,
  IonLabel
} from '@ionic/vue'

interface PlatformInfo {
  isWebPlatform: boolean
  platform: string
  canUseSQLite: boolean
}

interface Props {
  connectionStatus: string
  platformInfo: PlatformInfo
  result: string
}

defineProps<Props>()
</script>
