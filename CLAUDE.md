# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

必ず日本語で回答をして下さい。

## プロジェクト概要

汎用的なAI会話ボットのWebアプリケーション。Claude API (Anthropic)を使用し、ユーザーと自然な対話を提供します。

- **用途**: 汎用的な会話ボット
- **アクセス**: 匿名利用（認証不要）
- **会話履歴**: セッション中のみメモリに保持（データベース不要）

## 技術スタック

### フロントエンド
- React 18+ with TypeScript
- 状態管理: React Hooks (useState, useEffect)
- HTTP通信: fetch API または axios

### バックエンド
- Node.js 18+ with TypeScript
- フレームワーク: Express または Fastify
- Claude API: @anthropic-ai/sdk

### 開発ツール
- ビルドツール: Vite (フロントエンド), tsc (バックエンド)
- パッケージマネージャー: npm または pnpm
- リンター: ESLint
- フォーマッター: Prettier

## プロジェクト構造

```
chatbot/
├── frontend/               # Reactフロントエンド
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   │   ├── ChatWindow.tsx      # メインチャット画面
│   │   │   ├── MessageList.tsx     # メッセージ一覧表示
│   │   │   ├── MessageInput.tsx    # メッセージ入力欄
│   │   │   └── Message.tsx         # 個別メッセージ
│   │   ├── types/         # TypeScript型定義
│   │   ├── api/           # バックエンドAPI呼び出し
│   │   ├── App.tsx        # ルートコンポーネント
│   │   └── main.tsx       # エントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
├── backend/               # Node.jsバックエンド
│   ├── src/
│   │   ├── routes/        # APIルート定義
│   │   │   └── chat.ts    # チャットエンドポイント
│   │   ├── services/      # ビジネスロジック
│   │   │   └── claudeService.ts  # Claude API連携
│   │   ├── middleware/    # ミドルウェア（CORS、エラーハンドリング等）
│   │   ├── types/         # TypeScript型定義
│   │   ├── utils/         # ユーティリティ関数
│   │   └── server.ts      # サーバーエントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example           # 環境変数のサンプル
└── CLAUDE.md             # このファイル
```

## セットアップ

### 1. 環境変数の設定

`.env`ファイルをバックエンドディレクトリに作成：

```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. 依存関係のインストール

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

## 開発コマンド

### バックエンド (backend/)

```bash
# 開発サーバー起動（ホットリロード）
npm run dev

# ビルド
npm run build

# 本番環境実行
npm start

# リント
npm run lint

# テスト
npm test
```

### フロントエンド (frontend/)

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー（ビルド後）
npm run preview

# リント
npm run lint
```

### 同時実行

開発時はバックエンドとフロントエンドを別々のターミナルで起動してください。

## API設計

### エンドポイント

#### POST /api/chat
チャットメッセージを送信し、AIからの応答を取得

**リクエスト:**
```json
{
  "message": "こんにちは",
  "conversationHistory": [
    {
      "role": "user",
      "content": "前回のメッセージ"
    },
    {
      "role": "assistant",
      "content": "前回の応答"
    }
  ]
}
```

**レスポンス:**
```json
{
  "response": "こんにちは！何かお手伝いできることはありますか？",
  "model": "claude-3-5-sonnet-20241022"
}
```

#### GET /api/health
ヘルスチェック用エンドポイント

**レスポンス:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T12:00:00Z"
}
```

## アーキテクチャの詳細

### 会話フロー

1. **ユーザー入力**: フロントエンドでメッセージを入力
2. **リクエスト送信**: `/api/chat`エンドポイントに現在のメッセージと会話履歴を送信
3. **Claude API呼び出し**: バックエンドがClaude APIに会話コンテキスト全体を送信
4. **レスポンス取得**: Claude APIからの応答を受信
5. **UI更新**: フロントエンドで会話履歴を更新し、画面に表示

### セッション管理

- 会話履歴はフロントエンド（Reactの状態）で管理
- ページをリロードすると履歴はクリアされる
- 必要に応じて`localStorage`で永続化も可能（オプション）

### Claude API連携

`backend/src/services/claudeService.ts`でClaude APIとの通信を一元管理：

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function sendMessage(messages: Message[]) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: messages,
  });
  return response.content[0].text;
}
```

## 開発時の注意点

### セキュリティ

- APIキーは必ず環境変数で管理し、`.env`ファイルを`.gitignore`に追加
- フロントエンドに絶対にAPIキーを含めない
- CORSを適切に設定（開発時は`FRONTEND_URL`のみ許可）

### エラーハンドリング

- Claude APIのレート制限に注意
- ネットワークエラーや429エラーの適切なハンドリング
- ユーザーフレンドリーなエラーメッセージの表示

### パフォーマンス

- 長い会話履歴はトークン数に影響するため、必要に応じて古いメッセージを削除
- ストリーミングレスポンス（`stream: true`）の実装を検討してユーザー体験を向上

### 型安全性

- フロントエンドとバックエンドで共通の型定義を使用
- メッセージ型、API型などを一貫して定義

## Claude APIの使用モデル

- **推奨モデル**: `claude-3-5-sonnet-20241022`
  - バランスの取れたパフォーマンスとコスト
  - 高速な応答速度
  - 優れた会話能力

- **代替モデル**:
  - `claude-3-5-haiku-20241022`: より高速でコスト効率的（シンプルなタスク向け）
  - `claude-opus-4-5-20251101`: 最高品質が必要な場合（コスト高）

## Google Cloudへのデプロイ

### 前提条件

1. Google Cloudアカウントの作成
2. [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install)のインストール
3. プロジェクトの作成とBilling（課金）の有効化

### デプロイ方法の選択

#### 推奨: Cloud Run（コンテナベース、サーバーレス）

**メリット:**
- サーバー管理不要
- 自動スケーリング
- 使用した分だけ課金（リクエストがない時は無料）
- 簡単なCI/CD統合

**構成:**
- バックエンド: Cloud Runサービス
- フロントエンド: バックエンドから静的ファイルとして配信、またはCloud Storageでホスティング

### 初期セットアップ

```bash
# Google Cloud CLIの認証
gcloud auth login

# プロジェクトIDを設定（your-project-idは実際のプロジェクトIDに置き換え）
gcloud config set project your-project-id

# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### オプション1: バックエンドとフロントエンドを統合してデプロイ

この方法では、バックエンドがフロントエンドの静的ファイルも配信します。

#### 1. プロジェクト構造の調整

`backend/`ディレクトリに以下を追加：

**backend/Dockerfile:**
```dockerfile
# マルチステージビルド

# フロントエンドのビルド
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# バックエンドのビルド
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# 本番環境イメージ
FROM node:18-alpine
WORKDIR /app

# バックエンドの依存関係とビルド済みコードをコピー
COPY backend/package*.json ./
RUN npm ci --production
COPY --from=backend-build /app/backend/dist ./dist

# フロントエンドのビルド済み静的ファイルをコピー
COPY --from=frontend-build /app/frontend/dist ./public

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

**backend/.dockerignore:**
```
node_modules
npm-debug.log
.env
.git
.gitignore
dist
```

#### 2. バックエンドで静的ファイルを配信する設定

`backend/src/server.ts`に以下を追加：

```typescript
import express from 'express';
import path from 'path';

const app = express();

// APIルート
app.use('/api', apiRoutes);

// 本番環境では静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));

  // すべてのルートでindex.htmlを返す（SPA対応）
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}
```

#### 3. Cloud Runにデプロイ

```bash
# プロジェクトルートで実行
cd backend

# Cloud Buildでイメージをビルド＆プッシュ
gcloud builds submit --tag gcr.io/your-project-id/chatbot

# Cloud Runにデプロイ
gcloud run deploy chatbot \
  --image gcr.io/your-project-id/chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "ANTHROPIC_API_KEY=your_api_key_here" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### オプション2: フロントエンドとバックエンドを別々にデプロイ

#### バックエンド: Cloud Run

**backend/Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "dist/server.js"]
```

```bash
cd backend

# ビルド＆デプロイ
gcloud builds submit --tag gcr.io/your-project-id/chatbot-backend

gcloud run deploy chatbot-backend \
  --image gcr.io/your-project-id/chatbot-backend \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "ANTHROPIC_API_KEY=your_api_key_here"
```

#### フロントエンド: Cloud Storage + Cloud CDN

```bash
cd frontend

# ビルド
npm run build

# Cloud Storageバケットを作成
gsutil mb -l asia-northeast1 gs://your-project-id-chatbot

# 静的ファイルをアップロード
gsutil -m cp -r dist/* gs://your-project-id-chatbot/

# バケットを公開
gsutil iam ch allUsers:objectViewer gs://your-project-id-chatbot

# Webサイトとして設定
gsutil web set -m index.html -e index.html gs://your-project-id-chatbot
```

フロントエンドの`src/api/config.ts`でバックエンドURLを設定：
```typescript
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://chatbot-backend-xxxxx-an.a.run.app'
  : 'http://localhost:3001';
```

### Secret Managerを使用した環境変数の管理（推奨）

APIキーをより安全に管理：

```bash
# Secret Managerを有効化
gcloud services enable secretmanager.googleapis.com

# シークレットを作成
echo -n "your_actual_api_key" | gcloud secrets create anthropic-api-key --data-file=-

# Cloud Runにシークレットを設定してデプロイ
gcloud run deploy chatbot \
  --image gcr.io/your-project-id/chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest"
```

### カスタムドメインの設定

```bash
# ドメインマッピングを作成
gcloud run domain-mappings create --service chatbot --domain chat.yourdomain.com --region asia-northeast1
```

表示された認証レコードをDNS設定に追加してください。

### CI/CD（継続的デプロイ）の設定

#### Cloud Buildを使用した自動デプロイ

**cloudbuild.yaml** をプロジェクトルートに作成：

```yaml
steps:
  # Dockerイメージをビルド
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/chatbot', '-f', 'backend/Dockerfile', '.']

  # Container Registryにプッシュ
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/chatbot']

  # Cloud Runにデプロイ
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'chatbot'
      - '--image'
      - 'gcr.io/$PROJECT_ID/chatbot'
      - '--region'
      - 'asia-northeast1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-secrets'
      - 'ANTHROPIC_API_KEY=anthropic-api-key:latest'

images:
  - 'gcr.io/$PROJECT_ID/chatbot'
```

GitHubリポジトリと連携：

```bash
# Cloud Build トリガーを作成（Webコンソールで設定を推奨）
# または gcloud コマンドで設定
gcloud builds triggers create github \
  --repo-name=your-repo-name \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

### デプロイ後の確認

```bash
# デプロイされたサービスのURLを確認
gcloud run services describe chatbot --region asia-northeast1 --format="value(status.url)"

# ログを確認
gcloud run services logs read chatbot --region asia-northeast1
```

### コスト最適化

- **最小インスタンス数**: デフォルトは0（アクセスがない時はインスタンスなし）
- **最大インスタンス数**: トラフィックに応じて調整（例: `--max-instances 10`）
- **メモリ**: 必要最小限に設定（例: `--memory 512Mi`）
- **タイムアウト**: デフォルト300秒、必要に応じて調整

### トラブルシューティング

```bash
# サービスの詳細を確認
gcloud run services describe chatbot --region asia-northeast1

# リアルタイムログを監視
gcloud run services logs tail chatbot --region asia-northeast1

# リビジョン一覧を確認
gcloud run revisions list --service chatbot --region asia-northeast1
```

## 今後の拡張可能性

将来的に以下の機能を追加する場合の指針：

- **データベース追加**: PostgreSQL/MongoDBで会話履歴を永続化
  - Google Cloud SQL (PostgreSQL/MySQL)
  - Cloud Firestore（NoSQL）
- **認証機能**: JWT、OAuth 2.0、またはAuth0などを使用
  - Firebase Authentication
  - Google Identity Platform
- **ファイルアップロード**: Claude APIのVision機能を活用
  - Cloud Storageでファイル保存
- **ストリーミング**: Server-Sent Events (SSE)でリアルタイム応答
- **マルチモーダル**: 画像、PDF解析機能の追加
- **モニタリング**: Cloud Monitoring、Cloud Loggingでパフォーマンス監視
- **負荷分散**: Cloud Load Balancingで複数リージョン対応
