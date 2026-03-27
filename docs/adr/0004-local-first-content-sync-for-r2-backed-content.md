---
status: Accepted
date: 2026-03-27
---

# ADR-0004: R2 配信コンテンツはローカル正の push/fetch ワークフローで同期する

## Context

現行のコンテンツ同期コマンドは `sync:r2`、`seed:r2:local`、`seed:r2:prod` という名前ですが、実際には production R2 からローカルへ取得した後に local `.wrangler/state` または production R2 へ再投入する 2 段階の処理を含んでいます。

さらに `seeds/r2.mjs` は、`blogs` 相当の公開記事コンテンツと `resume-assets` を同じ再帰 upload ロジックで扱い、`--local` / `--prod` の target 切り替えも 1 ファイルに集中していました。

この状態では、どのディレクトリが source of truth なのか、どのコマンドが fetch でどのコマンドが push なのか、削除を含む exact mirror がどこで保証されるのかが読み取りづらく、継続運用の判断コストが高くなっていました。

## Decision

公開記事および記事用アセットの source of truth は `seeds/blogs` とします。

about 用プロフィール資料の source of truth は `seeds/resume-assets` とします。

`POSTS_BUCKET` の実体である `portfolio-bucket` は `seeds/blogs` と対応させます。

`RESUME_ASSETS_BUCKET` の実体である `portfolio-resume-assets` は `seeds/resume-assets` と対応させます。

通常運用の書き込みコマンドは、以下の explicit push コマンドに分けます。

- `push:blogs:local`
- `push:blogs:prod`
- `push:resume-assets:local`
- `push:resume-assets:prod`
- `push:content:local`
- `push:content:prod`

production R2 からローカルディレクトリへ戻す処理は bootstrap / recovery 用の explicit fetch コマンドとして分けます。

- `fetch:blogs:prod`
- `fetch:resume-assets:prod`
- `fetch:content:prod`

`push:*` コマンドは事前に `fetch:*` を暗黙実行しません。

`push:*` と `fetch:*` は、対象 bucket/state を source の完全ミラーへ収束させる責務を持ち、source に存在しないファイルやオブジェクトは削除対象に含めます。

production R2 との exact mirror には `rclone` を使います。

local preview 用の `.wrangler/state` は Cloudflare Workers のローカル状態であり production R2 と同一の接続面ではないため、Wrangler R2 CLI を使って明示的に再構築します。

local state の全再構築用に `reset:content:local` を持ち、`.wrangler/state` を削除した後に `push:content:local` を実行します。

## Rationale

ローカルディレクトリを編集起点に固定すれば、Markdown やアセットの差分確認、rename、削除意図を Git とファイル操作の文脈で把握できます。

`fetch` と `push` を別名にし、`blogs` と `resume-assets` を別責務に分けることで、コマンド名だけで同期方向と対象が判断できます。

production R2 は `rclone` によるディレクトリ同期と相性が良く、一方で local `.wrangler/state` は Workers 開発用のローカル実体なので、同じ仕組みに無理に寄せるより役割に応じて使い分けた方が読みやすさと運用確実性が高くなります。

exact mirror を標準にすれば、「source にはもう存在しないが target にだけ残る」オブジェクトを放置しにくくなり、公開面とローカル preview 面の両方で意図しない残骸を減らせます。

## Alternatives Considered

### `seed:r2:*` を維持しつつ説明だけ補う

既存のファイルやコマンド数を大きく変えずに済みますが、fetch と push が同じ名前空間に混ざったままです。

`seeds/r2` という曖昧なディレクトリ名も残り、fresh な実装者が source of truth を誤読しやすいため採用しませんでした。

### production R2 を唯一の正として、毎回 fetch を前提にする

公開面との一致を取りやすい利点はありますが、ローカルで行った rename や delete の意図が push 前に打ち消されやすくなります。

また、push コマンド単体の責務が読めなくなり、ローカル編集を起点にした差分確認フローとも噛み合わないため採用しませんでした。

### `blogs` と `resume-assets` を同じ script にまとめたまま target だけ分ける

実装ファイル数は少なくできますが、公開記事系とプロフィール資料系の同期責務が再び 1 箇所に集まります。

ADR-0003 で分けたストレージ境界を運用コマンド側で曖昧にしたくないため採用しませんでした。

## Consequences

`package.json`、README、seed/sync 用スクリプト、ローカルディレクトリ名を今回の命名へ揃える必要があります。

production push/fetch は削除を含むため、実行前にローカルディレクトリの内容確認がより重要になります。

local `.wrangler/state` も exact mirror を前提に再構築されるため、preview 用の残骸が残りにくくなる一方、手元の source ディレクトリにないファイルは維持されません。
