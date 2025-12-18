# GitHub Actions による自動デプロイ設定ガイド

このガイドでは、GitHub Actionsを使用してGoogle Cloud Runへ自動デプロイする設定方法を説明します。

## 目次

1. [前提条件](#前提条件)
2. [セットアップ手順](#セットアップ手順)
3. [GitHub Secretsの設定](#github-secretsの設定)
4. [デプロイの実行](#デプロイの実行)
5. [トラブルシューティング](#トラブルシューティング)

## 前提条件

- Google Cloudプロジェクト（`chatbot-481505`）が作成済み
- GitHubリポジトリが作成済み
- Google Cloud CLIがインストール済み
- 必要なGoogle Cloud APIが有効化済み：
  - Cloud Run API
  - Artifact Registry API
  - Secret Manager API
  - IAM Credentials API

## セットアップ手順

### 1. Google Cloudリソースの準備

まず、必要なリソースを作成します：

```bash
# Artifact Registryリポジトリの作成
gcloud artifacts repositories create chatbot-repo \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Docker repository for chatbot application"

# Secret Managerにシークレットを作成
echo -n "your_anthropic_api_key" | gcloud secrets create anthropic-api-key --data-file=-

# Compute Engine デフォルトサービスアカウントにSecret Managerへのアクセス権を付与
PROJECT_NUMBER=$(gcloud projects describe chatbot-481505 --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. Workload Identity Federationのセットアップ

GitHub ActionsからGoogle Cloudへ安全に認証するため、Workload Identity Federationを使用します。

#### Windows (PowerShell)

```powershell
# スクリプト内のGITHUB_REPO変数を編集
# 例: "your-username/chatbot"
notepad scripts\setup-github-actions.ps1

# スクリプトを実行
.\scripts\setup-github-actions.ps1
```

#### Linux / macOS (Bash)

```bash
# スクリプト内のGITHUB_REPO変数を編集
# 例: "your-username/chatbot"
nano scripts/setup-github-actions.sh

# 実行権限を付与
chmod +x scripts/setup-github-actions.sh

# スクリプトを実行
./scripts/setup-github-actions.sh
```

スクリプトは以下の処理を自動的に実行します：

1. **サービスアカウントの作成**: `github-actions-sa@chatbot-481505.iam.gserviceaccount.com`
2. **権限の付与**:
   - `roles/run.admin` - Cloud Runサービスのデプロイ
   - `roles/artifactregistry.writer` - Dockerイメージのプッシュ
   - `roles/iam.serviceAccountUser` - サービスアカウントの使用
   - `roles/secretmanager.secretAccessor` - シークレットへのアクセス
3. **Workload Identity Poolの作成**: GitHub Actions用の認証プール
4. **Workload Identity Providerの作成**: GitHubからの認証を受け入れる設定

### 3. GitHub Secretsの設定

セットアップスクリプトが出力する以下の値をGitHubリポジトリに設定します。

1. GitHubリポジトリの **Settings** > **Secrets and variables** > **Actions** に移動
2. **New repository secret** をクリック
3. 以下の2つのSecretを追加：

#### WIF_PROVIDER

```
projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

#### WIF_SERVICE_ACCOUNT

```
github-actions-sa@chatbot-481505.iam.gserviceaccount.com
```

## デプロイの実行

### 自動デプロイ

`main` または `master` ブランチにプッシュすると、自動的にデプロイが実行されます：

```bash
git add .
git commit -m "Deploy to Cloud Run"
git push origin main
```

### 手動デプロイ

GitHubリポジトリの **Actions** タブから手動でデプロイを実行できます：

1. **Actions** タブを開く
2. **Deploy to Cloud Run** ワークフローを選択
3. **Run workflow** をクリック
4. ブランチを選択して **Run workflow** を実行

## ワークフローの詳細

`.github/workflows/deploy.yml` は以下の処理を実行します：

1. **コードのチェックアウト**: リポジトリのコードを取得
2. **Google Cloudへの認証**: Workload Identity Federationを使用
3. **Dockerイメージのビルド**: マルチステージビルドでフロントエンドとバックエンドをビルド
4. **Artifact Registryへのプッシュ**: ビルドしたイメージを保存
5. **Cloud Runへのデプロイ**: 新しいイメージでサービスを更新

## デプロイ後の確認

デプロイが成功すると、GitHub Actionsのログに以下のような出力が表示されます：

```
Service URL: https://chatbot-xxxxx-an.a.run.app
```

このURLにアクセスして、アプリケーションが正常に動作していることを確認してください。

## トラブルシューティング

### デプロイが失敗する場合

#### 1. 権限エラー

```
ERROR: Permission denied on secret: projects/.../secrets/anthropic-api-key
```

**解決方法**: サービスアカウントに正しい権限が付与されているか確認

```bash
# Secret Managerへのアクセス権を確認
gcloud secrets get-iam-policy anthropic-api-key
```

#### 2. Artifact Registryエラー

```
ERROR: unauthorized: You don't have the needed permissions
```

**解決方法**: サービスアカウントにArtifact Registry Writer権限があるか確認

```bash
gcloud projects get-iam-policy chatbot-481505 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-sa@chatbot-481505.iam.gserviceaccount.com"
```

#### 3. Workload Identity認証エラー

```
ERROR: Failed to generate Google Cloud access token
```

**解決方法**:
1. GitHub Secretsが正しく設定されているか確認
2. Workload Identity PoolとProviderが正しく作成されているか確認

```bash
# Workload Identity Poolの確認
gcloud iam workload-identity-pools list --location=global

# Workload Identity Providerの確認
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=github-actions-pool \
  --location=global
```

### ログの確認

GitHub Actionsのログは以下から確認できます：

1. GitHubリポジトリの **Actions** タブ
2. 失敗したワークフローをクリック
3. 各ステップの詳細ログを確認

Cloud Runのログも確認できます：

```bash
gcloud run services logs read chatbot --region asia-northeast1 --limit 50
```

## セキュリティのベストプラクティス

1. **最小権限の原則**: サービスアカウントには必要最小限の権限のみを付与
2. **シークレットの管理**: APIキーなどの機密情報は必ずSecret Managerで管理
3. **リポジトリの制限**: Workload Identity Providerは特定のGitHubリポジトリからのみアクセスを許可
4. **ブランチ保護**: `main`/`master`ブランチにはブランチ保護ルールを設定

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/en/actions)
- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run公式ドキュメント](https://cloud.google.com/run/docs)
