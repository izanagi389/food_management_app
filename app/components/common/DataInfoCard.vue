<template>
  <ion-card v-if="showCard">
    <ion-card-header>
      <ion-card-title>{{ title }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-list>
        <ion-item v-for="info in infoItems" :key="info.key">
          <ion-icon :icon="info.icon" slot="start" :color="info.color"></ion-icon>
          <ion-label>
            <h3>{{ info.label }}</h3>
            <p>{{ info.value }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonIcon } from '@ionic/vue'

interface InfoItem {
  key: string
  label: string
  value: string | number
  /** アイコン（ionicons/iconsからインポートしたアイコンオブジェクト） */
  icon: any
  color?: string
}

interface Props {
  /** カードのタイトル */
  title?: string
  /** 表示する情報アイテムの配列 */
  infoItems: InfoItem[]
  /** カードを表示するかどうか */
  showCard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'データ管理情報',
  showCard: true
})
</script>
