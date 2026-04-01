---
status: Accepted
date: 2026-04-01
---

# ADR-0007: `/about` のスタック JSON は `RESUME_ASSETS_BUCKET` から実行時取得する

## Context

- `/about` のスタック表示は、当初 `app/features/about-detail-data.ts` のアプリ内構造化データを正本にする方針で固定していました。
- その後、`seeds/resume-assets/resume/stack.json` が作成され、`pnpm run content -- push ...` によって `portfolio-resume-assets` へ同期できる状態になりました。
- 現行の build-time import では、`resume-assets` を更新しても `/about` の公開内容はデプロイし直すまで変わらず、R2 ベースの content sync と公開挙動がずれます。
- 今回は `/posts` と同様に、公開中の `/about` も runtime input を明示し、取得失敗や不正データ時の振る舞いを docs で固定する必要があります。

## Decision

- `/about` の編集起点と同期起点は `seeds/resume-assets/resume/stack.json` とします。
- `/about` の runtime source は `RESUME_ASSETS_BUCKET` とします。
- `/about` が取得するオブジェクトキーは `resume/stack.json` に固定します。
- `app/routes/about/index.tsx` は request ごとに `RESUME_ASSETS_BUCKET` から `resume/stack.json` を取得し、JSON を検証してから feature に渡します。
- JSON 契約は、少なくとも `label` `genre` `frequency` を string で持つ `stacks` 配列とします。
- R2 取得失敗または JSON 検証失敗時、`/about` は `/posts` と同様に fail closed でエラー画面を返します。
- `app/features/about-detail.tsx` と `app/features/about-detail-data.ts` は R2 I/O を持たず、描画と pure logic を担当します。

## Rationale

- `resume-assets` の content sync と公開中 `/about` の入力を一致させることで、`stack.json` 更新が build-time import に埋もれず、運用経路が読みやすくなります。
- `/posts` と同じく route が外部 I/O を持ち、feature が明示入力を受ける形にすると、責務分離とテスト境界が揃います。
- JSON を runtime で検証すれば、R2 上の不正データを静かに握りつぶさず、公開異常として検知できます。

## Alternatives Considered

### `app/features/about-detail-data.ts` の build-time import を維持する

- 実装は単純ですが、`seeds/resume-assets/resume/stack.json` と `portfolio-resume-assets` の運用を持ちながら公開面だけ別経路になります。
- content sync 後も公開中 `/about` に反映されず、更新導線が分断されるため採用しませんでした。

### R2 取得に失敗したら静的 import へ fallback する

- 可用性は上がりますが、どのデータが現在の公開正本なのかが曖昧になります。
- 不正 JSON や同期漏れを見逃しやすくなるため、`/posts` と同じ fail closed 方針を優先して採用しませんでした。

### `resume/stack.json` を `POSTS_BUCKET` に混在させる

- 既存の公開記事系 bucket を流用できますが、記事コンテンツ契約とプロフィール契約が再び混ざります。
- `resume-assets` を別 bucket に分けている意図と運用境界を崩すため採用しませんでした。

## Consequences

- `/about` は `RESUME_ASSETS_BUCKET` と `resume/stack.json` を前提とするため、README、overview、behavior も同じ契約に更新する必要があります。
- `docs/adr/0005-about-stack-data-in-app-code.md` は現行方針ではなくなるため supersede します。
- `/about` には route test、JSON parser の unit test、R2 document helper の adapter test が必要になります。
