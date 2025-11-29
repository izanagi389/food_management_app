/**
 * ページ共通のユーティリティ関数
 * フォーマット、ナビゲーション、UI操作に関する共通機能
 */

import { navigateTo } from '#app'

/**
 * 日付をフォーマット
 * @param dateString フォーマットする日付文字列
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '不明'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

/**
 * 難易度テキストを取得
 * @param difficulty 難易度コード
 * @returns 日本語の難易度テキスト
 */
export const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '簡単'
    case 'medium': return '普通'
    case 'hard': return '難しい'
    default: return difficulty
  }
}

/**
 * 確認ダイアログを表示
 * @param message 確認メッセージ
 * @returns ユーザーの選択結果（OK: true, Cancel: false）
 */
export const showConfirmDialog = (message: string): boolean => {
  return confirm(message)
}

/**
 * ページの共通メタデータを生成
 * @param title ページタイトル
 * @param description ページの説明
 * @returns メタデータオブジェクト
 */
export const getPageMeta = (title: string, description: string) => ({
  title: `${title} - 食品管理アプリ`,
  meta: [
    { name: 'description', content: description }
  ]
})

/**
 * URLを安全に開く
 * @param url 開くURL
 */
export const openUrl = (url: string): void => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * 戻る処理（共通関数）
 * @param fallbackUrl 戻れない場合のフォールバックURL
 */
export const goBack = (fallbackUrl: string = '/'): void => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    // NuxtのnavigateToを使用
    if (typeof navigateTo !== 'undefined') {
      navigateTo(fallbackUrl)
    } else {
      // フォールバック
      window.location.href = fallbackUrl
    }
  }
}

/**
 * アプリのナビゲーション構造を取得
 * @returns ルート情報の配列
 */
export const getAppRoutes = () => [
  { 
    path: '/management/ingredients', 
    label: '食品管理', 
    icon: 'restaurantOutline',
    description: '食品の登録・編集・削除'
  },
  { 
    path: '/management/category', 
    label: 'カテゴリ管理', 
    icon: 'listOutline',
    description: '食品カテゴリの管理'
  },
  { 
    path: '/management/recipe', 
    label: 'レシピ管理', 
    icon: 'bookOutline',
    description: 'レシピの登録・編集・削除'
  },
  { 
    path: '/management/health/', 
    label: '健康管理', 
    icon: 'heartOutline',
    description: '健康データの管理'
  },
  { 
    path: '/management/health/user', 
    label: 'ユーザー情報', 
    icon: 'bookOutline',
    description: 'ユーザー情報の管理'
  },
  { 
    path: '/management/health/test', 
    label: 'テストページ', 
    icon: 'bookOutline',
    description: 'Apple Wacth連携テスト'
  }
]
