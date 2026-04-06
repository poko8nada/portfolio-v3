status: Superseded by ADR-0010
date: 2026-04-04
---

# ADR-0009: `/resume` は専用 asset route と privacy overlay を使う

## Context

- `issue #13` では `/resume` を `RESUME_ASSETS_BUCKET` の `resume/resume.json` から表示する要求があります。
- ADR-0008 では履歴書写真を hover / click で個別表示する前提でしたが、実際に保護したい対象は写真だけでなく履歴書全体です。
- `/resume` は Cloudflare Access の保護下に置く前提ですが、運用が path 単位になる場合は本文 route だけでなく画像 route も同じ境界に含めないと private asset が別経路で読めてしまいます。
- 現在のサイトは画像配信を app 内 API route 経由に寄せており、履歴書用アセットも同じ方針に揃えたほうが `app/lib/r2.ts` の `getAsset()` を再利用しやすくなります。
- `seeds/resume-assets/resume/resume.json` の shape も実装途中で更新され、ADR-0008 の Runtime Contract と差分が生まれました。

## Decision

- `/resume` の編集起点と同期起点は引き続き `seeds/resume-assets/resume/resume.json` とします。
- `/resume` の runtime source は引き続き `RESUME_ASSETS_BUCKET` とし、document object key は `resume/resume.json` に固定します。
- 履歴書用画像は公開 R2 URL を直接使わず、`/api/resume-assets/<objectKey>` の専用 route 経由で配信します。
- `profile.photo.objectKey` は `RESUME_ASSETS_BUCKET` 内の full object key をそのまま持つ string とします。例: `resume/profile/main.webp`
- Cloudflare Access の保護対象は `/resume` だけでなく `/api/resume-assets/*` も含めます。Workers アプリ内では HTTP Basic 認証を行いません。
- `/resume` は初期表示でページ全体に privacy overlay を重ね、明示ボタン押下後に browser 標準の confirm を通過した場合のみ本文を表示します。
- overlay の解除状態は `sessionStorage` に保存し、同一ブラウザ session の再表示では維持します。
- ブラウザ印刷では overlay を自動解除しません。印刷結果はその時点の表示状態をそのまま反映します。
- 写真アセットだけが欠落した場合はダミー表示に留め、ページ全体は継続表示します。
- `/resume` はトップページの導線と `sitemap.xml` から外したまま運用します。
- `/resume` は通常表示と印刷表示のどちらでも白背景・黒文字の専用レイアウトを使い、既存の dark theme site chrome に依存しません。

## Runtime Contract

- `resume/resume.json` は top-level object とします。
- top-level object の必須キーは次の通りです。
  - `profile`
  - `address`
  - `education`
  - `experience`
  - `licenses`
  - `motivation`
  - `request`
- top-level object の任意キーは次の通りです。
  - `contactAddress`
  - `academicBackground`
  - `awards`
  - `teaching`
  - `affiliatedSociety`
  - `commutingTime`
  - `supporting`
  - `extraSkills`
  - `hobby`
- `profile` は `date`, `nameKana`, `name`, `birthDay`, `age`, `gender`, `cellPhone`, `email` を必須にし、`photo` は任意とします。
- `profile.photo` を使う場合は `objectKey` と `alt` を string で持ちます。`objectKey` は full object key です。
- `address` と `contactAddress` は `zip`, `kana`, `value`, `tel`, `fax` を持つ object とします。
- `academicBackground` は `degree`, `degreeYear`, `degreeAffiliation`, `thesisTitle` を string で持つ object とします。
- `education`, `licenses`, `awards` は entry array とし、各 entry は `year`, `month`, `value` を string で持ちます。
- `experience` は entry array とし、各 entry は `year`, `month`, `value`, `detail` を string で持ちます。
- `teaching`, `affiliatedSociety`, `commutingTime`, `hobby`, `motivation`, `request` は string とします。
- `supporting` を使う場合は `dependents`, `spouse`, `supportingSpouse` を string で持つ object とします。
- `extraSkills` を使う場合は string array とします。

## Rationale

- 履歴書全体に overlay を掛ける形なら、写真だけでなく本文全体を一段階隠せるため、private document を開く体験として意図が明確になります。
- 画像を `/api/resume-assets/*` へ寄せれば、既存の asset 配信パターンと揃い、`app/lib/r2.ts` の cache / metadata 処理をそのまま再利用できます。
- path 単位で Access を掛ける運用でも、本文 route と画像 route を同じ境界に含めれば private asset の抜け道を作らずに済みます。
- `sessionStorage` にだけ解除状態を持たせれば、同一 session では再確認を避けつつ、永続保存はしない privacy 寄りの挙動にできます。
- print 時に自動解除しない方針なら、ユーザーが表示したつもりのない個人情報が印刷で露出する経路を増やさずに済みます。
- seed JSON の shape をそのまま Runtime Contract に昇格させると、source of truth と parser 契約のズレを減らせます。

## Alternatives Considered

### R2 の公開 URL を `img src` に直接入れる

- 実装は単純ですが、path 単位で Access を運用する場合に画像だけ別経路で読める余地が生まれます。
- 既存サイトの asset 配信パターンとも揃わないため採用しません。

### 写真だけ hover / click で reveal する

- 実装負荷は低いですが、履歴書本文は常時見えてしまい、private document を一段階隠す今回の目的と合いません。
- 写真 UX と privacy 制御が混ざるため採用しません。

### print 時だけ overlay を自動解除する

- 印刷 UX は上がりますが、表示していない個人情報が print だけで露出する経路になります。
- privacy 優先の要求と逆行するため採用しません。

## Consequences

- `docs/behavior.md` では overlay、confirm、`sessionStorage`、画像欠落時のフォールバック、Access の保護対象 path を反映する必要があります。
- Zero Trust の運用者は `/resume` に加えて `/api/resume-assets/*` も保護対象に含める必要があります。
- 実装では route test と parser unit test に加え、resume assets route の feature test を追加する余地があります。
- feature の責務は写真 reveal からページ全体の表示ゲートへ寄るため、`ResumePhoto` より `Resume` 本体または専用 island の state 管理が主になります。

## Initial Implementation Plan

1. `seeds/resume-assets/resume/resume.json` を正本として parser 契約と unit test を更新します。
2. `app/routes/api/resume-assets/[...path].ts` を追加し、`RESUME_ASSETS_BUCKET` と `getAsset()` を使って履歴書用アセットを返します。
3. `app/routes/resume/index.tsx` と `app/features/resume/` を更新し、privacy overlay、confirm、`sessionStorage`、写真 fallback を実装します。
4. `/resume` の専用 renderer 分岐、sitemap 除外、behavior docs、issue #13 を新仕様に同期します。

## Planned Files

- `app/routes/resume/index.tsx`: `/resume` の route。R2 取得、JSON 検証、エラー応答を持つ
- `app/features/resume/index.ts`: resume feature の公開境界
- `app/features/resume/resume.tsx`: 履歴書本文、overlay、表示状態を持つ
- `app/features/resume/resume-photo.tsx`: 写真表示と欠落時 fallback を持つ sub-component
- `app/features/resume/resume-data.ts`: `resume/resume.json` の型定義、検証、正規化を持つ pure logic
- `app/features/resume/resume-data.test.ts`: parser / validator の unit test
- `app/routes/resume/index.test.tsx`: `/resume` route の feature test
- `app/routes/api/resume-assets/[...path].ts`: `RESUME_ASSETS_BUCKET` から private asset を返す
- `app/routes/api/resume-assets/[...path].test.ts`: resume assets route の feature test
- `app/routes/_renderer.tsx`: `/resume` の専用 page chrome を切り替える
