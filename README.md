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

`pnpm run content -- ...` で `seeds/` 配下のコンテンツと R2 を同期します。

この CLI が扱う正本は次の 2 つです。

- `seeds/blogs` ↔ `portfolio-bucket`
- `seeds/resume-assets` ↔ `portfolio-resume-assets`

`resume` と `resume-assets` は同じ対象です。scope を省略すると両方を処理します。

### 何をしているか

| コマンド      | 同期元        | 同期先                    | 削除          | 用途                             |
| ------------- | ------------- | ------------------------- | ------------- | -------------------------------- |
| `push local`  | `seeds/...`   | local用 `.wrangler/state` | しない        | ローカル確認用 R2 state を更新   |
| `push prod`   | `seeds/...`   | production R2             | する          | 本番 R2 を正本に合わせる         |
| `fetch`       | production R2 | `seeds/...`               | する          | 本番内容をローカル正本へ取り込む |
| `reset-local` | `seeds/...`   | local用 `.wrangler/state` | 全削除/再投入 | local preview を正本と一致に戻す |

補足:

- `push local` は `wrangler r2 object put --local` をファイルごとに実行する additive update です
- `push prod` と `fetch` は `rclone sync` を使う exact mirror です
- `push` は `fetch` を暗黙実行しません
- rename は「旧パス削除 + 新パス追加」として扱われます

### 対象 scope

| scope           | ローカルディレクトリ  | R2 bucket                 |
| --------------- | --------------------- | ------------------------- |
| `blogs`         | `seeds/blogs`         | `portfolio-bucket`        |
| `resume`        | `seeds/resume-assets` | `portfolio-resume-assets` |
| `resume-assets` | `seeds/resume-assets` | `portfolio-resume-assets` |
| 省略            | 上記 2 つとも         | 上記 2 つとも             |

### コマンド全パターン

```bash
# help
pnpm run content -- help

# local preview 用 R2 state を更新
pnpm run content -- push local
pnpm run content -- push local blogs
pnpm run content -- push local resume
pnpm run content -- push local resume-assets

# production R2 を更新
pnpm run content -- push prod
pnpm run content -- push prod blogs
pnpm run content -- push prod resume
pnpm run content -- push prod resume-assets

# production R2 から seeds/ を再取得
pnpm run content -- fetch
pnpm run content -- fetch blogs
pnpm run content -- fetch resume
pnpm run content -- fetch resume-assets

# local preview 用 R2 state を全再構築
pnpm run content -- reset-local
```

### 典型的な使い方

```bash
# 1) seeds/blogs と seeds/resume-assets を local preview に反映
pnpm run content -- push local

# 2) 内容を確認してから production R2 に反映
pnpm run content -- push prod

# 3) production 側を正としてローカルを復旧したいとき
pnpm run content -- fetch

# 4) local preview に残骸が残っているので state を作り直したいとき
pnpm run content -- reset-local
```

### 注意点

- `push prod` は production R2 から余分なオブジェクトを削除します
- `fetch` は `seeds/blogs` / `seeds/resume-assets` から余分なローカルファイルを削除します
- `push local` は削除しないので、不要ファイルが local preview に残ることがあります
- local preview を正本と完全一致にしたい場合だけ `reset-local` を使います
- `push prod` と `fetch` には `rclone` が必要です
- 現行の `/about` は `resume-assets` 内の `resume/stack.json` をランタイム参照します。公開中の About ページを変更したい場合は `seeds/resume-assets/resume/stack.json` を更新し、必要な sync を実行します
