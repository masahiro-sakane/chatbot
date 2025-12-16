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

### バックエンドの起動

```bash
cd backend
npm run dev
```

サーバーは http://localhost:3001 で起動します。

### フロントエンドの起動

```bash
cd frontend
npm run dev
```

アプリケーションは http://localhost:5173 で起動します。

## ビルド

### バックエンド

```bash
cd backend
npm run build
npm start
```

### フロントエンド

```bash
cd frontend
npm run build
```

## デプロイ

Google Cloud Runへのデプロイ手順については、`CLAUDE.md`を参照してください。

## プロジェクト構造

```
chatbot/
├── frontend/          # Reactフロントエンド
├── backend/           # Node.jsバックエンド
├── CLAUDE.md          # プロジェクト詳細仕様
├── TODO.md            # 実装計画
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
