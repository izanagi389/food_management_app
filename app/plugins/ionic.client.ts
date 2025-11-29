import { IonicVue } from '@ionic/vue'

export default defineNuxtPlugin((nuxtApp) => {
  // クライアントサイドでのみIonicVueを初期化
  if (process.client) {
    nuxtApp.vueApp.use(IonicVue, {
      mode: 'md', // Material Design mode for consistent styling
      innerHTMLTemplatesEnabled: true
    })
  }
})
