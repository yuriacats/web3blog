# Issue Priorities & Implementation Roadmap

**Last Updated**: 2026-02-08
**Total Issues**: 10
**Status**: Planning Phase

このドキュメントは、web3blogプロジェクトの既存Issueを優先順位付けし、spec-kitを使った構造化開発のロードマップを提供します。

---

## 📊 Priority Matrix

| Priority | Issue # | Title | Impact | Effort | Dependencies |
|----------|---------|-------|--------|--------|--------------|
| 🔴 P0 | #15 | posts/[slug]/page.tsx の作成 | Critical | M | - |
| 🔴 P0 | #16 | posts/page.tsx の作成 | Critical | M | - |
| 🔴 P0 | #28 | ブログ記事をPOSTをする機能の追加 | Critical | L | #46 |
| 🔴 P0 | #46 | 認証を作る (Auth0) | Critical | L | - |
| 🟡 P1 | #29 | 画像対応 | High | M | #28 |
| 🟡 P1 | #32 | ページネーションの実装 | High | M | #16 |
| 🟡 P1 | #17 | 検索機能の作成（タグ検索機能） | High | L | #16, #15 |
| 🟢 P2 | #30 | Katexの導入 | Medium | S | #15 |
| 🟢 P2 | #22 | tableのcreate_date をcreate_atに変更 | Low | S | - |
| 🟢 P2 | #38 | Docker コンテナにラベルをつける | Low | S | - |

**Legend**:
- **Impact**: Critical > High > Medium > Low
- **Effort**: S (Small) / M (Medium) / L (Large)
- **Priority**: P0 (必須) / P1 (重要) / P2 (改善)

---

## 🎯 Issue Details & Rationale

### 🔴 Priority 0: Core Features (必須機能)

#### #15: posts/[slug]/page.tsx の作成
**Status**: OPEN
**Created**: 2023-06-01
**Impact**: Critical - ブログの基本機能

**Requirements**:
- [slug]に該当するページが存在する場合: Slugの内容を表示（Markdown対応）
- Authorなどのメタデータ表示
- [slug]に該当するページが存在しない場合: 404を返す

**Why P0**:
- 個別記事を読めないとブログとして機能しない
- 他の多くの機能（画像、Katex、検索）の基盤となる
- ユーザー体験の中核

**Implementation Scope**:
- **Frontend**: `front/src/app/posts/[slug]/page.tsx`
- **Backend**: tRPC router for fetching post by slug
- **Database**: posts table query

**Dependencies**: なし（最優先で実装可能）

**spec-kit Workflow**:
```bash
/speckit.specify    # Issue #15の要件を詳細化
/speckit.plan       # Next.js App Router + tRPCでの実装計画
/speckit.tasks      # フロントエンド・バックエンドのタスク分解
/speckit.implement  # タスク実行
```

---

#### #16: posts/page.tsx の作成
**Status**: OPEN
**Created**: 2023-06-01
**Impact**: Critical - ブログの基本機能

**Requirements**:
- ページのリンク、タイトル、タグを取得して一覧表示

**Why P0**:
- 記事一覧がないとユーザーがコンテンツを発見できない
- ブログのランディングページとして機能
- ページネーション（#32）の基盤

**Implementation Scope**:
- **Frontend**: `front/src/app/posts/page.tsx`
- **Backend**: tRPC router for fetching posts list
- **Database**: posts table query with pagination support

**Dependencies**: なし（#15と並行実装可能）

**spec-kit Workflow**:
```bash
/speckit.specify    # Issue #16の要件を詳細化
/speckit.plan       # 記事一覧のUI/UX設計
/speckit.tasks      # コンポーネント・API・DB層のタスク分解
/speckit.implement  # タスク実行
```

---

#### #28: ブログ記事をPOSTをする機能の追加
**Status**: OPEN
**Created**: 2023-06-20
**Impact**: Critical - コンテンツ作成機能

**Requirements**:
- ブログ記事を作成・投稿する管理画面
- Markdown形式での入力
- タグ付け機能

**Why P0**:
- コンテンツを作成できないとブログが成立しない
- 現時点でどのように記事を投稿しているか不明（手動DB操作？）
- 認証（#46）とセットで実装すべき

**Implementation Scope**:
- **Frontend**: 管理画面 `front/src/app/admin/posts/new/page.tsx`
- **Backend**: tRPC mutation for creating posts
- **Database**: INSERT into posts table
- **Security**: 認証チェック（Auth0）

**Dependencies**:
- **#46 (認証)**: POST操作にはセキュリティが必須

**spec-kit Workflow**:
```bash
/speckit.specify    # エディタUI、プレビュー機能、バリデーションの仕様
/speckit.clarify    # 下書き保存、公開フロー、画像アップロードの扱いを明確化
/speckit.plan       # 管理画面の設計、権限チェックの実装方針
/speckit.tasks      # フォーム、API、DB操作のタスク分解
/speckit.implement  # タスク実行
```

---

#### #46: 認証を作る (Auth0)
**Status**: OPEN
**Created**: 2023-11-07
**Impact**: Critical - セキュリティ基盤

**Requirements**:
- Auth0で認証基盤を作る
- 認証が必要なページを作る
- Auth0でないと入れないReadページを作る

**Why P0**:
- POST機能（#28）にはセキュリティが必須
- 将来的な管理機能の基盤
- 本番環境での不正アクセス防止

**Implementation Scope**:
- **Frontend**: Auth0 SDK integration, protected routes
- **Backend**: JWT検証、ミドルウェア実装
- **Infrastructure**: Auth0アプリケーション設定

**Dependencies**: なし（#28より先に実装推奨）

**spec-kit Workflow**:
```bash
/speckit.specify    # Auth0設定、ログインフロー、保護ルートの仕様
/speckit.plan       # Next.js + tRPCでのAuth0統合設計
/speckit.tasks      # フロントエンド認証、バックエンド検証のタスク分解
/speckit.implement  # タスク実行
```

**Implementation Note**:
#28（POST機能）と同時期に実装し、最初から認証付きで公開することを推奨。

---

### 🟡 Priority 1: UX Enhancements (重要機能)

#### #29: 画像対応
**Status**: OPEN
**Created**: 2023-06-20
**Impact**: High - コンテンツの質向上

**Requirements**:
- 画像を使えるように対応する

**Why P1**:
- ブログに画像は重要なコンテンツ要素
- ユーザーエンゲージメント向上
- 技術ブログでは図解が必須

**Implementation Scope**:
- **Frontend**: Next.js Image component, Markdown画像レンダリング
- **Backend**: 画像アップロードAPI、ストレージ（S3?）
- **Database**: 画像メタデータ管理

**Dependencies**:
- **#28 (POST機能)**: 画像アップロードは記事作成時に必要
- **#15 (記事表示)**: 画像を表示する基盤

**spec-kit Workflow**:
```bash
/speckit.specify    # 画像アップロード方式（S3/ローカル）、サイズ制限、最適化戦略
/speckit.clarify    # ストレージ選択、CDN使用有無、画像形式サポート範囲
/speckit.plan       # アップロードフロー、ストレージ統合、Markdown対応
/speckit.tasks      # アップロードUI、API、ストレージ連携のタスク分解
/speckit.implement  # タスク実行
```

**Technical Considerations**:
- AWSを学習目的とするなら、S3 + CloudFrontの組み合わせを推奨
- Next.js Image Optimizationとの統合

---

#### #32: ページネーションの実装
**Status**: OPEN
**Created**: 2023-07-03
**Impact**: High - スケーラビリティ

**Requirements**:
- 記事一覧のページネーション

**Why P1**:
- 記事が増えるとパフォーマンスとUXに影響
- 初期表示速度の維持
- サーバー負荷削減

**Implementation Scope**:
- **Frontend**: ページネーションUI、ページ遷移
- **Backend**: LIMIT/OFFSET クエリまたはカーソルベースページング
- **Database**: インデックス最適化

**Dependencies**:
- **#16 (記事一覧)**: ページネーションを追加する対象

**spec-kit Workflow**:
```bash
/speckit.specify    # ページサイズ、UI/UX（番号表示 vs 無限スクロール）
/speckit.plan       # カーソルベース vs オフセットベース、SEO対策
/speckit.tasks      # UI実装、クエリ最適化、キャッシング戦略
/speckit.implement  # タスク実行
```

**Technical Recommendation**:
- 初期はシンプルなOFFSETベース
- 将来的にカーソルベースへ移行可能な設計

---

#### #17: 検索機能の作成（タグ検索機能）
**Status**: OPEN
**Created**: 2023-06-01
**Impact**: High - コンテンツ発見性

**Requirements**:
- タグ検索機能
- 検索の予測変換としてタグが出てくるようにする

**Why P1**:
- コンテンツが増えると発見性が重要に
- ユーザーが興味のあるトピックを探しやすくなる
- SEOにも貢献

**Implementation Scope**:
- **Frontend**: 検索UI、オートコンプリート
- **Backend**: タグ検索API、全文検索（オプション）
- **Database**: tags table, post_tags関連テーブル

**Dependencies**:
- **#16 (記事一覧)**: 検索結果を表示する基盤
- **#15 (記事表示)**: タグ表示機能

**spec-kit Workflow**:
```bash
/speckit.specify    # タグのみ vs 全文検索、オートコンプリートUI/UX
/speckit.clarify    # AND/OR検索、タグ階層、関連タグ提案の有無
/speckit.plan       # 検索アルゴリズム、DB設計（tags/post_tagsテーブル）
/speckit.tasks      # 検索UI、API、インデックス作成のタスク分解
/speckit.implement  # タスク実行
```

**Technical Considerations**:
- 初期: 単純なタグマッチング
- 将来: MySQL Full-Text SearchまたはElasticsearch導入

---

### 🟢 Priority 2: Improvements (改善・拡張)

#### #30: Katexの導入
**Status**: OPEN
**Created**: 2023-06-20
**Impact**: Medium - 技術ブログの表現力向上

**Requirements**:
- Katex（数式レンダリング）の導入

**Why P2**:
- 技術ブログで数式を使うケースに有用
- 必須ではないが、あると表現力が向上
- 数式を使う記事を書く必要が出たタイミングで実装

**Implementation Scope**:
- **Frontend**: Katex library integration, Markdown plugin
- **Backend**: 変更なし（フロントエンドのみ）

**Dependencies**:
- **#15 (記事表示)**: Markdownレンダリングに追加機能

**spec-kit Workflow**:
```bash
/speckit.specify    # Katexのレンダリング方式、サポートする記法
/speckit.plan       # rehype-katexプラグイン統合、CSS読み込み
/speckit.tasks      # プラグイン設定、スタイル適用のタスク分解
/speckit.implement  # タスク実行
```

**Implementation Effort**: Small (フロントエンドのプラグイン追加のみ)

---

#### #22: tableのcreate_date をcreate_atに変更
**Status**: OPEN
**Created**: 2023-06-04
**Impact**: Low - 技術的負債削減

**Requirements**:
- DBの仕様変更する際にCommitすること
- テーブルカラム名を `create_date` → `create_at` に変更

**Why P2**:
- 命名規則の統一（Rails慣習: created_at, updated_at）
- 技術的負債の削減
- 機能への直接的な影響は少ない

**Implementation Scope**:
- **Database**: ALTER TABLE migration
- **Backend**: クエリ修正（create_date → create_at）
- **Frontend**: 型定義の更新（tRPC経由で自動反映）

**Dependencies**: なし（独立したリファクタリング）

**spec-kit Workflow**:
```bash
/speckit.specify    # マイグレーション戦略、ダウンタイム対策
/speckit.plan       # DB変更スクリプト、コード修正範囲
/speckit.tasks      # マイグレーション作成、コード修正、テストのタスク分解
/speckit.implement  # タスク実行
```

**Implementation Note**:
- ダウンタイムが発生する可能性があるため、落ち着いたタイミングで実施
- 本番環境では慎重なマイグレーション計画が必要

---

#### #38: Docker コンテナにラベルをつける
**Status**: OPEN
**Created**: 2023-08-19
**Impact**: Low - インフラメタデータ改善

**Requirements**:
```dockerfile
LABEL org.opencontainers.image.source=https://github.com/yuriacats/web3blog
LABEL org.opencontainers.image.description="My container image"
```

**Why P2**:
- コンテナイメージのメタデータ管理
- GitHub Container Registryでの可視性向上
- 機能への影響はない

**Implementation Scope**:
- **Infrastructure**: Dockerfileにラベル追加（front, backend）

**Dependencies**: なし

**spec-kit Workflow**:
不要（単純なDockerfile修正のため、spec-kitなしで直接実装可能）

**Implementation Effort**: Small (2つのDockerfile修正のみ)

---

## 🗺️ Implementation Roadmap

### Phase 1: Core Foundation (必須基盤) - 4 Issues
**Goal**: ブログとして最低限機能する状態にする

1. **#46: 認証を作る (Auth0)** ← 先に実装
   - Auth0設定、フロントエンド・バックエンド統合
   - 保護ルートの実装

2. **#15: posts/[slug]/page.tsx の作成** ← 並行可能
   - 個別記事表示機能
   - Markdownレンダリング
   - 404ハンドリング

3. **#16: posts/page.tsx の作成** ← 並行可能
   - 記事一覧表示機能
   - タイトル、リンク、タグ表示

4. **#28: ブログ記事をPOSTをする機能の追加** ← #46完了後
   - 管理画面実装
   - 認証付きPOST API
   - Markdownエディタ

**Success Criteria**:
- [ ] ブログ記事を投稿できる（認証済みユーザーのみ）
- [ ] 記事一覧を表示できる
- [ ] 個別記事を閲覧できる
- [ ] 型安全なAPI通信が確立されている

---

### Phase 2: UX Enhancement (体験向上) - 3 Issues
**Goal**: ユーザー体験とコンテンツの質を向上させる

5. **#29: 画像対応**
   - 画像アップロード機能（S3統合推奨）
   - Markdown内での画像表示
   - Next.js Image最適化

6. **#32: ページネーションの実装**
   - 記事一覧のページング
   - パフォーマンス最適化

7. **#17: 検索機能の作成（タグ検索機能）**
   - タグ検索UI
   - オートコンプリート
   - 検索結果表示

**Success Criteria**:
- [ ] リッチなコンテンツ（画像付き記事）を投稿できる
- [ ] 記事が増えてもパフォーマンスが維持される
- [ ] ユーザーが興味のあるトピックを簡単に発見できる

---

### Phase 3: Polish & Optimization (洗練・最適化) - 3 Issues
**Goal**: 技術的負債を削減し、拡張性を向上させる

8. **#30: Katexの導入**
   - 数式レンダリング機能
   - 技術記事の表現力向上

9. **#22: tableのcreate_date をcreate_atに変更**
   - DB命名規則の統一
   - マイグレーション実行

10. **#38: Docker コンテナにラベルをつける**
    - OCI標準ラベル追加
    - メタデータ管理改善

**Success Criteria**:
- [ ] コードベースの一貫性が向上している
- [ ] 技術的負債が削減されている
- [ ] 将来の拡張が容易になっている

---

## 🛠️ spec-kit Development Workflow

### 各Issueの標準フロー

```bash
# 1. 仕様の作成
/speckit.specify
# → .specify/features/[issue-number]-[feature-name]/spec.md が生成される

# 2. 不明点の明確化（必要に応じて）
/speckit.clarify
# → spec.mdが更新され、曖昧さが解消される

# 3. 実装計画の作成
/speckit.plan
# → plan.md が生成される（アーキテクチャ、技術選定、リスク）

# 4. タスクの生成
/speckit.tasks
# → tasks.md が生成される（実装ステップ、依存関係）

# 5. 実装の実行
/speckit.implement
# → tasks.mdに従って実装が進行

# 6. 品質チェック（実装後）
/speckit.analyze
# → spec.md, plan.md, tasks.md の一貫性を検証
```

### Monorepo特有の考慮事項

**フロントエンドのみの変更** (例: #30 Katex導入):
- `spec.md`でフロントエンドスコープを明記
- `plan.md`でバックエンドへの影響がないことを確認
- `tasks.md`で`front/`ディレクトリ内のタスクのみ

**バックエンドのみの変更** (例: #22 DB命名変更):
- `spec.md`でDB + バックエンドスコープを明記
- `plan.md`でマイグレーション戦略を詳細化
- `tasks.md`でDB migration → コード修正 → テストの順序を明確化

**Full-stack変更** (例: #28 POST機能):
- `spec.md`でフロントエンド・バックエンド・DBすべての要件を記載
- `plan.md`でtRPC契約（型定義）を先に設計
- `tasks.md`で以下の順序を推奨:
  1. tRPC router定義（型契約）
  2. バックエンドAPI実装
  3. フロントエンドUI実装
  4. 統合テスト

### 依存関係の管理

**並行実装可能**:
- #15 と #16（どちらも読み取り専用、互いに独立）
- #46（認証システムは独立したレイヤー）

**順序が重要**:
1. #46（認証） → #28（POST機能）: セキュリティ上、認証が先
2. #28（POST機能） → #29（画像対応）: 画像アップロードはPOST機能の拡張
3. #16（記事一覧） → #32（ページネーション）: ページネーション対象が必要
4. #15, #16 → #17（検索機能）: 検索結果を表示する基盤が必要

---

## 📋 Quick Reference: Issue Summary

### 今すぐ着手可能（依存なし）
- ✅ #15: posts/[slug]/page.tsx の作成
- ✅ #16: posts/page.tsx の作成
- ✅ #46: 認証を作る (Auth0)
- ✅ #22: tableのcreate_date をcreate_atに変更
- ✅ #38: Docker コンテナにラベルをつける

### ブロック中（依存あり）
- 🚧 #28: ブログ記事をPOSTをする機能の追加 (requires #46)
- 🚧 #29: 画像対応 (requires #28)
- 🚧 #32: ページネーションの実装 (requires #16)
- 🚧 #17: 検索機能の作成 (requires #16, #15)
- 🚧 #30: Katexの導入 (requires #15)

### 推奨開始順序
1. **#46** (認証) + **#15** (記事詳細) + **#16** (記事一覧) ← 3つ並行可能
2. **#28** (POST機能) ← #46完了後
3. **#29** (画像対応) ← #28完了後
4. **#32** (ページネーション) + **#17** (検索機能) ← 並行可能
5. **#30** (Katex) + **#22** (DB命名) + **#38** (Dockerラベル) ← 並行可能

---

## 🎯 Next Actions

1. **constitution.mdの確認**: `.specify/constitution.md`をレビューし、プロジェクト原則に合意
2. **Phase 1の開始**: #46（認証）、#15（記事詳細）、#16（記事一覧）から着手
3. **spec-kitで最初の機能を作成**:
   ```bash
   /speckit.specify  # Issue #46 (認証) の仕様から始めることを推奨
   ```

---

**Document Maintainer**: Claude Code + spec-kit
**Review Cycle**: 各Phase完了時に見直し
