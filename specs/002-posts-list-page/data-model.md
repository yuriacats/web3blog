# データモデル: ブログ記事一覧ページ

**機能**: 002-posts-list-page
**日付**: 2026-02-10
**目的**: データ構造と検証ルールを定義する

## エンティティ

### PostListItem

リストビューでのブログ記事を表します。

**目的**: リストでの記事表示に必要な基本情報を提供する（タイトル、リンク、タグ）。

**フィールド**:
| フィールド | 型 | 説明 | 検証ルール |
|-----------|-----|------|----------|
| `slug` | string | 記事の一意の識別子（20文字） | 必須、正確に20文字 |
| `title` | string | 記事のタイトル | 必須、最小1文字、最大256文字 |
| `tags` | Tag[] | 記事に関連付けられたタグの配列 | オプション、空の配列も可 |
| `createDate` | Date | 記事の作成タイムスタンプ | 必須、有効な Date オブジェクト |

**関係**:
- PostListItem は多数の Tag を持つ（tag_post テーブル経由の多対多）

**状態遷移**: なし（読み取り専用エンティティ）

**検証スキーマ（Zod）**:
```typescript
const PostListItemSchema = z.object({
  slug: z.string().length(20),
  title: z.string().min(1).max(256),
  tags: z.array(TagSchema),
  createDate: z.coerce.date(),
});
```

---

### Tag

記事のカテゴリーラベルを表します。

**目的**: ユーザーが一目で記事のトピックを理解できるようにする。

**フィールド**:
| フィールド | 型 | 説明 | 検証ルール |
|-----------|-----|------|----------|
| `id` | number | 一意のタグ識別子 | 必須、正の整数 |
| `name` | string | タグの表示名 | 必須、最小1文字、最大20文字 |

**関係**:
- Tag は多数の PostListItem に属する（tag_post テーブル経由の多対多）

**状態遷移**: なし（この機能では読み取り専用）

**検証スキーマ（Zod）**:
```typescript
const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(20),
});
```

---

## データベースクエリ

### クエリ 1: すべての公開記事を取得

```sql
SELECT
  post.id,
  post.slug,
  post.create_date,
  post_revision.title
FROM post
JOIN (
  SELECT post_id, MAX(id) as max_rev_id
  FROM post_revision
  WHERE public = 1
  GROUP BY post_id
) AS latest
ON post.id = latest.post_id
JOIN post_revision
ON post_revision.id = latest.max_rev_id
ORDER BY post.create_date DESC;
```

**戻り値**: `{ id, slug, create_date, title }` の配列

**検証**: データベース結果用の Zod スキーマで解析

---

### クエリ 2: 記事のタグを取得

```sql
SELECT
  tag_post.post_id,
  tag_name.id,
  tag_name.name
FROM tag_post
JOIN tag_name ON tag_post.tag_id = tag_name.id
WHERE tag_post.post_id IN (?, ?, ...);
```

**戻り値**: `{ post_id, id, name }` の配列

**検証**: Zod スキーマで解析し、その後 post_id でグループ化

---

## データフロー

```
データベース（MySQL）
    ↓
[クエリ 1: 記事] → Zod 検証 → Post[]
[クエリ 2: タグ]  → Zod 検証 → { post_id → Tag[] }
    ↓
アプリケーション層（バックエンドリポジトリ）
    ↓
記事とタグをマージ → PostListItem[]
    ↓
tRPC エンドポイント
    ↓
SuperJSON シリアライゼーション（Date オブジェクトを処理）
    ↓
フロントエンド（Next.js Server Component）
    ↓
UI レンダリング
```

---

## 型定義

### バックエンドインターフェース（interface.ts）

```typescript
import { z } from "zod";

export const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(20),
});
export type Tag = z.infer<typeof TagSchema>;

export const PostListItemSchema = z.object({
  slug: z.string().length(20),
  title: z.string().min(1).max(256),
  tags: z.array(TagSchema),
  createDate: z.coerce.date(),
});
export type PostListItem = z.infer<typeof PostListItemSchema>;
```

---

## データベーススキーマ参照

**既存テーブル**（変更なし）:

```sql
CREATE TABLE post(
    id int AUTO_INCREMENT PRIMARY KEY,
    slug varchar(20) UNIQUE NOT NULL,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_revision(
    id int UNIQUE AUTO_INCREMENT PRIMARY KEY,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    title varchar(256) NOT NULL,
    author_id int NOT NULL,
    post_id int NOT NULL,
    public int NOT NULL,  -- 0 = 下書き, 1 = 公開
    post_data MEDIUMTEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post(id)
);

CREATE TABLE tag_name(
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(20) UNIQUE NOT NULL
);

CREATE TABLE tag_post(
    tag_id int NOT NULL,
    post_id int NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tag_name(id),
    FOREIGN KEY (post_id) REFERENCES post(id)
);
```

---

## エッジケース

1. **タグのない記事**: `tags` 配列は空 `[]` になる
2. **複数のリビジョン**: 最新の公開リビジョンのみが取得される
3. **すべての記事が下書き**: 空の配列が返される（UI で空の状態として処理）
4. **非常に長いタイトル**: データベースが256文字制限を強制、Zod が検証

---

**ステータス**: データモデルが定義されました。API コントラクトとクイックスタートガイドの準備ができています。
