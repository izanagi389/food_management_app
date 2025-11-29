<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <form @submit.prevent="$emit('submit')">
        <slot name="form-fields"></slot>
        
        <div class="ion-padding-top">
          <ion-button 
            expand="block" 
            type="submit" 
            :disabled="isLoading || !isFormValid"
          >
            <ion-icon :icon="submitIcon" slot="start"></ion-icon>
            {{ isLoading ? loadingText : submitText }}
          </ion-button>
          <ion-button 
            expand="block" 
            fill="outline" 
            @click="$emit('close')"
          >
            <ion-icon :icon="closeOutline" slot="start"></ion-icon>
            キャンセル
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/vue'
import { closeOutline, addOutline, saveOutline } from 'ionicons/icons'

interface Props {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルのタイトル */
  title: string
  /** ローディング状態 */
  isLoading?: boolean
  /** フォームのバリデーション状態 */
  isFormValid?: boolean
  /** 送信ボタンのテキスト */
  submitText?: string
  /** ローディング中のテキスト */
  loadingText?: string
  /** 送信ボタンのアイコン（ionicons/iconsからインポートしたアイコンオブジェクト） */
  submitIcon?: any
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isFormValid: true,
  submitText: '送信',
  loadingText: '処理中...',
  submitIcon: addOutline
})

interface Emits {
  (e: 'close'): void
  (e: 'submit'): void
}

const emit = defineEmits<Emits>()
</script>
