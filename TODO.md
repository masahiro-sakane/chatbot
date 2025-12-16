# AIチャットボット 実装計画

このドキュメントは、AIチャットボットアプリケーションを構築するための実行計画です。

## 実装の進め方

各フェーズを順番に実装していきます。チェックボックス `[ ]` を使用して進捗を管理してください。

---

## フェーズ1: プロジェクト初期化

### 1.1 プロジェクト構造の作成
- [ ] ルートディレクトリに `frontend/` と `backend/` ディレクトリを作成
- [ ] `.gitignore` ファイルを作成（node_modules, .env, dist など）
- [ ] `README.md` を作成（プロジェクト概要を記載）
- [ ] `.env.example` ファイルを作成（環境変数のテンプレート）

### 1.2 Git リポジトリの初期化
- [ ] `git init` でリポジトリを初期化
- [ ] 初期コミットを作成
- [ ] GitHubリポジトリを作成（オプション）
- [ ] リモートリポジトリに接続（オプション）

---

## フェーズ2: バックエンドの構築

### 2.1 Node.js プロジェクトの初期化
- [ ] `backend/` ディレクトリに移動
- [ ] `npm init -y` でpackage.jsonを作成
- [ ] 必要な依存関係をインストール：
  - [ ] `npm install express cors dotenv @anthropic-ai/sdk`
  - [ ] `npm install -D typescript @types/node @types/express @types/cors ts-node nodemon`

### 2.2 TypeScript設定
- [ ] `tsconfig.json` を作成
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
- [ ] `src/` ディレクトリを作成
- [ ] `src/routes/` ディレクトリを作成
- [ ] `src/services/` ディレクトリを作成
- [ ] `src/middleware/` ディレクトリを作成
- [ ] `src/types/` ディレクトリを作成
- [ ] `src/utils/` ディレクトリを作成

### 2.4 型定義の作成
- [ ] `src/types/index.ts` を作成
  - [ ] Message型の定義（role, content）
  - [ ] ChatRequest型の定義
  - [ ] ChatResponse型の定義

### 2.5 Claude APIサービスの実装
- [ ] `src/services/claudeService.ts` を作成
  - [ ] Anthropic クライアントの初期化
  - [ ] `sendMessage` 関数の実装
  - [ ] エラーハンドリングの実装

### 2.6 ミドルウェアの実装
- [ ] `src/middleware/errorHandler.ts` を作成（エラーハンドリング）
- [ ] `src/middleware/cors.ts` を作成（CORS設定）

### 2.7 APIルートの実装
- [ ] `src/routes/chat.ts` を作成
  - [ ] POST `/api/chat` エンドポイントの実装
  - [ ] リクエストのバリデーション
  - [ ] Claude APIサービスの呼び出し
- [ ] `src/routes/health.ts` を作成
  - [ ] GET `/api/health` エンドポイントの実装

### 2.8 サーバーの実装
- [ ] `src/server.ts` を作成
  - [ ] Expressアプリケーションの設定
  - [ ] ミドルウェアの適用
  - [ ] ルートの登録
  - [ ] サーバーの起動処理

### 2.9 環境変数の設定
- [ ] `backend/.env` ファイルを作成
  - [ ] `ANTHROPIC_API_KEY` を設定
  - [ ] `PORT=3001` を設定
  - [ ] `NODE_ENV=development` を設定
  - [ ] `FRONTEND_URL=http://localhost:5173` を設定

### 2.10 npm scriptsの設定
- [ ] `package.json` にスクリプトを追加：
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
- [ ] `npm run dev` で開発サーバーを起動
- [ ] `/api/health` エンドポイントをテスト
- [ ] `/api/chat` エンドポイントをPostmanやcurlでテスト

---

## フェーズ3: フロントエンドの構築

### 3.1 Vite + React プロジェクトの初期化
- [ ] `frontend/` ディレクトリで `npm create vite@latest . -- --template react-ts` を実行
- [ ] `npm install` で依存関係をインストール

### 3.2 追加パッケージのインストール
- [ ] `npm install axios` （またはfetch APIを使用する場合は不要）

### 3.3 ディレクトリ構造の整理
- [ ] `src/components/` ディレクトリを作成
- [ ] `src/types/` ディレクトリを作成
- [ ] `src/api/` ディレクトリを作成
- [ ] `src/styles/` ディレクトリを作成（オプション）

### 3.4 型定義の作成
- [ ] `src/types/index.ts` を作成
  - [ ] Message型の定義
  - [ ] バックエンドと同じ型を使用

### 3.5 API通信の実装
- [ ] `src/api/chatApi.ts` を作成
  - [ ] バックエンドのベースURLを設定
  - [ ] `sendMessage` 関数の実装
  - [ ] エラーハンドリング

### 3.6 Reactコンポーネントの実装

#### 3.6.1 個別メッセージコンポーネント
- [ ] `src/components/Message.tsx` を作成
  - [ ] ユーザーメッセージとAIメッセージのスタイル分け
  - [ ] メッセージ内容の表示

#### 3.6.2 メッセージリストコンポーネント
- [ ] `src/components/MessageList.tsx` を作成
  - [ ] メッセージ配列の表示
  - [ ] 自動スクロール機能
  - [ ] ローディング表示

#### 3.6.3 メッセージ入力コンポーネント
- [ ] `src/components/MessageInput.tsx` を作成
  - [ ] テキストエリア
  - [ ] 送信ボタン
  - [ ] Enterキーでの送信（Shift+Enterで改行）
  - [ ] ローディング中は入力無効化

#### 3.6.4 チャットウィンドウコンポーネント
- [ ] `src/components/ChatWindow.tsx` を作成
  - [ ] MessageListとMessageInputを統合
  - [ ] 会話履歴の状態管理（useState）
  - [ ] メッセージ送信処理
  - [ ] エラーハンドリング

### 3.7 メインアプリケーション
- [ ] `src/App.tsx` を編集
  - [ ] ChatWindowコンポーネントを配置
  - [ ] 基本的なレイアウト
  - [ ] ヘッダーの追加（オプション）

### 3.8 スタイリング
- [ ] CSSまたはTailwind CSSでスタイリング
  - [ ] チャットUI風のデザイン
  - [ ] レスポンシブ対応
  - [ ] ダークモード対応（オプション）

### 3.9 環境変数の設定
- [ ] `frontend/.env` ファイルを作成
  - [ ] `VITE_API_URL=http://localhost:3001` を設定

### 3.10 フロントエンドのテスト
- [ ] `npm run dev` で開発サーバーを起動
- [ ] ブラウザでアクセス（http://localhost:5173）
- [ ] チャット機能の動作確認

---

## フェーズ4: 統合とテスト

### 4.1 フロントエンドとバックエンドの連携テスト
- [ ] 両方のサーバーを同時に起動
- [ ] メッセージ送信のテスト
- [ ] 会話履歴の継続性を確認
- [ ] エラーケースのテスト
  - [ ] APIキーが無効な場合
  - [ ] ネットワークエラー
  - [ ] 長すぎるメッセージ

### 4.2 ユーザビリティの改善
- [ ] ローディングインジケーターの追加
- [ ] エラーメッセージの表示改善
- [ ] 空メッセージの送信を防ぐ
- [ ] メッセージの送信確認

### 4.3 パフォーマンスの最適化
- [ ] 不要な再レンダリングの削減（useMemo, useCallback）
- [ ] 長い会話履歴の対応（トークン数の管理）

---

## フェーズ5: デプロイ準備

### 5.1 Dockerfileの作成
- [ ] `backend/Dockerfile` を作成（統合デプロイ用）
  - [ ] マルチステージビルドの実装
  - [ ] フロントエンドとバックエンドの両方をビルド
- [ ] `backend/.dockerignore` を作成

### 5.2 バックエンドで静的ファイルを配信する設定
- [ ] `backend/src/server.ts` を編集
  - [ ] 本番環境で静的ファイルを配信
  - [ ] SPAのルーティング対応

### 5.3 本番環境用の設定
- [ ] 環境変数の確認
- [ ] CORSの設定確認
- [ ] セキュリティヘッダーの追加（helmet など）

### 5.4 ローカルでDockerビルドのテスト
- [ ] Dockerイメージのビルド
- [ ] コンテナの起動テスト
- [ ] 動作確認

---

## フェーズ6: Google Cloudへのデプロイ

### 6.1 Google Cloud初期セットアップ
- [ ] Google Cloudアカウントの作成
- [ ] プロジェクトの作成
- [ ] Billingの有効化
- [ ] gcloud CLIのインストール
- [ ] `gcloud auth login` で認証
- [ ] `gcloud config set project [PROJECT_ID]` でプロジェクト設定
- [ ] 必要なAPIの有効化
  - [ ] Cloud Run API
  - [ ] Container Registry API
  - [ ] Cloud Build API
  - [ ] Secret Manager API

### 6.2 Secret Managerの設定
- [ ] `gcloud secrets create anthropic-api-key` でシークレット作成
- [ ] APIキーを設定

### 6.3 Cloud Runへのデプロイ
- [ ] `gcloud builds submit` でイメージをビルド
- [ ] `gcloud run deploy` でCloud Runにデプロイ
- [ ] URLの確認

### 6.4 デプロイ後のテスト
- [ ] デプロイされたURLにアクセス
- [ ] 全機能の動作確認
- [ ] ログの確認

### 6.5 CI/CDの設定（オプション）
- [ ] GitHubリポジトリとの連携
- [ ] `cloudbuild.yaml` の作成
- [ ] Cloud Build トリガーの設定
- [ ] 自動デプロイのテスト

### 6.6 カスタムドメインの設定（オプション）
- [ ] ドメインの取得
- [ ] Cloud Runにドメインマッピング
- [ ] DNS設定

---

## フェーズ7: 拡張機能（オプション）

### 7.1 ストリーミングレスポンスの実装
- [ ] バックエンドでServer-Sent Events (SSE)を実装
- [ ] フロントエンドでストリーミング受信処理を実装
- [ ] リアルタイムでメッセージを表示

### 7.2 会話履歴の永続化
- [ ] Cloud FirestoreまたはCloud SQLのセットアップ
- [ ] 会話履歴の保存機能
- [ ] 過去の会話の読み込み機能

### 7.3 ユーザー認証
- [ ] Firebase Authenticationのセットアップ
- [ ] ログイン/ログアウト機能
- [ ] ユーザーごとの会話履歴管理

### 7.4 マルチモーダル対応
- [ ] ファイルアップロード機能
- [ ] 画像解析機能（Claude Vision API）
- [ ] PDFやテキストファイルの解析

### 7.5 システムプロンプトのカスタマイズ
- [ ] UIからシステムプロンプトを設定可能に
- [ ] プリセットの用意（アシスタント、先生、専門家など）

---

## チェックリスト完了後

- [ ] 全機能のテスト完了
- [ ] ドキュメントの更新
- [ ] デプロイ完了
- [ ] ユーザーフィードバックの収集

---

## 推定所要時間

- **フェーズ1（初期化）**: 30分
- **フェーズ2（バックエンド）**: 3-4時間
- **フェーズ3（フロントエンド）**: 4-5時間
- **フェーズ4（統合とテスト）**: 2-3時間
- **フェーズ5（デプロイ準備）**: 1-2時間
- **フェーズ6（デプロイ）**: 1-2時間
- **フェーズ7（拡張機能）**: 各機能2-4時間

**合計**: 12-17時間（基本機能のみ）

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
