<template>
  <ion-card v-if="data.length > 0">
    <ion-card-header>
      <ion-card-title>{{ title }} ({{ data.length }}件)</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <slot name="list">
        <!-- デフォルトのリスト表示 -->
        <ion-list>
          <ion-item v-for="item in data" :key="item.id">
            <slot name="item" :item="item">
              <ion-label>
                <h2>{{ item.name || item.title }}</h2>
                <p v-if="item.description">{{ item.description }}</p>
                <p v-if="item.created_at">登録日: {{ formatDate(item.created_at) }}</p>
              </ion-label>
              <ion-button slot="end" fill="clear" color="danger" @click="$emit('delete', item.id!)" :disabled="isLoading">
                <ion-icon :icon="trashOutline"></ion-icon>
              </ion-button>
            </slot>
          </ion-item>
        </ion-list>
      </slot>
    </ion-card-content>
  </ion-card>
  
  <!-- データが存在しない場合のメッセージ -->
  <ion-card v-else-if="!isLoading && showEmptyMessage">
    <ion-card-content>
      <ion-item>
        <ion-icon :icon="informationCircleOutline" slot="start" color="warning"></ion-icon>
        <ion-label>
          <h3>{{ emptyMessageTitle }}</h3>
          <p>{{ emptyMessageText }}</p>
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
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { trashOutline, informationCircleOutline } from 'ionicons/icons'
import { formatDate } from '~/utils/helpers/pageUtils'

interface DataItem {
  id?: number
  name?: string
  title?: string
  description?: string
  created_at?: string
  [key: string]: any // 追加のプロパティを許可
}

interface Props {
  data: DataItem[]
  title: string
  isLoading: boolean
  showEmptyMessage?: boolean
  emptyMessageTitle?: string
  emptyMessageText?: string
}

const props = withDefaults(defineProps<Props>(), {
  showEmptyMessage: true,
  emptyMessageTitle: 'データが登録されていません',
  emptyMessageText: 'データを追加してください。'
})

defineEmits<{
  delete: [id: number]
}>()
</script>
