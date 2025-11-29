# 食品管理アプリ

Nuxt 3、Ionic Vue、Capacitorを使用して構築された包括的な食品・健康管理アプリケーションです。

## 📱 機能

- **📱 クロスプラットフォーム対応**: iOS、Android、Webで動作
- **🍎 食品管理**: 食品の登録・編集・削除機能
- **📋 カテゴリ管理**: 食品カテゴリの管理機能
- **🍽️ レシピ管理**: レシピの登録・編集・削除機能
- **💚 健康管理**: 健康データの記録・管理機能
  - 体重、体脂肪率などの健康指標の記録
  - 健康統計の表示
  - HealthKit連携（iOS）
- **👤 ユーザープロファイル管理**: ユーザー情報の登録・編集
- **💾 ローカルデータベース**: 暗号化されたSQLiteデータベースでデータを安全に保存
- **🔒 データ暗号化**: 機密情報を保護するためのデータベース暗号化機能

## 🛠️ 技術スタック

- **フロントエンド**: Nuxt 3、Vue 3、Ionic Vue
- **モバイル**: Capacitor 7
- **データベース**: SQLite（@capacitor-community/sqlite）
  - 暗号化対応
  - iOS/Android/Web対応
- **健康データ**: HealthKit連携（@perfood/capacitor-healthkit）
- **スタイリング**: Ionic CSS
- **パッケージマネージャー**: Yarn
- **テスト**: Vitest

## 📋 必要要件

- **Node.js**: 18以上（推奨: 最新のLTSバージョン）
- **Yarn**: パッケージマネージャー（推奨）
- **iOS開発**: Xcode（macOSのみ）
- **Android開発**: Android Studio

## 🚀 セットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
yarn install
```

### 2. 開発サーバーの起動

```bash
yarn dev
```

アプリは `http://localhost:3000` で利用可能になります。

## 📱 モバイル開発

### プラットフォームの追加

```bash
# iOS
yarn cap:add:ios

# Android
yarn cap:add:android
```

### 変更の同期とネイティブプロジェクトの開く

```bash
# 変更をネイティブプロジェクトに同期
yarn cap:sync

# Xcodeで開く（iOS）
yarn cap:open:ios

# Android Studioで開く
yarn cap:open:android
```

## 📁 プロジェクト構造

```
app/
├── assets/css/          # カスタムCSSファイル
│   ├── components.css
│   ├── custom-ionic.css
│   ├── ionic-variables.css
│   └── pages.css
├── components/          # Vueコンポーネント
│   ├── common/         # 共通コンポーネント
│   ├── ActionButtonsCard.vue
│   ├── DataListCard.vue
│   ├── GlobalNavigation.vue
│   ├── PageHeader.vue
│   └── SystemStatusCard.vue
├── composables/        # Vue Composables
│   ├── useAsyncOperations.ts
│   ├── useDatabase.ts
│   ├── useDataManagement.ts
│   ├── useForm.ts
│   ├── useFormValidation.ts
│   ├── useGlobalMenu.ts
│   ├── useIonicComponents.ts
│   ├── useLifecycle.ts
│   ├── useModal.ts
│   ├── usePageState.ts
│   └── usePlatformAware.ts
├── pages/              # アプリケーションページ
│   ├── index.vue       # ホームページ
│   └── management/     # 管理ページ
│       ├── category/   # カテゴリ管理
│       ├── health/     # 健康管理
│       │   ├── index.vue
│       │   └── user.vue
│       ├── ingredients/ # 食品管理
│       └── recipe/      # レシピ管理
├── plugins/            # Nuxtプラグイン
│   └── ionic.client.ts
├── types/              # TypeScript型定義
│   ├── category.ts
│   ├── common.ts
│   ├── database.ts
│   ├── health.ts
│   ├── ingredient.ts
│   ├── profile.ts
│   ├── recipe.ts
│   └── validation.ts
└── utils/              # ユーティリティ関数
    ├── database/       # データベースユーティリティ
    │   ├── DatabaseConnection.ts
    │   ├── DatabaseUtils.ts
    │   ├── TableManager.ts
    │   └── TableSchema.ts
    ├── helpers/        # ヘルパー関数
    │   └── pageUtils.ts
    ├── managers/       # データマネージャー
    │   ├── BaseManager.ts
    │   ├── CacheManager.ts
    │   ├── CategoryManager.ts
    │   ├── HealthManager.ts
    │   ├── IngredientManager.ts
    │   ├── ProfileManager.ts
    │   ├── RecipeManager.ts
    │   ├── SQLiteManager.ts
    │   └── WebStorageManager.ts
    └── validation/     # バリデーションユーティリティ
        └── validation.ts
```

## 📜 利用可能なスクリプト

- `yarn dev` - 開発サーバーを起動
- `yarn build` - 本番用にビルド
- `yarn generate` - 静的サイトを生成
- `yarn preview` - 本番ビルドをプレビュー
- `yarn cap:sync` - 変更をネイティブプロジェクトに同期
- `yarn cap:open:ios` - XcodeでiOSプロジェクトを開く
- `yarn cap:open:android` - Android StudioでAndroidプロジェクトを開く

## ⚙️ 設定ファイル

- `nuxt.config.ts` - Nuxt設定
- `capacitor.config.json` - Capacitor設定
- `ionic.config.json` - Ionic設定
- `tsconfig.json` - TypeScript設定
- `vitest.config.ts` - Vitest設定

## 💾 データベース

アプリは暗号化されたSQLiteデータベースを使用してデータを永続化します：

- **ユーザープロファイル**: ユーザー情報、身体情報
- **食品データ**: 食品名、カテゴリ、価格、有効期限など
- **レシピデータ**: レシピ情報、材料、手順など
- **健康データ**: 体重、体脂肪率、その他の健康指標
- **カテゴリデータ**: 食品カテゴリ情報

### データベースの特徴

- **暗号化**: iOS/Androidでデータベースが暗号化されます
- **プラットフォーム対応**: iOS、Android、Web（SQL.js）で動作
- **自動初期化**: アプリ起動時に自動的にデータベースが初期化されます

## 🧪 テスト

プロジェクトにはVitestを使用したテストが含まれています：

```bash
# テストの実行（実装が必要な場合）
yarn test
```

テストファイルは `tests/` ディレクトリに配置されています。

## 🔧 開発のヒント

### データベースの確認

アプリ起動時にコンソールにデータベース初期化のログが表示されます。エラーが発生した場合は、コンソールを確認してください。

### プラットフォーム判定

`usePlatformAware` composableを使用して、現在のプラットフォーム（iOS/Android/Web）を判定できます。

### フォームバリデーション

`useFormValidation` composableを使用して、統一されたフォームバリデーションを実装できます。

## 📝 ライセンス

このプロジェクトはプライベートで所有されています。

## 🤝 コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📞 サポート

問題が発生した場合は、イシューを作成してください。
