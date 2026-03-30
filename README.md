# portfolio-v3

HonoX + Cloudflare Workers + R2 で構築したポートフォリオサイトです。

## セットアップ

```bash
pnpm install
```

## 開発/検証コマンド

```bash
pnpm run dev
pnpm run test
pnpm run test:run
pnpm run typecheck
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run format:check
pnpm run build
```

## デプロイ

```bash
pnpm run deploy:staging
pnpm run deploy:prod
```

## Content Sync

`pnpm run content` のみ。続けてサブコマンドを渡します（`--` の後が `node seeds/content-sync.mjs` に渡ります）。

```bash
# 1) local preview 用 R2 state を更新（blogs と resume-assets の両方）
pnpm run content -- push local

# 2) production R2 を更新（両方）
pnpm run content -- push prod

# 3) production からローカル source を再取得（復旧・初期化時、両方）
pnpm run content -- fetch
```

`push` は `fetch` を暗黙実行しません。

現行の `/about` は `resume-assets` をランタイムでは参照しません。`resume-assets` の同期は参考用プロフィール資料の保管用途であり、公開中の About ページを変更したい場合は `app/features/about-detail-data.ts` を更新します。

```bash
# local R2 state を空から再構築してから push local（両方）
pnpm run content -- reset-local

pnpm run content -- help
```

単体だけ触りたいとき（第3引数は `blogs` / `resume` / `resume-assets`）:

```bash
pnpm run content -- push local blogs
pnpm run content -- fetch resume
```
