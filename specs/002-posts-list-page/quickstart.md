# クイックスタート: ブログ記事一覧ページ

**機能**: 002-posts-list-page
**目的**: 記事一覧機能をローカルで実行してテストする方法

## 前提条件

- Docker と Docker Compose がインストールされている
- Node.js 22.x と pnpm がインストールされている（ローカル開発用）
- プロジェクトの依存関係がインストールされている（`front/` と `backend/` の両方で `pnpm install`）

## 機能の実行

### 1. フルスタックを起動

```bash
# プロジェクトルートから
docker-compose up
```

**起動されるサービス**:
- `db`: MySQL データベース（ポート 3306）
- `backend`: Express + tRPC API（ポート 8000）
- `frontend`: Next.js アプリケーション（ポート 3000）

### 2. データベースの準備を確認

```bash
# データベースにテストデータがあるか確認
docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT COUNT(*) FROM post;"
```

**期待される出力**: 少なくとも1つの記事が表示される

### 3. 記事一覧ページにアクセス

ブラウザで開く: http://localhost:3000/posts

**期待される動作**:
- ブログ記事の一覧が表示される
- 各記事には次が表示される: タイトル（クリック可能なリンク）、タグ
- 記事は新しい順に並んでいる
- 記事がない場合: 「まだ記事がありません」のメッセージ

---

## tRPC エンドポイントを直接テスト

### バックエンド API テスト

```bash
# postsList エンドポイントをテスト
curl -X GET http://localhost:8000/trpc/postsList \
  -H "Content-Type: application/json"
```

**期待されるレスポンス**:
```json
{
  "result": {
    "data": [
      {
        "slug": "ABC123XYZ456DEFGH789",
        "title": "サンプルブログ記事",
        "tags": [
          { "id": 1, "name": "tech" },
          { "id": 2, "name": "tutorial" }
        ],
        "createDate": "2023-06-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

## 開発ワークフロー

### バックエンド開発

```bash
# ターミナル1: バックエンドを開発モードで実行
cd backend
pnpm run dev
```

**バックエンドの実行先**: http://localhost:8000
**ホットリロード**: ts-node 経由で有効

### フロントエンド開発

```bash
# ターミナル2: フロントエンドを開発モードで実行
cd front
pnpm run dev
```

**フロントエンドの実行先**: http://localhost:4000（開発モード）
**ホットリロード**: Next.js 経由で有効

---

## テストの実行

### バックエンドユニットテスト

```bash
cd backend
pnpm test
```

**この機能のテスト**:
- `test/repositories/post.test.ts`: `fetchAllPosts()` 関数のテスト

### フロントエンド手動テスト

1. http://localhost:3000/posts にアクセス
2. 記事一覧が表示されることを確認
3. 記事タイトルをクリック → `/posts/[slug]` に遷移することを確認
4. タグが表示されることを確認
5. 空の状態を確認（一時的にデータベースをクリア）

---

## データベース接続の確認

### MySQL 接続の確認

```bash
# データベースに接続
docker-compose exec db mysql -u backend -ptoor webblog
```

```sql
-- post テーブルを確認
SELECT * FROM post;

-- post_revision テーブルを確認（public カラムをチェック）
SELECT * FROM post_revision;

-- タグを確認
SELECT * FROM tag_name;

-- 記事-タグの関係を確認
SELECT * FROM tag_post;
```

### バックエンドのデータベース接続を確認

```bash
# バックエンドログでデータベース接続を確認
docker-compose logs backend | grep -i mysql
```

**期待される結果**: 接続エラーがない

---

## よくある問題と解決策

### 問題: 「記事がありません」

**原因**: データベースが空か、すべての記事が下書き

**解決策**:
```bash
# 記事が存在するか確認
docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT * FROM post;"

# リビジョンが公開されているか確認
docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT post_id, public FROM post_revision;"

# 必要に応じてテストデータを挿入
docker-compose exec db mysql -u backend -ptoor webblog < db/10_testData.sql
```

### 問題: 「データベースに接続できません」

**原因**: データベースコンテナが実行されていないか、認証情報が間違っている

**解決策**:
```bash
# データベースを再起動
docker-compose restart db

# データベースログを確認
docker-compose logs db

# バックエンドの環境変数を確認
docker-compose exec backend env | grep SQL
```

### 問題: TypeScript エラー

**原因**: 型定義が一致していない

**解決策**:
```bash
# バックエンドをリビルド
cd backend
pnpm run build

# フロントエンドをリビルド
cd front
pnpm run build
```

---

## 機能検証チェックリスト

- [ ] Docker Compose がエラーなしですべてのサービスを起動
- [ ] データベースに少なくとも1つの公開記事が含まれている
- [ ] バックエンドが `http://localhost:8000/trpc/postsList` に応答
- [ ] フロントエンドが `http://localhost:3000/posts` に記事を表示
- [ ] 記事タイトルがクリック可能なリンク
- [ ] 各記事にタグが表示される
- [ ] 記事が新しい順に並んでいる
- [ ] 空の状態が動作する（記事がない場合）
- [ ] TypeScript がエラーなしでコンパイル
- [ ] バックエンドテストが合格

---

## 次のステップ

検証後:
1. `/speckit.tasks` を実行して実装タスクを生成
2. タスクに従って機能を実装
3. 主要な変更後にテストを実行
4. 変更を段階的にコミット

---

**最終更新**: 2026-02-10
