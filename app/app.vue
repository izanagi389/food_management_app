<template>
  <ion-app>
    <GlobalNavigation />
    <NuxtPage />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp } from '@ionic/vue'
import GlobalNavigation from '~/components/GlobalNavigation.vue'
import { SQLiteManager } from '~/utils/managers/SQLiteManager'
import { onMounted } from 'vue'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

/**
 * アプリ起動時の初期化処理
 */
onMounted(async () => {
  try {
    // ネイティブプラットフォームでのみStatusBarを設定
    if (Capacitor.isNativePlatform()) {
      await initializeNativePlatform()
    } else {
      console.log('Webプラットフォーム: StatusBar設定をスキップしました')
    }

    // データベースを初期化
    await initializeDatabase()
  } catch (error) {
    console.error('❌ アプリ初期化中にエラーが発生しました:', error)
  }
})

/**
 * ネイティブプラットフォームの初期化
 */
async function initializeNativePlatform(): Promise<void> {
  try {
    // ステータスバーをWebViewに重ねない（iOS戻るボタンのタップ阻害防止）
    await StatusBar.setOverlaysWebView({ overlay: false })
    // ステータスバーのスタイル設定
    await StatusBar.setStyle({ style: Style.Dark })
    console.log('✅ StatusBar設定が完了しました')
  } catch (error) {
    console.error('❌ StatusBar設定に失敗しました:', error)
  }
}

/**
 * データベースの初期化
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 データベースを初期化中...')
    
    const dbManager = SQLiteManager.getInstance()
    const initResult = await dbManager.initializeApp()
    
    if (initResult.success) {
      console.log('✅ データベース初期化が完了しました:', initResult.message)
    } else {
      console.error('❌ データベース初期化に失敗しました:', initResult.message)
    }
  } catch (error) {
    console.error('❌ データベース初期化中にエラーが発生しました:', error)
  }
}
</script>
