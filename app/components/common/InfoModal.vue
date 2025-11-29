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
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ cardTitle }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <slot name="content"></slot>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'

interface Props {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルのタイトル */
  title: string
  /** カードのタイトル */
  cardTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  cardTitle: ''
})

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
</script>
