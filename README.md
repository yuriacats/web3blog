# web3blog
このアプリは以下でホストしています。
https://blog.yuriacats.net

WEB三層構造・AWS・CI/CDを理解するために作ったアプリケーションです。

## 前提条件

- **Node.js 22.x LTS**
- **pnpm** (enabled via corepack: `corepack enable pnpm`)
- Docker & Docker Compose

## 開発
dev-container上での開発を想定しています。

### 構成

含まれるアプリケーション
  - [バックエンド](backend)
  - [フロントエンド](front)
  - [インテグレーションテスト](integration)
  - [テスト用DB](db)

### ローカルでの実行手順

```bash
docker-compose build
docker-compose up
```

### 統合テストの実行手順
```bash
./exec_integration.sh
```

### デバック時・コードリーディング時の手順
```devcontainer
cd front && npm install && cd ../
cd backend && npm install && cd ../
```
