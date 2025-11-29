<template>
  <ion-card v-if="data.length > 0">
    <ion-card-header>
      <ion-card-title>{{ title }} ({{ data.length }}件)</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-list>
        <slot name="item" v-for="item in data" :key="getItemId(item)" :item="item">
          <ion-item>
            <ion-label>
              <h2>{{ getItemName(item) }}</h2>
              <p v-if="getItemDescription(item)">{{ getItemDescription(item) }}</p>
              <p v-if="getItemDate(item)" class="item-date">{{ getItemDate(item) }}</p>
            </ion-label>
            <ion-button 
              v-if="showEditButton" 
              slot="end" 
              fill="clear" 
              @click="$emit('edit', item)" 
              :disabled="isLoading"
            >
              <ion-icon :icon="createOutline"></ion-icon>
            </ion-button>
            <ion-button 
              v-if="showDeleteButton" 
              slot="end" 
              fill="clear" 
              color="danger" 
              @click="$emit('delete', getItemId(item))" 
              :disabled="isLoading"
            >
              <ion-icon :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </slot>
      </ion-list>
    </ion-card-content>
  </ion-card>

  <!-- データが存在しない場合のメッセージ -->
  <ion-card v-else-if="!isLoading">
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
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/vue'
import { createOutline, trashOutline, informationCircleOutline } from 'ionicons/icons'

interface Props {
  /** 表示するデータ配列 */
  data: any[]
  /** カードのタイトル */
  title: string
  /** ローディング状態 */
  isLoading?: boolean
  /** 空データ時のタイトル */
  emptyMessageTitle?: string
  /** 空データ時のメッセージ */
  emptyMessageText?: string
  /** 編集ボタンを表示するか */
  showEditButton?: boolean
  /** 削除ボタンを表示するか */
  showDeleteButton?: boolean
  /** アイテムIDを取得する関数 */
  getIdFunction?: (item: any) => number | string
  /** アイテム名を取得する関数 */
  getNameFunction?: (item: any) => string
  /** アイテム説明を取得する関数 */
  getDescriptionFunction?: (item: any) => string
  /** アイテム日付を取得する関数 */
  getDateFunction?: (item: any) => string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyMessageTitle: 'データが登録されていません',
  emptyMessageText: 'データを追加してください。',
  showEditButton: true,
  showDeleteButton: true
})

interface Emits {
  (e: 'edit', item: any): void
  (e: 'delete', id: number | string): void
}

const emit = defineEmits<Emits>()

/**
 * アイテムのIDを取得
 */
const getItemId = (item: any): number | string => {
  if (props.getIdFunction) {
    return props.getIdFunction(item)
  }
  return item.id || item
}

/**
 * アイテムの名前を取得
 */
const getItemName = (item: any): string => {
  if (props.getNameFunction) {
    return props.getNameFunction(item)
  }
  return item.name || item.title || String(item)
}

/**
 * アイテムの説明を取得
 */
const getItemDescription = (item: any): string => {
  if (props.getDescriptionFunction) {
    return props.getDescriptionFunction(item)
  }
  return item.description || item.memo || ''
}

/**
 * アイテムの日付を取得
 */
const getItemDate = (item: any): string => {
  if (props.getDateFunction) {
    return props.getDateFunction(item)
  }
  return item.created_at ? `登録日: ${item.created_at}` : ''
}
</script>

