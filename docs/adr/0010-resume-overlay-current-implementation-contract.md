---
status: Accepted
date: 2026-04-04
---

# ADR-0010: `/resume` の overlay は非永続な client-side reveal とする

## Context

- ADR-0009 では `/resume` の privacy overlay 解除状態を `sessionStorage` に保存する前提でした。
- その後の実装では、履歴書本文の見た目や既存 `resume.tsx` の構造を大きく崩さないことを優先し、`Resume` 本体は server render のまま、overlay だけを island として足す形に寄せました。
- 現在のコードでは `app/routes/resume/index.tsx` が `ResumeOvarlay` と `Resume` を同時に render し、`Resume` は `id="resume-content"` と `hidden` 属性を持つ DOM を返しています。
- docs とテストはこの実装差分を反映しないと、「保存される reveal 状態」や「print 時の扱い」について誤読を招きます。

## Decision

- `/resume` は `app/routes/resume/index.tsx` で overlay island と本文の両方を返します。
- 本文 root は `app/features/resume/resume.tsx` の `id="resume-content"` を持つ要素とし、初期 render では `hidden` を付けます。
- overlay は `app/islands/resume-overlay.tsx` が担当し、browser 標準 `confirm` を通過したときだけ本文の `hidden` を外します。
- overlay の演出は local component state のみで扱い、0.4 秒の fade 後に overlay を消します。
- overlay の解除状態は `sessionStorage` や `localStorage` に保存しません。リロード時は再び overlay を表示します。
- print 専用の追加制御は持たず、その時点で DOM に表示されている状態をそのまま印刷します。
- 履歴書用画像は引き続き `/api/resume-assets/<objectKey>` から取得します。
- 写真アセットが未設定、または取得失敗した場合は placeholder を表示し、ページ全体は継続表示します。
- Cloudflare Access による保護対象は引き続き `/resume` と `/api/resume-assets/*` を含みます。

## Runtime Contract

- `resume/resume.json` の source of truth は引き続き `seeds/resume-assets/resume/resume.json` とします。
- `profile` は `date`, `nameKana`, `name`, `birthDay`, `age`, `gender`, `cellPhone`, `email` を必須とします。
- `profile.photo` は任意で、使う場合は `objectKey` と `alt` を string で持ちます。
- `address` は `zip`, `kana`, `value`, `tel`, `fax` を string で持ちます。
- `contactAddress`, `academicBackground`, `teaching`, `affiliatedSociety`, `commutingTime`, `hobby`, `extraSkills` は任意とします。
- `education`, `experience`, `licenses`, `awards` は array とし、現行 parser は各 entry の `year`, `month`, `value` を string として検証します。`experience.detail` は表示で利用します。
- `supporting` は `dependents`, `spouse`, `supportingSpouse` を string で持ちます。
- `motivation`, `request` は必須 string とします。

## Rationale

- 現行 `resume.tsx` は履歴書の見た目を既に組み上げており、overlay 制御だけを外から足す方が本文レイアウトの読解コストを増やさずに済みます。
- reveal を永続化しない方針なら、client-side state だけで完結し、既存の island パターンに収まりやすくなります。
- `hidden` を外すだけの制御なら route や parser に追加責務を持ち込まずに済みます。
- `/api/resume-assets/*` を使う current implementation は、既存の `getAsset()` 再利用と Cloudflare Access の保護境界に整合します。

## Alternatives Considered

### `sessionStorage` に reveal 状態を保存する

- 同一 session での再確認を減らせますが、現行実装では履歴書本文の描画責務と overlay state を密結合させやすく、本文を極力触らない方針と噛み合いません。
- current implementation は非永続を採用します。

### 初回レスポンスに本文を含めず、解除後に別 route から本文を fetch する

- privacy 境界としては強くなりますが、現在の server-rendered な履歴書本文と route 構成を大きく組み替える必要があります。
- 今回は current implementation を docs に同期する目的のため採用しません。

## Consequences

- `docs/behavior.md` では reveal 非永続、confirm、fade、`hidden` の切り替えを current behavior として記録する必要があります。
- resume route の feature test は、overlay 文言に加えて本文 root が `hidden` で render されることを確認すると current behavior を守りやすくなります。
- この overlay は Access とは別の閲覧 UX であり、HTML を秘匿する追加認証境界ではありません。

## Initial Implementation Plan

1. `app/features/resume/resume-data.ts` と parser test を現行 JSON shape に合わせます。
2. `app/routes/api/resume-assets/[...path].ts` と route test を追加し、履歴書画像を `RESUME_ASSETS_BUCKET` から返します。
3. `app/islands/resume-overlay.tsx` と `app/features/resume/resume.tsx` を組み合わせ、本文レイアウトを崩さずに overlay reveal を実装します。
4. `docs/behavior.md` と ADR を current implementation に同期します。

## Planned Files

- `app/routes/resume/index.tsx`: overlay island と履歴書本文を束ねる route
- `app/features/resume/resume.tsx`: 履歴書本文本体。`resume-content` root と既存レイアウトを持つ
- `app/islands/resume-overlay.tsx`: confirm、fade、`hidden` の切り替えを持つ island
- `app/islands/resume-photo.tsx`: 写真表示と placeholder fallback を持つ island
- `app/features/resume/resume-data.ts`: `resume/resume.json` の型定義と parser
- `app/features/resume/resume-data.test.ts`: parser unit test
- `app/routes/resume/index.test.tsx`: `/resume` route の feature test
- `app/routes/api/resume-assets/[...path].ts`: 履歴書用 asset route
- `app/routes/api/resume-assets/[...path].test.ts`: asset route test
