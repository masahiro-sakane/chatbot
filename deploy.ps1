# Google Cloud Run Deployment Script
# Windows PowerShell script for deploying the chatbot to Google Cloud Run

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$ProjectId = ""
)

function Show-Help {
    Write-Host "Google Cloud Run Deployment Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "使用方法:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 setup <PROJECT_ID>       - 初期セットアップ"
    Write-Host "  .\deploy.ps1 create-secret             - Secret Managerにシークレット作成"
    Write-Host "  .\deploy.ps1 deploy <PROJECT_ID>       - Cloud Runにデプロイ"
    Write-Host "  .\deploy.ps1 logs                      - ログを表示"
    Write-Host "  .\deploy.ps1 url                       - デプロイ済みURLを表示"
    Write-Host "  .\deploy.ps1 delete                    - サービスを削除"
    Write-Host ""
    Write-Host "例:" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 setup chatbot-app-123456"
    Write-Host "  .\deploy.ps1 create-secret"
    Write-Host "  .\deploy.ps1 deploy chatbot-app-123456"
}

function Setup-GCloud {
    param([string]$ProjectId)

    if (-not $ProjectId) {
        Write-Host "エラー: PROJECT_IDを指定してください" -ForegroundColor Red
        Write-Host "例: .\deploy.ps1 setup chatbot-app-123456"
        return
    }

    Write-Host "=== Google Cloud初期セットアップ ===" -ForegroundColor Green

    # プロジェクトの設定
    Write-Host "プロジェクトを設定中..." -ForegroundColor Yellow
    gcloud config set project $ProjectId

    # リージョンの設定
    Write-Host "リージョンを設定中（東京: asia-northeast1）..." -ForegroundColor Yellow
    gcloud config set run/region asia-northeast1

    # APIの有効化
    Write-Host "必要なAPIを有効化中..." -ForegroundColor Yellow
    gcloud services enable run.googleapis.com `
        containerregistry.googleapis.com `
        cloudbuild.googleapis.com `
        secretmanager.googleapis.com `
        artifactregistry.googleapis.com

    # Artifact Registryリポジトリの作成
    Write-Host "Artifact Registryリポジトリを作成中..." -ForegroundColor Yellow
    gcloud artifacts repositories create chatbot-repo `
        --repository-format=docker `
        --location=asia-northeast1 `
        --description="Chatbot Docker repository" 2>$null

    Write-Host ""
    Write-Host "=== セットアップ完了 ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "次のステップ:" -ForegroundColor Cyan
    Write-Host "1. .\deploy.ps1 create-secret  # APIキーをSecret Managerに保存"
    Write-Host "2. .\deploy.ps1 deploy $ProjectId  # Cloud Runにデプロイ"
}

function Create-Secret {
    Write-Host "=== Secret Managerにシークレットを作成 ===" -ForegroundColor Green

    # APIキーの入力
    $apiKey = Read-Host -Prompt "ANTHROPIC_API_KEYを入力してください"

    if (-not $apiKey) {
        Write-Host "エラー: APIキーが入力されませんでした" -ForegroundColor Red
        return
    }

    # シークレットの作成
    Write-Host "シークレットを作成中..." -ForegroundColor Yellow
    echo -n $apiKey | gcloud secrets create anthropic-api-key `
        --data-file=- `
        --replication-policy="automatic" 2>$null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "シークレットは既に存在します。更新します..." -ForegroundColor Yellow
        echo -n $apiKey | gcloud secrets versions add anthropic-api-key --data-file=-
    }

    # IAM権限の付与
    Write-Host "IAM権限を設定中..." -ForegroundColor Yellow
    $projectNumber = (gcloud projects describe (gcloud config get-value project) --format="value(projectNumber)")
    gcloud secrets add-iam-policy-binding anthropic-api-key `
        --member="serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com" `
        --role="roles/secretmanager.secretAccessor" 2>$null

    Write-Host ""
    Write-Host "=== シークレット作成完了 ===" -ForegroundColor Green
}

function Deploy-CloudRun {
    param([string]$ProjectId)

    if (-not $ProjectId) {
        Write-Host "エラー: PROJECT_IDを指定してください" -ForegroundColor Red
        Write-Host "例: .\deploy.ps1 deploy chatbot-app-123456"
        return
    }

    Write-Host "=== Cloud Runにデプロイ中 ===" -ForegroundColor Green
    Write-Host "これには数分かかる場合があります..."
    Write-Host ""

    gcloud run deploy chatbot `
        --source . `
        --platform managed `
        --region asia-northeast1 `
        --allow-unauthenticated `
        --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest `
        --memory 512Mi `
        --cpu 1 `
        --timeout 60 `
        --min-instances 0 `
        --max-instances 10 `
        --port 3001

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== デプロイ完了 ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "URLを確認:" -ForegroundColor Cyan
        Write-Host "  .\deploy.ps1 url"
        Write-Host ""
        Write-Host "ログを確認:" -ForegroundColor Cyan
        Write-Host "  .\deploy.ps1 logs"
    } else {
        Write-Host ""
        Write-Host "=== デプロイ失敗 ===" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "=== Cloud Runログ ===" -ForegroundColor Cyan
    Write-Host "Ctrl+C で終了"
    Write-Host ""
    gcloud run services logs tail chatbot --region asia-northeast1
}

function Show-Url {
    Write-Host "=== デプロイ済みURL ===" -ForegroundColor Cyan
    $url = gcloud run services describe chatbot `
        --region asia-northeast1 `
        --format="value(status.url)" 2>$null

    if ($url) {
        Write-Host $url -ForegroundColor Green
    } else {
        Write-Host "サービスが見つかりません。先にデプロイしてください。" -ForegroundColor Yellow
    }
}

function Delete-Service {
    Write-Host "=== Cloud Runサービスを削除 ===" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "本当に削除しますか? (yes/no)"

    if ($confirm -eq "yes") {
        gcloud run services delete chatbot --region asia-northeast1 --quiet
        Write-Host ""
        Write-Host "=== サービス削除完了 ===" -ForegroundColor Green
    } else {
        Write-Host "キャンセルしました" -ForegroundColor Yellow
    }
}

# コマンド実行
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "setup" { Setup-GCloud -ProjectId $ProjectId }
    "create-secret" { Create-Secret }
    "deploy" { Deploy-CloudRun -ProjectId $ProjectId }
    "logs" { Show-Logs }
    "url" { Show-Url }
    "delete" { Delete-Service }
    default {
        Write-Host "不明なコマンド: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
