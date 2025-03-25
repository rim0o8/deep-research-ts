# ChatGPT風Webアプリケーション

Next.jsで構築されたChatGPT風のWebアプリケーションです。バックエンドを差し替え可能な抽象化された設計になっています。

## 機能

- チャットインターフェース
- 会話履歴の保存と管理
- コードのシンタックスハイライト
- マークダウン対応
- レスポンシブデザイン
- ダークモード対応

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- NextAuth.js (認証)

## 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```
# NextAuth.js設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api


## 開発モード

開発モードでは、実際のバックエンドがなくてもモックサービスを使用してアプリケーションを動作させることができます。

```bash
# モックモードを有効にする
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_USE_MOCK_AUTH=true

# 開発サーバーを起動
npm run dev
```

## 本番モード

本番環境では、実際のバックエンドAPIに接続します。

```bash
# モックモードを無効にする
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_USE_MOCK_AUTH=false

# 本番ビルドを作成
npm run build

# 本番サーバーを起動
npm start
```

## サービス抽象化

このアプリケーションは以下のサービスを抽象化しています：

1. **ChatService** - チャットAPIとの通信を担当
2. **AuthService** - 認証機能を担当
3. **StorageService** - 会話履歴の保存を担当

各サービスには本番実装とモック実装があり、環境変数によって切り替えることができます。

## カスタマイズ

バックエンドを独自のAPIに接続するには、`src/lib/services/chat-service.ts`の`ProductionChatService`クラスを修正してください。

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- build the project:

```bash
bun run build
```

/
