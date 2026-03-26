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
pnpm vitest run
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

## R2 Seed

```bash
# local R2 (.wrangler/state)
pnpm run seed:r2:local

# production R2 (Cloudflare remote bucket)
pnpm run seed:r2:prod
```
