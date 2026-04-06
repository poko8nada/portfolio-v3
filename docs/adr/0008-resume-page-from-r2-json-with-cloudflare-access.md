---
status: Superseded by ADR-0009
date: 2026-04-04
---

# ADR-0008: `/resume` は `RESUME_ASSETS_BUCKET` の JSON を Cloudflare Access 越しに表示する

## Context

- `issue #13` では、日本で一般的な履歴書フォーマットをベースにした `/resume` ページを追加したい要求があります。
- `/resume` はトップページから導線を置かず、知っている相手だけが直接 URL で開く前提です。
- 履歴書データはアプリコードに埋め込まず、既存の `portfolio-resume-assets` 運用に合わせて R2 を正本にしたい要求があります。
- 一方で、履歴書は公開プロフィールより閉じた情報なので、公開ページと同じ無認証表示にはできません。
- 今回は route、認証境界、R2 object key、失敗時の挙動を先に固定しないと、feature 分割とテスト境界が定まりません。

## Decision

- `/resume` の編集起点と同期起点は `seeds/resume-assets/resume/resume.json` とします。
- `/resume` の runtime source は `RESUME_ASSETS_BUCKET` とします。
- `/resume` が取得するオブジェクトキーは `resume/resume.json` に固定します。
- `/resume` はトップページの導線と `sitemap.xml` から外します。
- `/resume` の閲覧制限は **Cloudflare Access** とし、`docs/adr/0002-in-app-admin-authoring-with-cloudflare-access.md` と同様に Zero Trust アプリケーションまたはルートルールで保護します。Workers アプリ内では HTTP Basic 認証や `RESUME_BASIC_AUTH_*` による認証は行いません。
- 未認証・未許可の閲覧者は Cloudflare がブロックまたはログインへ誘導し、Workers には到達しません。アプリは Access 通過後のリクエストに対してのみ履歴書を返します。
- `app/routes/resume/index.tsx` は request ごとに `RESUME_ASSETS_BUCKET` から `resume/resume.json` を取得し、JSON を検証してから feature に渡します。
- `resume/resume.json` の取得失敗または JSON 検証失敗時、`/resume` は `/about` と同様に fail closed でエラー画面を返します。
- `/resume` は通常表示とブラウザ印刷のどちらでも白背景・黒文字の専用レイアウトを使い、共通の dark theme site chrome に依存しません。
- `/resume` はブラウザ印刷で A4 縦 1 ページずつ自然に改ページされるレイアウトとし、2 ページを並べれば A3 横見開き相当の履歴書として扱いやすい構成にします。
- 履歴書用の写真は同じ `RESUME_ASSETS_BUCKET` 内の object key を JSON から参照し、初期表示はダミー、hover 時にピル型ボタンを表示し、click 後にだけ実画像を表示します。
- 写真アセットだけが取得できない場合はダミー表示に留めてページ全体は継続表示します。

## Runtime Contract

- `resume/resume.json` は top-level object とします。
- top-level object は次のキーを持ちます。
  - `profile`
  - `address`
  - `education`
  - `experience`
  - `licenses`
  - `motivation`
  - `request`
- `profile` は `date`, `nameKana`, `name`, `birthDay`, `gender`, `cellPhone`, `email` を必須にし、`photo` は任意とします。
- `profile.photo` を使う場合は `objectKey` と `alt` を string で持たせます。
- `address` は `zip`, `kana`, `value`, `tel`, `fax` を持つ object とします。
- `contactAddress` は任意で、使う場合は `address` と同じ shape にします。
- `academicBackground` は任意で、使う場合は `degree`, `degreeYear`, `degreeAffiliation`, `thesisTitle` を string で持たせます。
- `education`, `experience`, `licenses`, `awards` は entry array とし、各 entry は `year`, `month`, `value` を string で持ちます。
- 自由記述欄の `teaching`, `affiliatedSociety`, `notices`, `hobby`, `motivation`, `request` は改行を含められる string とします。
- `commutingTime`, `dependents`, `spouse`, `supportingSpouse` は任意の string とします。

## Rationale

- Cloudflare Access を前段に置けば、履歴書用の資格情報を Workers の secrets に載せずに閲覧境界を設けられます。
- `docs/adr/0002-in-app-admin-authoring-with-cloudflare-access.md` と整合し、将来の `/admin/*` と同じ認証基盤で運用できます。
- `RESUME_ASSETS_BUCKET` を正本にすれば、`/about` と同じ content sync の運用線上で履歴書も更新できます。
- route が R2 I/O を持ち、feature が描画と表示状態を持つ形にすると、既存の boundary ルールと整合します。
- JSON 検証失敗を公開異常として扱うことで、不正データを静かに表示しない方針を維持できます。
- dark theme 前提の共通配色や site chrome を外して専用の白紙レイアウトにすると、画面表示と印刷 PDF の両方で履歴書らしい体裁を保ちやすくなります。
- 写真だけは補助的アセットなので、ページ全体を fail closed にせず局所的に degrade したほうが運用しやすくなります。

## Alternatives Considered

### Workers 内で HTTP Basic 認証する

- アプリ単体で完結し、Cloudflare ダッシュボードの Access 設定は不要です。
- ただし履歴書用のユーザー名・パスワードを Workers secrets で管理する必要があり、ローテーションや漏えい時の運用が重くなります。
- 本プロジェクトでは Access と統一する方針のため採用しません。

### 履歴書 JSON を app 内に import する

- 実装は単純ですが、`seeds/resume-assets` と公開中 `/resume` の入力が再び分断されます。
- R2 を正本とする今回の要求と合わないため採用しませんでした。

### `resume/resume.yaml` をそのまま runtime で読む

- 参考実装の YAML に寄せられますが、既存の `/about` は JSON を runtime で検証する方針です。
- 今回は parser と運用を増やさず、構造化 JSON に統一したほうが取り回しやすいため採用しませんでした。

### dark theme の共通レイアウトをそのまま使う

- 既存サイトとの見た目の一貫性は保てますが、履歴書の印刷面では背景色、余白、固定 header/footer がノイズになります。
- `/resume` では閲覧体験より文書体裁を優先したいため採用しませんでした。

## Consequences

- `docs/behavior.md` で JSON 取得失敗、写真欠落時の期待挙動を記録する必要があります。閲覧制限は Cloudflare Access の責務として文書化します。
- Zero Trust で `/resume`（または該当ホスト）向けの Access ポリシーを運用者が設定・更新する必要があります。
- 実装では route test と JSON parser の unit test が必要になります。
- `/resume` はトップページや sitemap の公開導線から外したまま運用する前提になります。
- 共通 renderer をそのまま使えない可能性があるため、`/resume` 用の page chrome 分岐または専用 wrapper が必要になります。

## Initial Implementation Plan

1. `app/routes/resume/index.tsx` を追加し、`resume/resume.json` の取得、JSON 検証、エラー応答、page-level metadata を担当させます。
2. `app/features/resume/` に feature boundary を作り、履歴書本文、写真 reveal、A4 2 ページの画面/印刷レイアウトを閉じ込めます。
3. 既存の `app/lib/r2.ts` の document helper を再利用し、resume 専用 parser は feature 側の pure logic として切ります。
4. `/resume` だけ白背景・黒文字・印刷向け余白になるよう、必要最小限の renderer 分岐または route wrapper を追加します。
5. route test と parser unit test を追加し、JSON failure、写真 fallback、印刷向け page structure を守ります。

## Planned Files

- `app/routes/resume/index.tsx`: `/resume` の route。R2 取得、エラー応答を持つ
- `app/features/resume/index.ts`: feature の公開境界
- `app/features/resume/resume.tsx`: 履歴書ページ本体。白背景・黒文字・印刷用レイアウトを持つ
- `app/features/resume/resume-photo.tsx`: 写真のダミー表示、hover、click 後表示を担当する sub-component
- `app/features/resume/resume-data.ts`: `resume/resume.json` の型定義、検証、正規化を持つ pure logic
- `app/features/resume/resume-data.test.ts`: parser / validator の unit test
- `app/routes/resume/index.test.tsx`: route の feature test
- `app/routes/_renderer.tsx` または route-local wrapper: `/resume` の専用 page chrome を切り替える
