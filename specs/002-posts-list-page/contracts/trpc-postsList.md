# tRPC コントラクト: postsList

**エンドポイント**: `postsList`
**タイプ**: クエリ（読み取り操作）
**目的**: リスト表示用にすべての公開ブログ記事とそのタグを取得する

## リクエスト

**メソッド**: `query`

**入力**: なし

**TypeScript 型**:
```typescript
// 入力パラメータなし
void
```

---

## レスポンス

**出力**: PostListItem の配列

**TypeScript 型**:
```typescript
type PostListItem = {
  slug: string;           // 20文字の一意の識別子
  title: string;          // 記事のタイトル（1-256文字）
  tags: Tag[];           // 関連するタグの配列（空も可）
  createDate: Date;      // 記事の作成タイムスタンプ
};

type Tag = {
  id: number;            // 一意のタグID
  name: string;          // タグ名（1-20文字）
};

// エンドポイントの戻り値:
PostListItem[]
```

**Zod スキーマ**:
```typescript
import { z } from "zod";

const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(20),
});

const PostListItemSchema = z.object({
  slug: z.string().length(20),
  title: z.string().min(1).max(256),
  tags: z.array(TagSchema),
  createDate: z.coerce.date(),
});

// 戻り値の型検証
const PostsListResponseSchema = z.array(PostListItemSchema);
```

---

## 動作

**成功時の動作**:
- すべての公開記事の配列を返す（post_revision.public = 1）
- 記事は作成日順に並べられ、最新の記事が最初
- 各記事には関連するタグが含まれる
- タグのない記事は空の `tags` 配列を持つ

**空の状態**:
- 公開記事が存在しない場合、`[]`（空の配列）を返す
- フロントエンドは適切なメッセージで空の状態を処理

**エラーケース**:
- データベース接続失敗: tRPC エラーをスロー
- クエリ実行エラー: tRPC エラーをスロー

---

## tRPC プロシージャ定義

```typescript
// backend/src/index.ts (appRouter 内)

export const appRouter = t.router({
  // ... 既存のエンドポイント

  postsList: t.procedure
    .query(async (): Promise<PostListItem[]> => {
      return await fetchAllPosts();
    }),
});
```

---

## フロントエンドでの使用

**Next.js Server Component**（サーバーサイドフェッチ）:
```typescript
// front/src/app/posts/page.tsx

import { trpc } from '@/utils/trpc'; // tRPC クライアント

export default async function PostsPage() {
  const posts = await trpc.postsList.query();

  if (posts.length === 0) {
    return <div>投稿がありません</div>;
  }

  return (
    <ul>
      {posts.map(post => (
        <li key={post.slug}>
          <a href={`/posts/${post.slug}`}>{post.title}</a>
          <div>
            {post.tags.map(tag => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

**代替案: Client Component**（必要な場合）:
```typescript
'use client';

import { trpc } from '@/utils/trpc';

export default function PostsPage() {
  const { data: posts, isLoading, error } = trpc.postsList.useQuery();

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>投稿の読み込みエラー</div>;
  if (!posts || posts.length === 0) return <div>投稿がありません</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.slug}>
          <a href={`/posts/${post.slug}`}>{post.title}</a>
          <div>
            {post.tags.map(tag => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

---

## 型安全性の保証

1. **フルスタック型安全性**: TypeScript によりフロントエンドとバックエンドが同じ型を使用することを保証
2. **ランタイム検証**: Zod がデータベース結果が期待されるスキーマと一致することを検証
3. **Date シリアライゼーション**: SuperJSON トランスフォーマー（既に設定済み）が Date オブジェクトを処理
4. **コンパイル時チェック**: TypeScript コンパイラが型の不一致を検出

---

## パフォーマンス特性

**予想レイテンシ**: <100記事で <100ms
**データベースクエリ**: 2クエリ（記事 + タグ）
**キャッシング**: なし（初期実装）
**スケーラビリティ**: ページネーションが必要になるまで ~1000記事をサポート

---

## 将来の拡張（スコープ外）

- ページネーションパラメータ（`offset`, `limit`）
- フィルタリングパラメータ（`tagId`, `authorId`）
- ソートオプション（`newest`, `oldest`, `popular`）
- 検索クエリパラメータ

これらは将来の Issue で追加されます（#32 でページネーション、#17 で検索）。

---

**ステータス**: コントラクトが定義されました。実装の準備ができています。
