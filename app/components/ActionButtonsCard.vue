<template>
  <ion-card>
    <ion-card-content>
      <slot name="buttons">
        <!-- デフォルトのボタン群 -->
        <ion-button expand="block" fill="outline" @click="$emit('refresh')" :disabled="isLoading">
          <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
          {{ isLoading ? '処理中...' : 'データ取得' }}
        </ion-button>
      </slot>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { refreshOutline } from 'ionicons/icons'

interface Props {
  isLoading: boolean
}

defineProps<Props>()

defineEmits<{
  refresh: []
}>()
</script>
