# Project Constitution: web3blog

## Project Vision

Web3層アーキテクチャ（プレゼンテーション層、アプリケーション層、データ層）の理解を深めるための学習用ブログシステム。AWS環境でのデプロイとCI/CDパイプラインの実装を通じて、モダンなWeb開発の実践的スキルを習得することを目的とする。

**Live URL**: https://blog.yuriacats.net

## Core Principles

### 1. Type Safety First
- **Full-stack Type Safety**: tRPCを使用してフロントエンドとバックエンド間の型安全性を確保
- **Strict TypeScript**: 厳格なTypeScript設定により、実行時エラーを最小化
- **Schema Validation**: Zodを使用したランタイムバリデーション

### 2. Monorepo Architecture
- **4つの独立したアプリケーション**:
  - `front/`: Next.js 13+ (App Router) フロントエンド
  - `backend/`: Express + TypeScript バックエンド
  - `integration/`: 統合テスト
  - `db/`: MySQL データベース設定
- **共有型定義**: tRPCによるフロントエンド・バックエンド間の型共有
- **独立した開発サイクル**: 各アプリケーションは独立してテスト・デプロイ可能

### 3. Structured Development with spec-kit
- **仕様駆動開発**: すべての新機能は`spec.md`から開始
- **計画的実装**: `plan.md`で設計を文書化してから実装
- **タスク管理**: `tasks.md`で実装ステップを明確化
- **品質保証**: 実装前にチェックリストで要件を確認

### 4. Testing Strategy
- **Backend**: Jest による単体テスト
- **Integration**: 統合テスト専用プロジェクト
- **Frontend**: Storybook によるコンポーネント開発
- **Type Safety**: TypeScriptコンパイラによる静的解析

### 5. Developer Experience
- **Dev Container**: 統一された開発環境
- **Docker Compose**: ローカルでの完全なスタック実行
- **Hot Reload**: フロントエンド・バックエンド両方で開発効率化
- **Linting**: ESLint + Prettier による一貫したコードスタイル

## Technical Stack

### Frontend
- **Framework**: Next.js 13.4+ (App Router)
- **UI**: React 18.2
- **State**: React Query (@tanstack/react-query)
- **RPC**: tRPC 10.29.0
- **Markdown**: remark + rehype ecosystem
- **Component Dev**: Storybook 7.0

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express 4.18
- **RPC**: tRPC Server 10.29.0
- **Database**: MySQL (via promise-mysql)
- **Testing**: Jest 29.6
- **Validation**: Zod 3.21

### Infrastructure
- **Cloud**: AWS
- **CI/CD**: GitHub Actions
- **Container**: Docker + Docker Compose
- **Database**: MySQL

## Development Workflow

### Feature Development Process
1. **Specify** (`/speckit.specify`): 機能要件を`spec.md`に記述
2. **Clarify** (`/speckit.clarify`): 不明瞭な点を明確化
3. **Plan** (`/speckit.plan`): 実装計画を`plan.md`に作成
4. **Tasks** (`/speckit.tasks`): 実装タスクを`tasks.md`に生成
5. **Implement** (`/speckit.implement`): タスクを実行
6. **Analyze** (`/speckit.analyze`): 一貫性と品質を検証

### Monorepo Considerations
- **Feature Scope**: 機能がフロントエンドのみ、バックエンドのみ、または両方に影響するかを明確化
- **API Contract**: tRPC router定義の変更は慎重に、型安全性を維持
- **Database Migrations**: スキーマ変更は別タスクとして管理
- **Testing**: 各層で適切なテストを実装（単体→統合→E2E）

## Quality Standards

### Code Quality
- TypeScriptエラーゼロ
- ESLintエラーゼロ
- Prettierによる自動整形

### Security
- 認証・認可の適切な実装（Auth0使用予定）
- 入力バリデーション（Zodスキーマ）
- SQLインジェクション対策（パラメータ化クエリ）
- XSS対策（Reactの自動エスケープ）

### Performance
- ページネーション実装（大量データ対応）
- 画像最適化
- バンドルサイズの監視

## Git Workflow

- **Main Branch**: `master` (本番環境)
- **Feature Branches**: `feature/[issue-number]-[description]`
- **Commits**: Conventional Commits形式推奨
- **Pull Requests**: レビュー後にマージ

## Learning Goals

このプロジェクトを通じて以下を習得する：

1. **3層アーキテクチャの実践理解**
   - プレゼンテーション層（Next.js）
   - アプリケーション層（Express API）
   - データ層（MySQL）

2. **AWS環境での運用**
   - インフラ構築
   - デプロイメント
   - モニタリング

3. **CI/CDパイプライン**
   - 自動テスト
   - 自動デプロイ
   - 品質ゲート

4. **Type-safe Full-stack開発**
   - tRPCによるエンドツーエンド型安全性
   - スキーマ駆動開発

---

**Last Updated**: 2026-02-08
**Status**: Active Learning Project
