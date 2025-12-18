# AIチャットボット - Makefile
# Node.js + TypeScript + React + Claude API

.PHONY: help install dev build clean deploy

# デフォルトターゲット: ヘルプを表示
help:
	@echo "利用可能なコマンド:"
	@echo "  make install        - 依存関係をインストール（初期化）"
	@echo "  make dev            - 開発サーバーを起動（frontend + backend）"
	@echo "  make dev-frontend   - フロントエンドのみ起動"
	@echo "  make dev-backend    - バックエンドのみ起動"
	@echo "  make build          - プロダクションビルド"
	@echo "  make build-frontend - フロントエンドのみビルド"
	@echo "  make build-backend  - バックエンドのみビルド"
	@echo "  make clean          - ビルド成果物とnode_modulesを削除"
	@echo "  make test           - テストを実行"
	@echo ""
	@echo "Google Cloudコマンド:"
	@echo "  make gcloud-setup   - Google Cloud初期セットアップ"
	@echo "  make gcloud-create-secret - Secret Managerにシークレット作成"
	@echo "  make deploy         - Google Cloud Runにデプロイ"
	@echo "  make gcloud-url     - デプロイ済みURLを表示"
	@echo "  make gcloud-logs    - Cloud Runログを表示"

# 初期化: 依存関係のインストール
install:
	@echo "=== 依存関係をインストール中 ==="
	cd backend && npm install
	cd frontend && npm install
	@echo "=== インストール完了 ==="

# 開発サーバー起動（並列実行）
# 注意: Windows環境ではconcurrentlyパッケージの使用を推奨
dev:
	@echo "=== 開発サーバーを起動 ==="
	@echo "バックエンド: http://localhost:3001"
	@echo "フロントエンド: http://localhost:5173"
	@echo ""
	@echo "注意: 並列実行には別々のターミナルで以下を実行してください:"
	@echo "  ターミナル1: make dev-backend"
	@echo "  ターミナル2: make dev-frontend"

# バックエンド開発サーバー
dev-backend:
	@echo "=== バックエンド起動中 (http://localhost:3001) ==="
	cd backend && npm run dev

# フロントエンド開発サーバー
dev-frontend:
	@echo "=== フロントエンド起動中 (http://localhost:5173) ==="
	cd frontend && npm run dev

# プロダクションビルド
build: build-backend build-frontend
	@echo "=== ビルド完了 ==="

# バックエンドビルド
build-backend:
	@echo "=== バックエンドをビルド中 ==="
	cd backend && npm run build
	@echo "=== バックエンドビルド完了 (backend/dist/) ==="

# フロントエンドビルド
build-frontend:
	@echo "=== フロントエンドをビルド中 ==="
	cd frontend && npm run build
	@echo "=== フロントエンドビルド完了 (frontend/dist/) ==="

# クリーンアップ
clean:
	@echo "=== クリーンアップ中 ==="
	rm -rf backend/dist
	rm -rf backend/node_modules
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	@echo "=== クリーンアップ完了 ==="

# テスト実行
test:
	@echo "=== テスト実行中 ==="
	cd backend && npm test
	cd frontend && npm test

# Google Cloud Runへのデプロイ（統合デプロイ）
deploy:
	@echo "=== Google Cloud Runにデプロイ中 ==="
	@echo "注意: gcloud CLIがインストールされている必要があります"
	@echo ""
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
		--max-instances 10 \
		--port 8080
	@echo "=== デプロイ完了 ==="

# Google Cloud セットアップ
gcloud-setup:
	@echo "=== Google Cloud初期セットアップ ==="
	@read -p "Project ID: " PROJECT_ID; \
	gcloud config set project $$PROJECT_ID && \
	gcloud config set run/region asia-northeast1 && \
	gcloud services enable run.googleapis.com \
		containerregistry.googleapis.com \
		cloudbuild.googleapis.com \
		secretmanager.googleapis.com \
		artifactregistry.googleapis.com
	@echo "=== セットアップ完了 ==="

# Secret Managerにシークレット作成
gcloud-create-secret:
	@echo "=== Secret Managerにシークレットを作成 ==="
	@read -p "ANTHROPIC_API_KEY: " API_KEY; \
	echo -n "$$API_KEY" | gcloud secrets create anthropic-api-key \
		--data-file=- \
		--replication-policy="automatic" || \
	echo -n "$$API_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-
	@PROJECT_NUMBER=$$(gcloud projects describe $$(gcloud config get-value project) --format="value(projectNumber)"); \
	gcloud secrets add-iam-policy-binding anthropic-api-key \
		--member="serviceAccount:$${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
		--role="roles/secretmanager.secretAccessor"
	@echo "=== シークレット作成完了 ==="

# デプロイ済みURLの取得
gcloud-url:
	@gcloud run services describe chatbot \
		--region asia-northeast1 \
		--format="value(status.url)"

# Cloud Runログの表示
gcloud-logs:
	@gcloud run services logs tail chatbot --region asia-northeast1

# 環境変数の確認
check-env:
	@echo "=== 環境変数チェック ==="
	@if [ -f backend/.env ]; then \
		echo "✓ backend/.env が存在します"; \
	else \
		echo "✗ backend/.env が見つかりません"; \
		echo "  backend/.env.example をコピーして設定してください"; \
	fi
	@if [ -f frontend/.env ]; then \
		echo "✓ frontend/.env が存在します"; \
	else \
		echo "✗ frontend/.env が見つかりません"; \
		echo "  frontend/.env.example をコピーして設定してください"; \
	fi

# 開発環境のセットアップ（.envファイルの作成含む）
setup: install
	@echo "=== 開発環境のセットアップ ==="
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "backend/.env を作成しました。ANTHROPIC_API_KEY を設定してください。"; \
	fi
	@if [ ! -f frontend/.env ]; then \
		cp frontend/.env.example frontend/.env; \
		echo "frontend/.env を作成しました。"; \
	fi
	@echo "=== セットアップ完了 ==="
	@echo "次のステップ:"
	@echo "1. backend/.env にANTHROPIC_API_KEYを設定"
	@echo "2. make dev-backend (ターミナル1)"
	@echo "3. make dev-frontend (ターミナル2)"

# サービスの状態確認
gcloud-status:
	@echo "=== サービス状態 ==="
	gcloud run services list --region=asia-northeast1

# Cloud Runサービスの削除
gcloud-delete:
	@echo "=== Cloud Runサービスを削除 ==="
	@read -p "本当に削除しますか? (yes/no): " CONFIRM; \
	if [ "$$CONFIRM" = "yes" ]; then \
		gcloud run services delete chatbot --region asia-northeast1 --quiet; \
		echo "=== サービス削除完了 ==="; \
	else \
		echo "キャンセルしました"; \
	fi

# 開発用: すべてリセットして再セットアップ
reset: clean setup
	@echo "=== リセット完了 ==="
