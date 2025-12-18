# Google Cloud Run デプロイガイド

このドキュメントでは、AIチャットボットをGoogle Cloud Runにデプロイする完全な手順を説明します。

## 前提条件

- Googleアカウント
- クレジットカード（無料トライアル or 通常の課金アカウント）
- gcloud CLI がインストール済み
- ANTHROPIC_API_KEY を取得済み

## 推定コスト

Google Cloud Runは従量課金制です：

- **無料枠**: 月2百万リクエスト、36万GB秒のメモリ、18万vCPU秒
- **想定コスト**: 軽度の使用で月$0-5程度
- **詳細**: https://cloud.google.com/run/pricing

## ステップ1: Google Cloud初期セットアップ

### 1.1 Google Cloudプロジェクトの作成

1. **Google Cloud Consoleにアクセス**: https://console.cloud.google.com/

2. **新しいプロジェクトを作成**:
   ```bash
   gcloud projects create chatbot-app-[YOUR-UNIQUE-ID] --name="AI Chatbot"
   ```

   または、Consoleから:
   - 「プロジェクトを選択」→「新しいプロジェクト」をクリック
   - プロジェクト名: `AI Chatbot`
   - プロジェクトID: `chatbot-app-[YOUR-UNIQUE-ID]` （グローバルにユニークである必要があります）

3. **Billingを有効化**:
   - Console → 「お支払い」→ 「請求先アカウントをリンク」
   - クレジットカード情報を登録

### 1.2 gcloud CLIのセットアップ

1. **gcloud CLIのインストール**（未インストールの場合）:
   - Windows: https://cloud.google.com/sdk/docs/install#windows
   - Mac: `brew install google-cloud-sdk`
   - Linux: https://cloud.google.com/sdk/docs/install#linux

2. **認証**:
   ```bash
   gcloud auth login
   ```

3. **プロジェクトを設定**:
   ```bash
   gcloud config set project chatbot-app-[YOUR-UNIQUE-ID]
   ```

4. **デフォルトリージョンを設定**（東京リージョン推奨）:
   ```bash
   gcloud config set run/region asia-northeast1
   ```

### 1.3 必要なAPIの有効化

```bash
# Cloud Run API
gcloud services enable run.googleapis.com

# Container Registry API (イメージ保存用)
gcloud services enable containerregistry.googleapis.com

# Cloud Build API（ビルド用）
gcloud services enable cloudbuild.googleapis.com

# Secret Manager API（APIキー管理用）
gcloud services enable secretmanager.googleapis.com

# Artifact Registry API（推奨の新しいレジストリ）
gcloud services enable artifactregistry.googleapis.com
```

または一括で:
```bash
gcloud services enable run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

## ステップ2: Secret Managerでのシークレット管理

APIキーなどの機密情報はSecret Managerで安全に管理します。

### 2.1 Anthropic API Keyをシークレットとして作成

```bash
# シークレットの作成と値の設定
echo -n "your-actual-anthropic-api-key" | \
  gcloud secrets create anthropic-api-key \
  --data-file=- \
  --replication-policy="automatic"
```

### 2.2 シークレットの確認

```bash
# シークレット一覧を表示
gcloud secrets list

# シークレットの詳細を表示
gcloud secrets describe anthropic-api-key
```

### 2.3 Cloud Runサービスアカウントに権限を付与

```bash
# プロジェクト番号を取得
PROJECT_NUMBER=$(gcloud projects describe chatbot-app-[YOUR-UNIQUE-ID] --format="value(projectNumber)")

# Secret Managerへのアクセス権を付与
gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## ステップ3: Cloud Runへのデプロイ

### 方法1: ソースから直接デプロイ（推奨・最も簡単）

```bash
cd /path/to/chatbot

# Cloud RunがソースコードからビルドしてデプロイUse context7
gcloud run deploy chatbot \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --min-instances 0 \
  --max-instances 10
```

**オプション説明**:
- `--source .`: カレントディレクトリのDockerfileを使用
- `--allow-unauthenticated`: 認証なしでアクセス可能（パブリックアプリの場合）
- `--set-secrets`: Secret Managerからシークレットを取得
- `--memory 512Mi`: メモリ割り当て（必要に応じて調整）
- `--cpu 1`: CPU割り当て
- `--timeout 60`: リクエストタイムアウト（秒）
- `--min-instances 0`: 最小インスタンス数（0=完全にスケールダウン）
- `--max-instances 10`: 最大インスタンス数

### 方法2: Container Registryを使用

```bash
# 1. イメージをビルドしてContainer Registryにプッシュ
gcloud builds submit --tag gcr.io/chatbot-app-[YOUR-UNIQUE-ID]/chatbot

# 2. Cloud Runにデプロイ
gcloud run deploy chatbot \
  --image gcr.io/chatbot-app-[YOUR-UNIQUE-ID]/chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

### 方法3: Artifact Registryを使用（推奨の新しい方法）

```bash
# 1. Artifact Registryリポジトリを作成
gcloud artifacts repositories create chatbot-repo \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Chatbot Docker repository"

# 2. Dockerの認証設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# 3. イメージをビルド
docker build -t asia-northeast1-docker.pkg.dev/chatbot-app-[YOUR-UNIQUE-ID]/chatbot-repo/chatbot:latest .

# 4. イメージをプッシュ
docker push asia-northeast1-docker.pkg.dev/chatbot-app-[YOUR-UNIQUE-ID]/chatbot-repo/chatbot:latest

# 5. Cloud Runにデプロイ
gcloud run deploy chatbot \
  --image asia-northeast1-docker.pkg.dev/chatbot-app-[YOUR-UNIQUE-ID]/chatbot-repo/chatbot:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

## ステップ4: デプロイの確認

### 4.1 デプロイされたURLの取得

```bash
gcloud run services describe chatbot \
  --region asia-northeast1 \
  --format="value(status.url)"
```

### 4.2 アプリケーションへのアクセス

表示されたURL（例: `https://chatbot-xxxxx-an.a.run.app`）にブラウザでアクセス

### 4.3 ログの確認

```bash
# リアルタイムでログを表示
gcloud run services logs tail chatbot --region asia-northeast1

# 過去のログを表示
gcloud run services logs read chatbot --region asia-northeast1 --limit 50
```

### 4.4 サービスの詳細確認

```bash
gcloud run services describe chatbot --region asia-northeast1
```

## ステップ5: CI/CD の設定（オプション）

### 5.1 GitHubリポジトリの準備

```bash
# Gitリポジトリを初期化（未作成の場合）
git init
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git remote add origin https://github.com/your-username/chatbot.git
git branch -M main
git push -u origin main
```

### 5.2 Cloud Build Triggerの作成

**Consoleから**:
1. Cloud Console → Cloud Build → トリガー
2. 「トリガーを作成」をクリック
3. 設定:
   - 名前: `deploy-chatbot`
   - イベント: `ブランチにプッシュ`
   - ソース: GitHubリポジトリを接続
   - ブランチ: `^main$`
   - 構成: `Cloud Build 構成ファイル（yaml または json）`
   - 場所: `/cloudbuild.yaml`

**gcloudコマンドから**:
```bash
gcloud builds triggers create github \
  --repo-name=chatbot \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --region=asia-northeast1
```

### 5.3 自動デプロイのテスト

```bash
# コードを変更してプッシュ
git add .
git commit -m "Test auto deployment"
git push

# ビルドの状況を確認
gcloud builds list --region=asia-northeast1 --limit=5
```

## ステップ6: カスタムドメインの設定（オプション）

### 6.1 ドメインの検証

1. Cloud Console → Cloud Run → サービスを選択
2. 「カスタム ドメインを管理」をクリック
3. 「ドメインを追加」
4. ドメインの所有権を確認（DNSレコードまたはHTMLファイル）

### 6.2 ドメインマッピング

```bash
gcloud run domain-mappings create \
  --service chatbot \
  --domain chat.yourdomain.com \
  --region asia-northeast1
```

### 6.3 DNSレコードの設定

表示されたCNAMEレコードをドメインのDNS設定に追加:
```
chat.yourdomain.com. CNAME ghs.googlehosted.com.
```

## トラブルシューティング

### デプロイエラー

**エラー: "Billing account not found"**
- Billingアカウントを有効化していない
- プロジェクトにBillingアカウントがリンクされていない

**エラー: "Permission denied"**
- 必要なAPIが有効化されていない
- IAM権限が不足している

**エラー: "Container failed to start"**
- ログを確認: `gcloud run services logs read chatbot`
- ポート設定を確認（Dockerfileで`EXPOSE 3001`を確認）
- ヘルスチェックエンドポイント（`/api/health`）が機能しているか確認

### 実行時エラー

**エラー: "ANTHROPIC_API_KEY is not set"**
- Secret Managerの設定を確認
- IAMポリシーを確認
- シークレット名が正しいか確認

**アプリケーションが遅い**
- メモリ/CPUリソースを増やす
- 最小インスタンス数を増やす（コールドスタートを回避）
```bash
gcloud run services update chatbot \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --region asia-northeast1
```

## コスト最適化

### 1. 最小インスタンス数

```bash
# コールドスタートを許容してコスト削減
gcloud run services update chatbot --min-instances 0
```

### 2. リソース最適化

```bash
# 必要最小限のリソースに設定
gcloud run services update chatbot \
  --memory 256Mi \
  --cpu 1
```

### 3. タイムアウト設定

```bash
# 長時間実行を防ぐ
gcloud run services update chatbot --timeout 30
```

### 4. リクエスト並行性

```bash
# 1インスタンスで複数リクエストを処理
gcloud run services update chatbot --concurrency 80
```

## モニタリング

### Cloud Consoleでのモニタリング

1. Cloud Console → Cloud Run → サービス「chatbot」を選択
2. 「メトリクス」タブでリクエスト数、レイテンシ、エラー率などを確認

### アラートの設定

```bash
# CPU使用率が80%を超えたらアラート
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Chatbot High CPU" \
  --condition-display-name="CPU > 80%" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=60s
```

## 削除（クリーンアップ）

### サービスの削除

```bash
gcloud run services delete chatbot --region asia-northeast1
```

### シークレットの削除

```bash
gcloud secrets delete anthropic-api-key
```

### プロジェクトの削除（全てのリソースを削除）

```bash
gcloud projects delete chatbot-app-[YOUR-UNIQUE-ID]
```

## 参考リンク

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
