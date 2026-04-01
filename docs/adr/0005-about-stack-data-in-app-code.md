---
status: Superseded by ADR-0007
date: 2026-04-01
---

# ADR-0005: `/about` のスタックデータはアプリ内の構造化データを正本にする

## Context

- `/about` の初版は `RESUME_ASSETS_BUCKET` から `resume/stack.md` を取得し、Markdown を HTML に変換して表示していました。
- しかし今回の `/about` では、スタック項目を `ジャンル順` と `習熟度順` で切り替えて表示し、各項目を pill-shaped の簡易ラベルとして見せる必要があります。
- この UI は、本文をそのまま表示するページではなく、各項目が少なくとも `label` `genre` `frequency` を持つ構造化データを前提にします。
- また、`/about` が外部 R2 オブジェクトの取得や Markdown 変換失敗に引きずられると、固定的なプロフィール情報を見せるページとしては故障点が増えます。

## Decision

- `/about` の現行スタックデータの正本は、アプリケーションコード内に置きます。
- 具体的には `app/features/about-detail-data.ts` に、少なくとも `label` `genre` `frequency` を持つ配列を定義します。
- `/about` は `resume/stack.md` を実行時に取得せず、`RESUME_ASSETS_BUCKET` をランタイム入力として扱いません。
- `/about` の並び替えモードは query parameter `sort` で表し、値は `genre` または `frequency` に固定します。
- `sort` が省略された場合、または不正な値だった場合は `genre` を既定値として扱います。

## Rationale

- アプリ内データを正本にすれば、`/about` の必要フィールドを型とデータ形状で明示でき、グルーピング UI を安定して実装できます。また、固定的なプロフィール情報の表示で外部ストレージ取得や Markdown 変換を必須にしないため、故障点を減らせます。
- 今回のデータ規模では、別の変換パイプラインや同期ステップを追加するより、更新箇所を 1 つの feature 境界に閉じ込めた方が理解しやすさが高いと判断しました。

## Alternatives Considered

### `resume/stack.md` を実行時に取得してそのまま HTML 化する

- 既存実装を流用できますが、`ジャンル順` と `習熟度順` の切り替えに必要なデータ契約が Markdown 本文の解釈に埋もれます。また、R2 取得や Markdown 変換失敗がそのまま `/about` の表示失敗につながるため採用しませんでした。

### `resume/stack.md` から JSON を生成して読み込む

- Markdown を編集起点として維持できる利点はありますが、生成タイミング、差分の持ち方、生成物の正本がどちらかという新しい運用ルールが必要になります。今回の項目数では、その複雑さに対する利得が小さいため採用しませんでした。

### JSX 内に表示用マークアップを直接ハードコードする

- 実装は速いですが、`ジャンル` と `習熟度` の切り替えで同じ項目集合を別順序で扱うときに、データと表示が分離されていないと更新漏れを起こしやすくなります。
- 項目配列を分離した方が、UI とデータ変更理由を切り分けやすいため採用しませんでした。

## Consequences

- `app/routes/about/index.tsx` は R2 ローダーや Markdown パーサーへの依存を外し、query parameter `sort` の解決とページメタデータを主に担当します。
- `app/features/about-detail.tsx` は HTML 本文描画ではなく、構造化データをグループ表示する feature-owned UI に変わります。
- `RESUME_ASSETS_BUCKET` と `resume/stack.md` は `/about` の現行ランタイム契約から外れるため、関連 docs は「参考資料」であることを明記する必要があります。
