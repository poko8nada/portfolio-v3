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
pnpm run typecheck
pnpm run lint
pnpm run format
pnpm run build
```

## デプロイ

```bash
pnpm run deploy
```

## R2 Seed

```bash
# local R2 (.wrangler/state)
pnpm run seed:r2:local

# production R2 (Cloudflare remote bucket)
pnpm run seed:r2:prod
```
