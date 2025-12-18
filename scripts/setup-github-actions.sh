#!/bin/bash
# GitHub Actions用のWorkload Identity Federationセットアップスクリプト

set -e

# 変数設定
PROJECT_ID="chatbot-481505"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT_NAME="github-actions-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
WORKLOAD_IDENTITY_POOL="github-actions-pool"
WORKLOAD_IDENTITY_PROVIDER="github-actions-provider"
GITHUB_REPO="YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"  # 例: "octocat/my-repo"

echo "=== GitHub Actions Workload Identity Federation セットアップ ==="
echo ""
echo "プロジェクトID: $PROJECT_ID"
echo "プロジェクト番号: $PROJECT_NUMBER"
echo "GitHubリポジトリ: $GITHUB_REPO"
echo ""
read -p "GitHubリポジトリ名を確認してください。正しければEnterを押してください (修正する場合はCtrl+Cで中断): "

# 1. サービスアカウントの作成
echo ""
echo "=== 1. サービスアカウントの作成 ==="
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID 2>/dev/null; then
  echo "サービスアカウント $SERVICE_ACCOUNT_EMAIL は既に存在します"
else
  gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --project=$PROJECT_ID \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for GitHub Actions to deploy to Cloud Run"
  echo "✓ サービスアカウントを作成しました"
fi

# 2. サービスアカウントに必要な権限を付与
echo ""
echo "=== 2. サービスアカウントに権限を付与 ==="
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

echo "✓ 権限を付与しました"

# 3. Workload Identity Poolの作成
echo ""
echo "=== 3. Workload Identity Poolの作成 ==="
if gcloud iam workload-identity-pools describe $WORKLOAD_IDENTITY_POOL \
    --project=$PROJECT_ID \
    --location=global 2>/dev/null; then
  echo "Workload Identity Pool $WORKLOAD_IDENTITY_POOL は既に存在します"
else
  gcloud iam workload-identity-pools create $WORKLOAD_IDENTITY_POOL \
    --project=$PROJECT_ID \
    --location=global \
    --display-name="GitHub Actions Pool" \
    --description="Workload Identity Pool for GitHub Actions"
  echo "✓ Workload Identity Poolを作成しました"
fi

# 4. Workload Identity Providerの作成
echo ""
echo "=== 4. Workload Identity Providerの作成 ==="
if gcloud iam workload-identity-pools providers describe $WORKLOAD_IDENTITY_PROVIDER \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=$WORKLOAD_IDENTITY_POOL 2>/dev/null; then
  echo "Workload Identity Provider $WORKLOAD_IDENTITY_PROVIDER は既に存在します"
else
  gcloud iam workload-identity-pools providers create-oidc $WORKLOAD_IDENTITY_PROVIDER \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
    --display-name="GitHub Actions Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == '$(echo $GITHUB_REPO | cut -d'/' -f1)'" \
    --issuer-uri="https://token.actions.githubusercontent.com"
  echo "✓ Workload Identity Providerを作成しました"
fi

# 5. サービスアカウントにWorkload Identity Userロールを付与
echo ""
echo "=== 5. サービスアカウントにWorkload Identity Userロールを付与 ==="
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WORKLOAD_IDENTITY_POOL}/attribute.repository/${GITHUB_REPO}"

echo "✓ Workload Identity Userロールを付与しました"

# 6. GitHub Secretsに設定する値を出力
echo ""
echo "=== 6. GitHub Secretsに設定する値 ==="
echo ""
echo "GitHubリポジトリの Settings > Secrets and variables > Actions で以下のSecretsを追加してください："
echo ""
echo "WIF_PROVIDER:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WORKLOAD_IDENTITY_POOL}/providers/${WORKLOAD_IDENTITY_PROVIDER}"
echo ""
echo "WIF_SERVICE_ACCOUNT:"
echo "${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "=== セットアップ完了 ==="
