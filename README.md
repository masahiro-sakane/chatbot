# AIチャットボット

Claude API (Anthropic)を使用した汎用的な会話ボットのWebアプリケーション。

## 概要

このプロジェクトは、React + TypeScriptのフロントエンドとNode.js + TypeScriptのバックエンドで構成されたAIチャットボットアプリケーションです。Claude APIを使用して、ユーザーと自然な対話を提供します。

## 技術スタック

### フロントエンド
- React 18+ with TypeScript
- Vite（ビルドツール）
- Axios（HTTP通信）

### バックエンド
- Node.js 18+ with TypeScript
- Express（Webフレームワーク）
- Anthropic SDK（Claude API）

### インフラ
- Google Cloud Run（デプロイ）
- Docker（コンテナ化）

## 主な機能

- リアルタイムチャット機能
- セッション単位での会話コンテキスト保持
- シンプルで使いやすいUI

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または pnpm
- Anthropic APIキー

### インストール手順

#### 方法1: スクリプトを使用（推奨）

**Windows環境:**
```powershell
# 初期セットアップ（依存関係インストール + .env作成）
.\scripts.ps1 setup

# backend\.env にANTHROPIC_API_KEYを設定してください
```

**Linux/Mac環境:**
```bash
# 初期セットアップ
make setup

# backend/.env にANTHROPIC_API_KEYを設定してください
```

#### 方法2: 手動セットアップ

1. リポジトリをクローン
```bash
git clone <repository-url>
cd chatbot
```

2. バックエンドのセットアップ
```bash
cd backend
npm install
cp .env.example .env
# .envファイルにANTHROPIC_API_KEYを設定
```

3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
```

## 開発

### スクリプトを使用した開発（推奨）

**Windows環境:**

2つのターミナルを開いて、それぞれで以下を実行：

```powershell
# ターミナル1: バックエンド起動
.\scripts.ps1 dev-backend

# ターミナル2: フロントエンド起動
.\scripts.ps1 dev-frontend
```

**Linux/Mac環境:**

```bash
# ターミナル1: バックエンド起動
make dev-backend

# ターミナル2: フロントエンド起動
make dev-frontend
```

### 手動での開発サーバー起動

#### バックエンドの起動

```bash
cd backend
npm run dev
```

サーバーは http://localhost:3001 で起動します。

#### フロントエンドの起動

```bash
cd frontend
npm run dev
```

アプリケーションは http://localhost:5173 で起動します。

## ビルド

### スクリプトを使用（推奨）

**Windows:**
```powershell
# 全体をビルド
.\scripts.ps1 build

# バックエンドのみ
.\scripts.ps1 build-backend

# フロントエンドのみ
.\scripts.ps1 build-frontend
```

**Linux/Mac:**
```bash
# 全体をビルド
make build

# バックエンドのみ
make build-backend

# フロントエンドのみ
make build-frontend
```

### 手動ビルド

#### バックエンド

```bash
cd backend
npm run build
npm start
```

#### フロントエンド

```bash
cd frontend
npm run build
```

## Docker

### Dockerでの実行

**Docker Composeを使用（推奨）:**
```bash
# .envファイルにANTHROPIC_API_KEYを設定してから実行
docker-compose up --build
```

**PowerShellスクリプトを使用:**
```powershell
# Dockerイメージのビルド
.\scripts.ps1 docker-build

# コンテナの起動
.\scripts.ps1 docker-run

# ログの確認
.\scripts.ps1 docker-logs

# 停止
.\scripts.ps1 docker-stop
```

詳細は `DOCKER.md` を参照してください。

## デプロイ

### Google Cloud Run

Google Cloud Runへのデプロイ手順については、`CLAUDE.md` および `DOCKER.md` を参照してください。

**クイックデプロイ:**
```bash
gcloud run deploy chatbot \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=YOUR_API_KEY
```

## スクリプトコマンド一覧

### Windows (PowerShell)

**開発コマンド:**
```powershell
.\scripts.ps1 help          # ヘルプを表示
.\scripts.ps1 setup         # 初期セットアップ
.\scripts.ps1 install       # 依存関係のインストール
.\scripts.ps1 dev-backend   # バックエンド起動
.\scripts.ps1 dev-frontend  # フロントエンド起動
.\scripts.ps1 check-env     # 環境変数ファイルの確認
```

**ビルドコマンド:**
```powershell
.\scripts.ps1 build         # プロダクションビルド
.\scripts.ps1 build-backend # バックエンドのみビルド
.\scripts.ps1 build-frontend # フロントエンドのみビルド
.\scripts.ps1 clean         # ビルド成果物削除
.\scripts.ps1 clean-all     # node_modulesも含めて削除
```

**Dockerコマンド:**
```powershell
.\scripts.ps1 docker-build  # Dockerイメージをビルド
.\scripts.ps1 docker-run    # Dockerコンテナを起動
.\scripts.ps1 docker-stop   # Dockerコンテナを停止
.\scripts.ps1 docker-logs   # Dockerコンテナのログを表示
.\scripts.ps1 docker-clean  # Dockerコンテナとイメージを削除
```

### Linux/Mac (Makefile)

```bash
make help               # ヘルプを表示
make setup              # 初期セットアップ
make install            # 依存関係のインストール
make dev-backend        # バックエンド起動
make dev-frontend       # フロントエンド起動
make build              # プロダクションビルド
make clean              # ビルド成果物削除
make check-env          # 環境変数ファイルの確認
make deploy             # Google Cloud Runにデプロイ
```

## プロジェクト構造

```
chatbot/
├── frontend/          # Reactフロントエンド
├── backend/           # Node.jsバックエンド
├── CLAUDE.md          # プロジェクト詳細仕様
├── TODO.md            # 実装計画
├── Makefile           # Linux/Mac用スクリプト
├── scripts.ps1        # Windows用PowerShellスクリプト
└── README.md          # このファイル
```

## ドキュメント

- [CLAUDE.md](./CLAUDE.md) - プロジェクトの詳細仕様とアーキテクチャ
- [TODO.md](./TODO.md) - 実装計画とタスクリスト

## ライセンス

MIT

## 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissueを作成してください。
