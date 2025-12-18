# Docker デプロイガイド

このドキュメントでは、AIチャットボットアプリケーションをDockerを使用してビルド・デプロイする方法を説明します。

## 前提条件

- Docker がインストールされていること
- Docker Compose がインストールされていること（オプション）
- ANTHROPIC_API_KEY が取得済みであること

## ローカルでのDockerビルドとテスト

### 方法1: Docker Composeを使用（推奨）

最も簡単な方法は、Docker Composeを使用することです。

1. **環境変数の設定**

   プロジェクトルートに `.env` ファイルを作成：
   ```bash
   # .env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **ビルドと起動**

   ```bash
   docker-compose up --build
   ```

3. **アクセス**

   ブラウザで http://localhost:3001 にアクセス

4. **停止**

   ```bash
   docker-compose down
   ```

### 方法2: Dockerコマンドを直接使用

1. **Dockerイメージのビルド**

   ```bash
   docker build -t chatbot:latest .
   ```

2. **コンテナの起動**

   ```bash
   docker run -d \
     -p 3001:3001 \
     -e ANTHROPIC_API_KEY=your_api_key_here \
     -e NODE_ENV=production \
     --name chatbot \
     chatbot:latest
   ```

3. **ログの確認**

   ```bash
   docker logs -f chatbot
   ```

4. **ヘルスチェック**

   ```bash
   curl http://localhost:3001/api/health
   ```

5. **コンテナの停止と削除**

   ```bash
   docker stop chatbot
   docker rm chatbot
   ```

## PowerShellスクリプトでのビルド

Windows環境では、`scripts.ps1` にDockerコマンドを追加できます：

```powershell
# Dockerイメージのビルド
.\scripts.ps1 docker-build

# Dockerコンテナの起動
.\scripts.ps1 docker-run

# Dockerコンテナの停止
.\scripts.ps1 docker-stop
```

## トラブルシューティング

### ビルドエラー

**エラー: `npm ci` が失敗する**

- `package-lock.json` が最新であることを確認
- `node_modules` を削除して再試行

**エラー: フロントエンドのビルドが失敗**

- フロントエンドディレクトリで `npm run build` を手動実行してエラーを確認

### 実行時エラー

**エラー: `ANTHROPIC_API_KEY is not set`**

- 環境変数が正しく設定されているか確認
- `.env` ファイルの内容を確認

**エラー: ポート3001が使用中**

```bash
# Windowsの場合
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Linux/Macの場合
lsof -ti:3001 | xargs kill
```

## Dockerイメージの最適化

現在のDockerイメージサイズを確認：

```bash
docker images chatbot
```

### イメージサイズの削減方法

1. **node_modulesの最適化**: 本番環境に不要なdevDependenciesを削除
2. **Alpine Linuxの使用**: 既に使用中（`node:18-alpine`）
3. **マルチステージビルド**: 既に実装済み

## Google Cloud Runへのデプロイ

### 方法1: gcloud builds submit を使用

```bash
# プロジェクトIDを設定
gcloud config set project YOUR_PROJECT_ID

# イメージをビルドしてContainer Registryにプッシュ
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/chatbot

# Cloud Runにデプロイ
gcloud run deploy chatbot \
  --image gcr.io/YOUR_PROJECT_ID/chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=YOUR_API_KEY
```

### 方法2: Cloud Run から直接ビルド

```bash
gcloud run deploy chatbot \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=YOUR_API_KEY
```

### Secret Managerを使用（推奨）

1. **シークレットを作成**

   ```bash
   echo -n "your_api_key" | gcloud secrets create anthropic-api-key --data-file=-
   ```

2. **Cloud Runにデプロイ（シークレット使用）**

   ```bash
   gcloud run deploy chatbot \
     --source . \
     --platform managed \
     --region asia-northeast1 \
     --allow-unauthenticated \
     --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
   ```

## セキュリティのベストプラクティス

1. **APIキーの保護**
   - 環境変数やSecret Managerを使用
   - `.env` ファイルをGitにコミットしない

2. **非rootユーザーの使用**
   - Dockerfileで既に実装済み（ユーザー `nodejs`）

3. **セキュリティヘッダー**
   - Helmet.jsを使用（本番環境で自動有効化）

4. **ヘルスチェック**
   - Docker内でヘルスチェックが設定済み
   - `/api/health` エンドポイントを使用

## モニタリング

### ログの確認

**Docker:**
```bash
docker logs -f chatbot
```

**Google Cloud Run:**
```bash
gcloud run services logs read chatbot --region asia-northeast1
```

### メトリクスの確認

**Google Cloud Run:**
- Google Cloud Consoleでメトリクスを確認
- CPU使用率、メモリ使用率、リクエスト数など

## 参考資料

- [Docker Documentation](https://docs.docker.com/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Node.js Best Practices for Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
