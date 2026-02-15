# 研究: ブログ記事一覧ページ

**機能**: 002-posts-list-page
**日付**: 2026-02-10
**目的**: 技術的な未知数を解決し、実装パターンを確立する

## 研究トピック

### 1. タグ付き記事のデータベースクエリパターン

**質問**: データベースから記事とその関連タグを効率的に取得する方法は？

**評価したオプション**:

1. **GROUP_CONCAT を使用した LEFT JOIN**
   - post, post_revision, tag_post, tag_name を結合する単一クエリ
   - GROUP_CONCAT を使用してタグを記事ごとに1行に集約
   - アプリケーションコードでカンマ区切りのタグを解析

2. **個別クエリ**（N+1 パターン）
   - クエリ 1: すべての記事を取得
   - クエリ 2-N: 各記事ごとにタグを取得
   - シンプルだが多数の記事には非効率

3. **2クエリパターン**
   - クエリ 1: すべての記事を取得
   - クエリ 2: それらの記事のすべてのタグを取得（IN 句）
   - アプリケーションコードで結合
   - 効率性とシンプルさのバランス

**決定**: **2クエリパターン**

**根拠**:
- N+1 クエリ問題を回避
- GROUP_CONCAT 解析よりもシンプルなアプリケーションコード
- Zod 検証による型安全性の向上
- テストとメンテナンスが容易
- <1000 記事ではパフォーマンスが許容可能（ページネーションは後で追加）

**実装**:
```sql
-- クエリ 1: すべての公開記事を取得
SELECT
  post.id, post.slug, post.create_date,
  post_revision.title
FROM post
JOIN post_revision ON post.id = post_revision.post_id
WHERE post_revision.public = 1
ORDER BY post.create_date DESC;

-- クエリ 2: それらの記事のすべてのタグを取得
SELECT
  tag_post.post_id,
  tag_name.id,
  tag_name.name
FROM tag_post
JOIN tag_name ON tag_post.tag_id = tag_name.id
WHERE tag_post.post_id IN (?, ?, ...);
```

**検討した代替案**:
- GROUP_CONCAT を使用した LEFT JOIN: GROUP_CONCAT 解析が脆弱で MySQL 固有であるため却下
- N+1 個別クエリ: パフォーマンスの懸念のため却下

---

### 2. リスト操作のための tRPC エンドポイント設計

**質問**: tRPC 11 におけるリストエンドポイントのベストプラクティスは？

**研究結果**:

**tRPC 11 ベストプラクティス**:
1. 読み取り操作には `.query()` を使用（`.mutation()` ではない）
2. シンプルなリストには配列を直接返す
3. 出力検証には Zod スキーマを使用
4. ページネーションパラメータを検討（MVP ではオプション、#32 では必須）
5. Date シリアライゼーションには superjson トランスフォーマーを使用（既に設定済み）

**決定**: **型付き配列を返すシンプルなクエリプロシージャ**

**エンドポイントシグネチャ**:
```typescript
postsList: t.procedure
  .query(async (): Promise<PostListItem[]> => {
    return await fetchAllPosts();
  })
```

**根拠**:
- リスト操作の tRPC 規約に従う
- シンプルな「すべて取得」操作には入力不要
- TypeScript と Zod による型安全性の維持
- 後でページネーションパラメータで拡張しやすい

**検討した代替案**:
- ミューテーションベースのエンドポイント: 却下（ミューテーションは書き込み操作用）
- オブジェクトラッパー（例: `{ posts: PostListItem[] }`）: ページネーション追加まで延期

---

### 3. React の空の状態処理パターン

**質問**: Next.js 15 App Router で空の状態を処理する最適なパターンは？

**研究結果**:

**Next.js 15 + React 19 パターン**:
1. Server/Client Components での条件付きレンダリング
2. 空の状態のための早期リターン
3. ロード失敗のための適切なエラーバウンダリ

**決定**: **早期リターン付き条件付きレンダリング**

**パターン**:
```typescript
export default async function PostsPage() {
  const posts = await trpc.postsList.query();

  if (posts.length === 0) {
    return (
      <main>
        <h1>投稿</h1>
        <p>まだ投稿がありません。</p>
      </main>
    );
  }

  return (
    <main>
      <h1>投稿</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            {/* タグのレンダリング */}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**根拠**:
- シンプルで読みやすい
- Server Component はデータを直接取得可能（クライアントサイドのロード状態不要）
- Next.js 15 App Router の規約に準拠
- スタイリングとメンテナンスが容易

**検討した代替案**:
- ロード状態を持つ Client Component: 静的リストには不必要な複雑さ
- 別の Empty コンポーネント: シンプルなメッセージには過剰設計

---

## 追加研究

### 4. 複数リビジョンを持つ記事の処理

**コンテキスト**: データベースには `post_revision` テーブルがある（記事ごとに複数のリビジョン）

**決定**: **記事ごとに最新の公開リビジョンのみを取得**

**実装戦略**:
- サブクエリで記事ごとに最新のリビジョンを取得するために JOIN
- または `post_id` でグループ化された `MAX(post_revision.id)` を使用
- 下書きを除外するために `public = 1` でフィルタリング

**クエリの改良**:
```sql
-- 記事ごとに最新の公開リビジョンを取得
SELECT
  post.id, post.slug, post.create_date,
  latest_rev.title
FROM post
JOIN (
  SELECT post_id, MAX(id) as max_rev_id
  FROM post_revision
  WHERE public = 1
  GROUP BY post_id
) AS latest
ON post.id = latest.post_id
JOIN post_revision AS latest_rev
ON latest_rev.id = latest.max_rev_id
ORDER BY post.create_date DESC;
```

---

## 技術選択のまとめ

| 技術 | 選択 | 正当化理由 |
|------|------|----------|
| クエリパターン | 2クエリ（記事 + タグ） | パフォーマンスとシンプルさのバランス |
| tRPC エンドポイント | 配列を返すシンプルな `.query()` | tRPC 規約に従い、拡張が容易 |
| 空の状態 | 早期リターン付き条件付きレンダリング | シンプルで Server Component と互換性あり |
| リビジョン処理 | 最新の公開リビジョンのサブクエリ | 正しいデータを保証し、下書きをフィルタリング |
| テスト | バックエンドは Jest、フロントエンドは手動 | MVP に適切なカバレッジ |

---

## 解決された未解決の問題

1. ✅ **タグを効率的に結合する方法**: 2クエリパターン
2. ✅ **tRPC ベストプラクティス**: `.query()` を使用し、型付き配列を返す
3. ✅ **空の状態パターン**: 条件付きレンダリング
4. ✅ **複数リビジョン**: 最新の公開リビジョンのみを取得

---

**ステータス**: すべての研究トピックが解決されました。Phase 1（設計成果物）の準備ができています。
