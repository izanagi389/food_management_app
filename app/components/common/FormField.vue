<template>
  <ion-item>
    <ion-label position="stacked">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </ion-label>
    
    <!-- テキスト入力 -->
    <ion-input 
      v-if="type === 'text' || type === 'email' || type === 'url' || type === 'number'"
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :min="min"
      :max="max"
      :step="step"
    ></ion-input>
    
    <!-- テキストエリア -->
    <ion-textarea 
      v-else-if="type === 'textarea'"
      v-model="modelValue"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
    ></ion-textarea>
    
    <!-- セレクト -->
    <ion-select 
      v-else-if="type === 'select'"
      v-model="modelValue"
      :placeholder="placeholder"
      :required="required"
    >
      <ion-select-option 
        v-for="option in options" 
        :key="getOptionValue(option)" 
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </ion-select-option>
    </ion-select>
    
    <!-- 日時選択 -->
    <ion-datetime 
      v-else-if="type === 'datetime'"
      v-model="modelValue"
      :presentation="datetimePresentation"
      :show-default-buttons="showDefaultButtons"
    ></ion-datetime>
  </ion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime } from '@ionic/vue'

interface Props {
  /** フィールドのラベル */
  label: string
  /** フィールドのタイプ */
  type: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'select' | 'datetime'
  /** モデル値 */
  modelValue: any
  /** プレースホルダー */
  placeholder?: string
  /** 必須フィールドかどうか */
  required?: boolean
  /** 数値の最小値 */
  min?: number
  /** 数値の最大値 */
  max?: number
  /** 数値のステップ */
  step?: number
  /** テキストエリアの行数 */
  rows?: number
  /** セレクトのオプション */
  options?: any[]
  /** オプションの値を取得する関数 */
  getOptionValue?: (option: any) => any
  /** オプションのラベルを取得する関数 */
  getOptionLabel?: (option: any) => string
  /** 日時の表示形式 */
  datetimePresentation?: string
  /** デフォルトボタンを表示するか */
  showDefaultButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  rows: 3,
  datetimePresentation: 'date',
  showDefaultButtons: true,
  getOptionValue: (option: any) => option.value || option.id || option,
  getOptionLabel: (option: any) => option.label || option.name || String(option)
})

interface Emits {
  (e: 'update:modelValue', value: any): void
}

const emit = defineEmits<Emits>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

