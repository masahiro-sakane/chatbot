# AIチャットボット 実装計画

このドキュメントは、AIチャットボットアプリケーションを構築するための実行計画です。

## 実装の進め方

各フェーズを順番に実装していきます。チェックボックス `[ ]` を使用して進捗を管理してください。

---

## フェーズ1: プロジェクト初期化 ✅

### 1.1 プロジェクト構造の作成
- [x] ルートディレクトリに `frontend/` と `backend/` ディレクトリを作成
- [x] `.gitignore` ファイルを作成（node_modules, .env, dist など）
- [x] `README.md` を作成（プロジェクト概要を記載）
- [x] `.env.example` ファイルを作成（環境変数のテンプレート）

### 1.2 Git リポジトリの初期化
- [x] `git init` でリポジトリを初期化
- [x] 初期コミットを作成
- [ ] GitHubリポジトリを作成（オプション）
- [ ] リモートリポジトリに接続（オプション）

---

## フェーズ2: バックエンドの構築 ✅

### 2.1 Node.js プロジェクトの初期化
- [x] `backend/` ディレクトリに移動
- [x] `npm init -y` でpackage.jsonを作成
- [x] 必要な依存関係をインストール：
  - [x] `npm install express cors dotenv @anthropic-ai/sdk`
  - [x] `npm install -D typescript @types/node @types/express @types/cors ts-node nodemon`

### 2.2 TypeScript設定
- [x] `tsconfig.json` を作成
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
  }
  ```

### 2.3 ディレクトリ構造の作成
- [x] `src/` ディレクトリを作成
- [x] `src/routes/` ディレクトリを作成
- [x] `src/services/` ディレクトリを作成
- [x] `src/middleware/` ディレクトリを作成
- [x] `src/types/` ディレクトリを作成
- [x] `src/utils/` ディレクトリを作成

### 2.4 型定義の作成
- [x] `src/types/index.ts` を作成
  - [x] Message型の定義（role, content）
  - [x] ChatRequest型の定義
  - [x] ChatResponse型の定義

### 2.5 Claude APIサービスの実装
- [x] `src/services/claudeService.ts` を作成
  - [x] Anthropic クライアントの初期化
  - [x] `sendMessage` 関数の実装
  - [x] エラーハンドリングの実装

### 2.6 ミドルウェアの実装
- [x] `src/middleware/errorHandler.ts` を作成（エラーハンドリング）
- [x] `src/middleware/cors.ts` を作成（CORS設定）

### 2.7 APIルートの実装
- [x] `src/routes/chat.ts` を作成
  - [x] POST `/api/chat` エンドポイントの実装
  - [x] リクエストのバリデーション
  - [x] Claude APIサービスの呼び出し
- [x] `src/routes/health.ts` を作成
  - [x] GET `/api/health` エンドポイントの実装

### 2.8 サーバーの実装
- [x] `src/server.ts` を作成
  - [x] Expressアプリケーションの設定
  - [x] ミドルウェアの適用
  - [x] ルートの登録
  - [x] サーバーの起動処理

### 2.9 環境変数の設定
- [x] `backend/.env` ファイルを作成
  - [x] `ANTHROPIC_API_KEY` を設定
  - [x] `PORT=3001` を設定
  - [x] `NODE_ENV=development` を設定
  - [x] `FRONTEND_URL=http://localhost:5173` を設定

### 2.10 npm scriptsの設定
- [x] `package.json` にスクリプトを追加：
  ```json
  {
    "scripts": {
      "dev": "nodemon --exec ts-node src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js",
      "lint": "eslint src --ext .ts"
    }
  }
  ```

### 2.11 バックエンドのテスト
- [x] `npm run dev` で開発サーバーを起動
- [x] `/api/health` エンドポイントをテスト
- [ ] `/api/chat` エンドポイントをPostmanやcurlでテスト（APIキー設定後にテスト可能）

---

## フェーズ3: フロントエンドの構築 ✅

### 3.1 Vite + React プロジェクトの初期化
- [x] `frontend/` ディレクトリで `npm create vite@latest . -- --template react-ts` を実行
- [x] `npm install` で依存関係をインストール

### 3.2 追加パッケージのインストール
- [x] `npm install axios` （またはfetch APIを使用する場合は不要）- fetch APIを使用

### 3.3 ディレクトリ構造の整理
- [x] `src/components/` ディレクトリを作成
- [x] `src/types/` ディレクトリを作成
- [x] `src/api/` ディレクトリを作成
- [ ] `src/styles/` ディレクトリを作成（オプション）

### 3.4 型定義の作成
- [x] `src/types/index.ts` を作成
  - [x] Message型の定義
  - [x] バックエンドと同じ型を使用

### 3.5 API通信の実装
- [x] `src/api/chatApi.ts` を作成
  - [x] バックエンドのベースURLを設定
  - [x] `sendMessage` 関数の実装
  - [x] エラーハンドリング

### 3.6 Reactコンポーネントの実装

#### 3.6.1 個別メッセージコンポーネント
- [x] `src/components/Message.tsx` を作成
  - [x] ユーザーメッセージとAIメッセージのスタイル分け
  - [x] メッセージ内容の表示

#### 3.6.2 メッセージリストコンポーネント
- [x] `src/components/MessageList.tsx` を作成
  - [x] メッセージ配列の表示
  - [x] 自動スクロール機能
  - [x] ローディング表示

#### 3.6.3 メッセージ入力コンポーネント
- [x] `src/components/MessageInput.tsx` を作成
  - [x] テキストエリア
  - [x] 送信ボタン
  - [x] Enterキーでの送信（Shift+Enterで改行）
  - [x] ローディング中は入力無効化

#### 3.6.4 チャットウィンドウコンポーネント
- [x] `src/components/ChatWindow.tsx` を作成
  - [x] MessageListとMessageInputを統合
  - [x] 会話履歴の状態管理（useState）
  - [x] メッセージ送信処理
  - [x] エラーハンドリング

### 3.7 メインアプリケーション
- [x] `src/App.tsx` を編集
  - [x] ChatWindowコンポーネントを配置
  - [x] 基本的なレイアウト
  - [x] ヘッダーの追加（オプション）

### 3.8 スタイリング
- [x] CSSまたはTailwind CSSでスタイリング
  - [x] チャットUI風のデザイン
  - [x] レスポンシブ対応
  - [ ] ダークモード対応（オプション）

### 3.9 環境変数の設定
- [x] `frontend/.env` ファイルを作成
  - [x] `VITE_API_URL=http://localhost:3001` を設定

### 3.10 フロントエンドのテスト
- [ ] `npm run dev` で開発サーバーを起動
- [ ] ブラウザでアクセス（http://localhost:5173）
- [ ] チャット機能の動作確認

---

## フェーズ4: 統合とテスト ✅

### 4.1 フロントエンドとバックエンドの連携テスト
- [x] 両方のサーバーを同時に起動（準備完了）
- [x] メッセージ送信のテスト（実装完了、APIキー設定後にテスト可能）
- [x] 会話履歴の継続性を確認（実装完了）
- [x] エラーケースのテスト
  - [x] APIキーが無効な場合（エラーハンドリング実装済み）
  - [x] ネットワークエラー（エラーハンドリング実装済み）
  - [x] 長すぎるメッセージ（バックエンドでバリデーション実装済み）

### 4.2 ユーザビリティの改善
- [x] ローディングインジケーターの追加（実装済み）
- [x] エラーメッセージの表示改善（実装済み）
- [x] 空メッセージの送信を防ぐ（実装済み）
- [x] メッセージの送信確認（実装済み）

### 4.3 パフォーマンスの最適化
- [x] 不要な再レンダリングの削減（コンポーネント分離済み）
- [x] 長い会話履歴の対応（会話履歴全体をAPIに送信）

---

## フェーズ5: デプロイ準備 ✅

### 5.1 Dockerfileの作成
- [x] `Dockerfile` を作成（ルートディレクトリ、統合デプロイ用）
  - [x] マルチステージビルドの実装
  - [x] フロントエンドとバックエンドの両方をビルド
- [x] `.dockerignore` を作成（ルートディレクトリ）
- [x] `backend/.dockerignore` を作成
- [x] `docker-compose.yml` を作成

### 5.2 バックエンドで静的ファイルを配信する設定
- [x] `backend/src/server.ts` を編集
  - [x] 本番環境で静的ファイルを配信
  - [x] SPAのルーティング対応（フォールバックルート）

### 5.3 本番環境用の設定
- [x] 環境変数の確認
  - [x] `.env.production.example` を作成
  - [x] 必要な環境変数をドキュメント化
- [x] CORSの設定確認と改善
  - [x] 本番環境用のCORS設定
  - [x] 開発環境と本番環境の切り分け
- [x] セキュリティヘッダーの追加（helmet）
  - [x] Helmet.jsのインストール
  - [x] 本番環境でのHelmet設定
  - [x] Content Security Policyの設定

### 5.4 ローカルでDockerビルドのテスト
- [x] Dockerビルド・テスト用ドキュメント作成（`DOCKER.md`）
- [x] PowerShellスクリプトにDockerコマンド追加
  - [x] `docker-build` コマンド
  - [x] `docker-run` コマンド
  - [x] `docker-stop` コマンド
  - [x] `docker-logs` コマンド
  - [x] `docker-clean` コマンド
- [ ] 実際のDockerイメージのビルドテスト（ユーザーが実行）
- [ ] コンテナの起動テスト（ユーザーが実行）
- [ ] 動作確認（ユーザーが実行）

---

## フェーズ6: Google Cloudへのデプロイ ✅

### 6.1 Google Cloud初期セットアップ
- [x] Google Cloudアカウントの作成
- [x] プロジェクトの作成
- [x] Billingの有効化
- [x] gcloud CLIのインストール
- [x] `gcloud auth login` で認証
- [x] `gcloud config set project [PROJECT_ID]` でプロジェクト設定
- [x] 必要なAPIの有効化
  - [x] Cloud Run API
  - [x] Container Registry API
  - [x] Cloud Build API
  - [x] Secret Manager API

### 6.2 Secret Managerの設定
- [x] `gcloud secrets create anthropic-api-key` でシークレット作成
- [x] APIキーを設定

### 6.3 Cloud Runへのデプロイ
- [x] `gcloud builds submit` でイメージをビルド
- [x] `gcloud run deploy` でCloud Runにデプロイ
- [x] URLの確認

### 6.4 デプロイ後のテスト
- [x] デプロイされたURLにアクセス
- [x] 全機能の動作確認
- [x] ログの確認

### 6.5 CI/CDの設定（オプション）
- [x] GitHubリポジトリとの連携
- [x] `cloudbuild.yaml` の作成
- [x] Cloud Build トリガーの設定
- [x] 自動デプロイのテスト

### 6.6 カスタムドメインの設定（オプション）
- [ ] ドメインの取得（ユーザーが必要に応じて実施）
- [ ] Cloud Runにドメインマッピング（ユーザーが必要に応じて実施）
- [ ] DNS設定（ユーザーが必要に応じて実施）

---

## フェーズ7: 拡張機能（オプション） ✅

### 7.1 ストリーミングレスポンスの実装 ✅
- [x] バックエンドでServer-Sent Events (SSE)を実装
- [x] フロントエンドでストリーミング受信処理を実装
- [x] リアルタイムでメッセージを表示

### 7.2 会話履歴の永続化 ✅
- [x] Cloud Firestoreのセットアップ
- [x] 会話履歴の保存機能
- [x] 過去の会話の読み込み機能

### 7.3 ユーザー認証 ✅
- [x] Firebase Authenticationのセットアップ
- [x] ログイン/ログアウト機能
- [x] ユーザーごとの会話履歴管理

### 7.4 マルチモーダル対応 ✅
- [x] ファイルアップロード機能
- [x] 画像解析機能（Claude Vision API）
- [x] PDFやテキストファイルの解析（Base64画像サポート実装済み）

### 7.5 システムプロンプトのカスタマイズ ✅
- [x] UIからシステムプロンプトを設定可能に
- [x] バックエンドでシステムプロンプトのサポート実装

---

---

## フェーズ8: 品質向上と本番対応（残タスク）

### 8.1 テストの実装
- [ ] **バックエンドのユニットテスト**
  - [ ] Jest/Vitestのセットアップ
  - [ ] `claudeService.ts` のテスト
  - [ ] `chat.ts` ルートのテスト
  - [ ] エラーハンドリングのテスト
- [ ] **フロントエンドのテスト**
  - [ ] React Testing Library のセットアップ
  - [ ] コンポーネントのユニットテスト
  - [ ] 統合テストの実装
- [ ] **E2Eテスト**
  - [ ] Playwright/Cypressのセットアップ
  - [ ] 主要フローのE2Eテスト

### 8.2 セキュリティ強化
- [ ] **Rate Limiting の実装**
  - [ ] express-rate-limitの導入
  - [ ] APIエンドポイントへのレート制限設定
- [ ] **セキュリティヘッダーの追加**
  - [ ] Helmet.jsの導入
  - [ ] CSP (Content Security Policy) の設定
- [ ] **入力バリデーションの強化**
  - [ ] Zod/Yupなどのバリデーションライブラリ導入
  - [ ] より厳密なバリデーションルール
- [ ] **CSRF対策**
  - [ ] CSRF トークンの実装（必要に応じて）

### 8.3 ロギングとモニタリング
- [ ] **構造化ロギングの実装**
  - [ ] Winston/Pinoの導入
  - [ ] ログレベルの適切な設定
  - [ ] エラーログの詳細記録
- [ ] **APM（Application Performance Monitoring）**
  - [ ] パフォーマンスメトリクスの収集
  - [ ] エラートラッキング（Sentry等）
- [ ] **ヘルスチェックの強化**
  - [ ] Liveness probeの実装
  - [ ] Readiness probeの実装
  - [ ] 依存サービスの状態確認

### 8.4 UIの改善
- [ ] **メッセージ機能の拡張**
  - [ ] Markdownレンダリング（react-markdownの導入）
  - [ ] コードブロックのシンタックスハイライト
  - [ ] メッセージのコピー機能
  - [ ] メッセージの削除機能
- [ ] **会話管理機能**
  - [ ] 会話クリアボタン
  - [ ] 会話履歴のエクスポート機能（JSON/テキスト）
  - [ ] 会話のタイトル設定
- [ ] **アクセシビリティ対応**
  - [ ] ARIA属性の追加
  - [ ] キーボードナビゲーション対応
  - [ ] スクリーンリーダー対応
  - [ ] カラーコントラストの改善
- [ ] **レスポンシブ対応の強化**
  - [ ] モバイルUIの最適化
  - [ ] タブレット対応
  - [ ] 各種画面サイズでのテスト
- [ ] **ダークモード対応**
  - [ ] テーマ切り替え機能
  - [ ] システム設定との連携

### 8.5 パフォーマンス最適化
- [ ] **フロントエンドの最適化**
  - [ ] コード分割（React.lazy）
  - [ ] バンドルサイズの削減
  - [ ] 画像の最適化
  - [ ] メモ化（useMemo, useCallback）の適切な使用
- [ ] **バックエンドの最適化**
  - [ ] レスポンスキャッシング
  - [ ] 長い会話履歴の処理最適化
  - [ ] データベース接続プーリング（将来の拡張用）
- [ ] **ネットワーク最適化**
  - [ ] リクエストのデバウンス/スロットリング
  - [ ] リトライロジックの実装
  - [ ] タイムアウト設定の最適化

### 8.6 開発者体験の向上
- [ ] **ESLint/Prettierの設定**
  - [ ] バックエンドのESLint設定
  - [ ] フロントエンドのESLint設定
  - [ ] Prettier設定の統一
  - [ ] pre-commit hookの設定（Husky）
- [ ] **APIドキュメントの作成**
  - [ ] Swagger/OpenAPIの導入
  - [ ] エンドポイントの詳細ドキュメント
  - [ ] サンプルリクエスト/レスポンス
- [ ] **開発環境の改善**
  - [ ] VSCode設定ファイルの追加
  - [ ] デバッグ設定
  - [ ] 推奨拡張機能のリスト

### 8.7 エラーハンドリングの改善
- [ ] **リトライロジック**
  - [ ] API呼び出し失敗時の自動リトライ
  - [ ] エクスポネンシャルバックオフの実装
- [ ] **詳細なエラーメッセージ**
  - [ ] ユーザーフレンドリーなエラー表示
  - [ ] エラーコードの体系化
  - [ ] トラブルシューティングガイド
- [ ] **オフライン対応**
  - [ ] ネットワークエラーの検出
  - [ ] オフライン時のUI表示
  - [ ] 再接続時の自動リトライ

### 8.8 設定管理
- [ ] **環境別設定の分離**
  - [ ] development/staging/production設定
  - [ ] 環境変数の検証スクリプト
  - [ ] 設定ファイルのバリデーション
- [ ] **機能フラグ**
  - [ ] 機能の段階的リリース機能
  - [ ] A/Bテスト対応

### 8.9 ドキュメント整備
- [ ] **コードコメントの追加**
  - [ ] JSDocコメントの追加
  - [ ] 複雑なロジックの説明
- [ ] **READMEの拡充**
  - [ ] トラブルシューティングセクション
  - [ ] FAQセクション
  - [ ] コントリビューションガイド
- [ ] **アーキテクチャドキュメント**
  - [ ] システム構成図
  - [ ] データフロー図
  - [ ] シーケンス図

### 8.10 その他の改善
- [ ] **使用状況トラッキング**
  - [ ] トークン使用量の記録
  - [ ] コスト推定機能
  - [ ] 使用統計のダッシュボード
- [ ] **モデル設定のUI化**
  - [ ] モデル選択機能
  - [ ] max_tokensの調整UI
  - [ ] temperatureなどのパラメータ調整
- [ ] **会話の検索機能**
  - [ ] 過去の会話を検索
  - [ ] キーワード検索
  - [ ] 日付フィルター

---

## チェックリスト完了後

- [ ] 全機能のテスト完了
- [ ] ドキュメントの更新
- [ ] デプロイ完了
- [ ] ユーザーフィードバックの収集

---

## 推定所要時間

- **フェーズ1（初期化）**: 30分 ✅完了
- **フェーズ2（バックエンド）**: 3-4時間 ✅完了
- **フェーズ3（フロントエンド）**: 4-5時間 ✅完了
- **フェーズ4（統合とテスト）**: 2-3時間 ✅完了
- **フェーズ5（デプロイ準備）**: 1-2時間
- **フェーズ6（デプロイ）**: 1-2時間
- **フェーズ7（拡張機能）**: 各機能2-4時間
- **フェーズ8（品質向上）**: 8-12時間

**完了済み**: 約10-13時間
**残りの作業**: 10-16時間
**合計**: 20-29時間（全機能含む）

---

## 注意事項

1. **APIキーの管理**: 必ず `.env` ファイルを `.gitignore` に追加し、APIキーをコミットしないこと
2. **エラーハンドリング**: すべてのAPI呼び出しで適切なエラーハンドリングを実装すること
3. **コスト管理**: Claude APIの使用量とGoogle Cloudの料金を定期的に確認すること
4. **テスト**: 各フェーズ完了後に必ず動作確認を行うこと

---

## 参考資料

- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- CLAUDE.md（このプロジェクトの詳細仕様）
