---
status: Accepted
date: 2026-03-30
---

# ADR-0006: content sync は単一 CLI 契約を維持し production mirror と local seed を分けて扱う

## Context

- `seeds/content-sync.mjs` の現行 CLI 契約は `pnpm run content -- push <local|prod> [blogs|resume|resume-assets]`、`pnpm run content -- fetch [blogs|resume|resume-assets]`、`pnpm run content -- reset-local` です。
- `blogs` は `portfolio-bucket` と `seeds/blogs`、`resume-assets` は `portfolio-resume-assets` と `seeds/resume-assets` に対応します。
- production R2 との同期は `rclone sync` を使っており、削除を含む exact mirror になります。
- local preview 用の `.wrangler/state` への投入は `wrangler r2 object put --local` をファイルごとに実行する方式で、通常の `push local` では source にないオブジェクトを削除しません。
- ADR-0004 は「対象ごとの専用コマンド群」と「すべての push/fetch が exact mirror」という前提で書かれており、実装と一致しなくなっています。

## Decision

- 公開記事コンテンツの正本は `seeds/blogs`、参考用プロフィール資料の正本は `seeds/resume-assets` とします。
- content sync の公開 CLI 契約は次の 3 つに固定します。
  - `pnpm run content -- push <local|prod> [blogs|resume|resume-assets]`
  - `pnpm run content -- fetch [blogs|resume|resume-assets]`
  - `pnpm run content -- reset-local`
- scope 引数 `resume` と `resume-assets` はどちらも `resumeAssets` を指す alias とします。
- `push prod` と `fetch` は `rclone sync` を使う exact mirror とし、source に存在しないオブジェクトは削除対象に含めます。
- `push local` は `.wrangler/state` に対する additive seed とし、source に存在しないオブジェクトを自動削除しません。
- local preview を source と完全一致に戻したい場合だけ `reset-local` を使い、`.wrangler/state` を削除した後に両 target へ `push local` を実行します。

## Rationale

- 単一の `content` スクリプトに方向と対象を引数で渡す形なら、script 名を増やしすぎずに同期責務をまとめて把握できます。
- production R2 は `rclone sync` で exact mirror を取りやすく、削除を含む配信状態の収束を明示できます。
- local preview は Workers 開発用の一時状態なので、通常更新では additive seed の方が扱いやすく、必要時だけ `reset-local` で全再構築する方が安全です。
- Git 上の差分確認、rename、削除意図をローカルディレクトリ側で判断できるため、production R2 を唯一の編集起点にしない方が運用しやすいです。

## Alternatives Considered

### `push local` も常に exact mirror にする

- local state 側の削除処理や毎回の全再構築が必要になり、通常の preview 更新まで重くなります。
- 現行実装は `reset-local` を明示操作に分けており、その方が意図しない削除を避けやすいため採用しませんでした。

### 対象ごとの npm script を大量に分ける

- `push:blogs:prod` のような名前は明示的ですが、公開 CLI が増え、README と `package.json` の追従コストも上がります。
- 現行実装は 1 つの entrypoint に寄せた方が把握しやすいため採用しませんでした。

### production R2 を唯一の正本にする

- 公開状態との一致は取りやすいですが、ローカルで行った rename や delete の意図を Git 差分として確認しにくくなります。
- ローカルディレクトリ起点の編集フローと噛み合わないため採用しませんでした。

## Consequences

- README、運用メモ、将来の実装は `push local` が prune しないことを前提に説明する必要があります。
- local preview に残骸が残る可能性があるため、状態を揃えたいときは `reset-local` を使う必要があります。
- `push prod` と `fetch` は削除を伴うため、実行前に `seeds/blogs` と `seeds/resume-assets` の内容確認が必要です。
