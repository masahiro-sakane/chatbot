# GitHub Actions用のWorkload Identity Federationセットアップスクリプト (PowerShell版)

$ErrorActionPreference = "Stop"

# 変数設定
$PROJECT_ID = "chatbot-481505"
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
$SERVICE_ACCOUNT_NAME = "github-actions-sa"
$SERVICE_ACCOUNT_EMAIL = "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
$WORKLOAD_IDENTITY_POOL = "github-actions-pool"
$WORKLOAD_IDENTITY_PROVIDER = "github-actions-provider"
$GITHUB_REPO = "masahiro-sakane/chatbot"  # GitHubリポジトリ

Write-Host "=== GitHub Actions Workload Identity Federation セットアップ ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "プロジェクトID: $PROJECT_ID"
Write-Host "プロジェクト番号: $PROJECT_NUMBER"
Write-Host "GitHubリポジトリ: $GITHUB_REPO"
Write-Host ""
$confirmation = Read-Host "GitHubリポジトリ名を確認してください。正しければ 'y' を入力してください"
if ($confirmation -ne 'y') {
    Write-Host "スクリプト内の GITHUB_REPO 変数を修正してから再実行してください" -ForegroundColor Yellow
    exit
}

# 1. サービスアカウントの作成
Write-Host ""
Write-Host "=== 1. サービスアカウントの作成 ===" -ForegroundColor Cyan
try {
    gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID 2>$null
    Write-Host "サービスアカウント $SERVICE_ACCOUNT_EMAIL は既に存在します" -ForegroundColor Yellow
} catch {
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME `
        --project=$PROJECT_ID `
        --display-name="GitHub Actions Service Account" `
        --description="Service account for GitHub Actions to deploy to Cloud Run"
    Write-Host "✓ サービスアカウントを作成しました" -ForegroundColor Green
}

# 2. サービスアカウントに必要な権限を付与
Write-Host ""
Write-Host "=== 2. サービスアカウントに権限を付与 ===" -ForegroundColor Cyan

$roles = @(
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.secretAccessor"
)

foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" `
        --role=$role `
        --condition=None
}

Write-Host "✓ 権限を付与しました" -ForegroundColor Green

# 3. Workload Identity Poolの作成
Write-Host ""
Write-Host "=== 3. Workload Identity Poolの作成 ===" -ForegroundColor Cyan
try {
    gcloud iam workload-identity-pools describe $WORKLOAD_IDENTITY_POOL `
        --project=$PROJECT_ID `
        --location=global 2>$null
    Write-Host "Workload Identity Pool $WORKLOAD_IDENTITY_POOL は既に存在します" -ForegroundColor Yellow
} catch {
    gcloud iam workload-identity-pools create $WORKLOAD_IDENTITY_POOL `
        --project=$PROJECT_ID `
        --location=global `
        --display-name="GitHub Actions Pool" `
        --description="Workload Identity Pool for GitHub Actions"
    Write-Host "✓ Workload Identity Poolを作成しました" -ForegroundColor Green
}

# 4. Workload Identity Providerの作成
Write-Host ""
Write-Host "=== 4. Workload Identity Providerの作成 ===" -ForegroundColor Cyan

$repoOwner = $GITHUB_REPO.Split('/')[0]

try {
    gcloud iam workload-identity-pools providers describe $WORKLOAD_IDENTITY_PROVIDER `
        --project=$PROJECT_ID `
        --location=global `
        --workload-identity-pool=$WORKLOAD_IDENTITY_POOL 2>$null
    Write-Host "Workload Identity Provider $WORKLOAD_IDENTITY_PROVIDER は既に存在します" -ForegroundColor Yellow
} catch {
    gcloud iam workload-identity-pools providers create-oidc $WORKLOAD_IDENTITY_PROVIDER `
        --project=$PROJECT_ID `
        --location=global `
        --workload-identity-pool=$WORKLOAD_IDENTITY_POOL `
        --display-name="GitHub Actions Provider" `
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" `
        --attribute-condition="assertion.repository_owner == '$repoOwner'" `
        --issuer-uri="https://token.actions.githubusercontent.com"
    Write-Host "✓ Workload Identity Providerを作成しました" -ForegroundColor Green
}

# 5. サービスアカウントにWorkload Identity Userロールを付与
Write-Host ""
Write-Host "=== 5. サービスアカウントにWorkload Identity Userロールを付与 ===" -ForegroundColor Cyan
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL `
    --project=$PROJECT_ID `
    --role="roles/iam.workloadIdentityUser" `
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WORKLOAD_IDENTITY_POOL}/attribute.repository/${GITHUB_REPO}"

Write-Host "✓ Workload Identity Userロールを付与しました" -ForegroundColor Green

# 6. GitHub Secretsに設定する値を出力
Write-Host ""
Write-Host "=== 6. GitHub Secretsに設定する値 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHubリポジトリの Settings > Secrets and variables > Actions で以下のSecretsを追加してください：" -ForegroundColor Yellow
Write-Host ""
Write-Host "WIF_PROVIDER:" -ForegroundColor White
Write-Host "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WORKLOAD_IDENTITY_POOL}/providers/${WORKLOAD_IDENTITY_PROVIDER}" -ForegroundColor Green
Write-Host ""
Write-Host "WIF_SERVICE_ACCOUNT:" -ForegroundColor White
Write-Host "${SERVICE_ACCOUNT_EMAIL}" -ForegroundColor Green
Write-Host ""
Write-Host "=== セットアップ完了 ===" -ForegroundColor Cyan
