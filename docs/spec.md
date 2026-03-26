---
last-validated: 2026-03-26
phase: current
---

# Specification

## 共通レイアウトと公開導線

### Requirements

- [REQ-001] 閲覧者は、全ページで共通のヘッダーとフッターを通じてホームや主要セクションへ移動できなければならない。
- [REQ-002] 閲覧者は、各ページでそのページを説明するタイトル、説明文、canonical URL、および OGP/Twitter 用メタデータを受け取れなければならない。
- [REQ-003] サイト運営者は、環境変数が設定されている場合のみ GTM を共通レイアウトに埋め込めなければならない。

### Acceptance Criteria

- [REQ-001] Given 任意の公開ページ, When ページが描画される, Then ヘッダーに `About` `Posts` `Tools` への導線が表示される。
- [REQ-001] Given ホーム以外のページ, When `Posts` ナビゲーションを選択する, Then `/posts` に遷移できる。
- [REQ-002] Given 任意の公開ページ, When HTML を確認する, Then canonical URL が末尾スラッシュを除去した現在 URL で出力される。
- [REQ-002] Given 記事詳細ページ以外, When HTML を確認する, Then 共有画像として `/ogp.png` が設定される。
- [REQ-003] Given `GTM_CONTAINER_ID` が未設定, When ページを描画する, Then GTM 用 script と noscript iframe は埋め込まれない。
- [REQ-003] Given `GTM_CONTAINER_ID` が設定済み, When ページを描画する, Then GTM 用 script と noscript iframe が埋め込まれる。

### Edge Cases

- canonical URL は末尾スラッシュのみを正規化し、パス自体は変更しない。
- 記事詳細ページでは共通 OGP 画像を上書きせず、記事固有画像を優先する。

### Why Not

- ページごとに別々のレイアウトを持つ方式: ナビゲーション、計測、メタタグの一貫性を保ちにくいため不採用。

## ホームページ

### Requirements

- [REQ-010] 閲覧者は、ホームページで運営者の自己紹介、外部プロフィール導線、最近の記事、制作物一覧を確認できなければならない。
- [REQ-011] 閲覧者は、ホームページから記事一覧ページへ移動できなければならない。

### Acceptance Criteria

- [REQ-010] Given `/`, When ページを表示する, Then `About` `Posts` `Tools` の 3 セクションが表示される。
- [REQ-010] Given `/`, When `About` セクションを見る, Then GitHub と X/Twitter への外部リンクボタンが表示される。
- [REQ-010] Given `/`, When `Posts` セクションを見る, Then公開記事一覧から最大 3 件が表示される。
- [REQ-010] Given `/`, When `Tools` セクションを見る, Then固定の外部制作物リンク一覧が表示される。
- [REQ-011] Given `/`, When `すべての記事 →` を選択する, Then `/posts` に遷移できる。

### Edge Cases

- 記事一覧の取得に失敗した場合は、記事セクション内にエラー文言が表示される。

### Why Not

- 制作物一覧を CMS 化する方式: 現行実装では固定配列で十分であり、更新対象が少ないため不採用。

## 記事一覧とタグ導線

### Requirements

- [REQ-020] 閲覧者は、`/posts` で公開記事の一覧を更新日時優先の降順で閲覧できなければならない。
- [REQ-021] 閲覧者は、記事に付与されたタグから同一タグの記事一覧へ移動できなければならない。
- [REQ-022] 閲覧者は、タグ絞り込みが有効なとき現在のタグを確認し、解除できなければならない。

### Acceptance Criteria

- [REQ-020] Given `/posts`, When 記事一覧を表示する, Then `updatedAt` があれば `updatedAt`、なければ `createdAt` を用いて新しい順に並ぶ。
- [REQ-020] Given 記事 frontmatter の `isPublished` が `false`, When `/posts` を表示する, Then その記事は一覧に表示されない。
- [REQ-021] Given 記事にタグがある, When タグボタンを選択する, Then `/posts?tag=<tag>` に遷移する。
- [REQ-022] Given `tag` クエリがある, When `/posts` を表示する, Then 選択中タグが表示される。
- [REQ-022] Given `tag` クエリがある, When フィルタ解除ボタンを選択する, Then `/posts` へ遷移して絞り込みが解除される。

### Edge Cases

- 一覧件数制限が使われる箇所では、実装上はタグ絞り込みより先に件数制限が適用される。
- frontmatter が存在しない記事は `Untitled`、`isPublished: false`、空タグ配列として扱われるため、既定では一覧に表示されない。

### Why Not

- 記事本文から動的にタグを推定する方式: frontmatter による明示的管理の方が公開状態と整合しやすいため不採用。

## 記事詳細表示

### Requirements

- [REQ-030] 閲覧者は、`/posts/:slug` で指定記事の本文を HTML として閲覧できなければならない。
- [REQ-031] 閲覧者は、記事詳細ページで記事タイトル、日付、タグ、共有導線、関連記事導線を確認できなければならない。
- [REQ-032] サイトは、公開されていない記事や取得失敗した記事を通常の記事本文として表示してはならない。

### Acceptance Criteria

- [REQ-030] Given R2 に `posts/<slug>.md` が存在する, When `/posts/<slug>` を表示する, Then Markdown が HTML に変換されて本文として描画される。
- [REQ-030] Given 記事 frontmatter に `title` がある, When `/posts/<slug>` を表示する, Then ページタイトルと記事見出しにその値が反映される。
- [REQ-031] Given 記事にタグがある, When 記事詳細を表示する, Then 各タグから `/posts?tag=<tag>` へ移動できる。
- [REQ-031] Given 記事詳細を表示する, When 記事末尾を見る, Then X 共有ボタンと同一記事を除外した `Recent Posts` が最大 3 件表示される。
- [REQ-032] Given slug パラメータが欠落している, When ルート処理が実行される, Then エラー文言を返す。
- [REQ-032] Given R2 取得または Markdown 変換が失敗する, When `/posts/<slug>` を表示する, Then エラー画面を返す。
- [REQ-032] Given `isPublished: false` の記事, When `/posts/<slug>` を表示する, Then 本文ではなく未公開メッセージを返す。

### Edge Cases

- 記事説明文は HTML タグを除去した本文先頭 120 文字を基準に生成され、直近の `。` があればそこまでで切り詰められる。
- 記事用 OGP 画像は `https://image.pokohanada.com/ogp` に `title` と `slug` を渡して生成される。

### Why Not

- HTML コンテンツをそのまま R2 へ保存する方式: 執筆時の可搬性と差分管理のしやすさで Markdown 運用を優先するため不採用。

## コンテンツソース契約

### Requirements

- [REQ-040] コンテンツ管理者は、R2 に保存する Markdown 記事で frontmatter を用いてタイトル、日時、公開状態、タグ、バージョンを定義できなければならない。
- [REQ-041] システムは、frontmatter が不足している場合でも既定値を用いて解釈できなければならない。

### Acceptance Criteria

- [REQ-040] Given Markdown frontmatter, When システムが解析する, Then `title` `createdAt` `updatedAt` `isPublished` `tags` `version` を読み取れる。
- [REQ-041] Given frontmatter がない Markdown, When システムが解析する, Then `title` は `Untitled`、`isPublished` は `false`、`tags` は空配列として扱われる。
- [REQ-041] Given 空文字または空白のみの Markdown, When システムが解析する, Then `Empty markdown content` をエラーとして返す。

### Edge Cases

- `updatedAt` が指定されない場合は実行時点の日時が補われる。
- frontmatter の追加フィールドは保持され、メタデータオブジェクトに残る。

### Why Not

- 厳格な必須 frontmatter 制約で全記事を拒否する方式: 既存コンテンツを壊さず段階的に移行できる余地を残すため不採用。

## 画像アセット配信 API

### Requirements

- [REQ-050] 閲覧者は、`/api/*` 経由で R2 上の画像やその他アセットを取得できなければならない。
- [REQ-051] システムは、アセット配信時にキャッシュ状態とブラウザ向けキャッシュ方針を応答ヘッダーで示さなければならない。
- [REQ-052] システムは、存在しないアセットを 404 として扱わなければならない。

### Acceptance Criteria

- [REQ-050] Given `/api/images/test.png` への要求と対応する R2 オブジェクト, When 取得に成功する, Then オブジェクト本体をレスポンスとして返す。
- [REQ-051] Given アセット取得に成功する, When レスポンスを確認する, Then `X-Cache` ヘッダーに `HIT` または `MISS` が設定される。
- [REQ-051] Given アセット取得に成功する, When レスポンスを確認する, Then `Cache-Control: public, max-age=604800` が設定される。
- [REQ-051] Given R2 オブジェクトに `Content-Type` と `ETag` がある, When レスポンスを確認する, Then それらが引き継がれる。
- [REQ-052] Given 対応する R2 オブジェクトがないか取得時にエラーが起きる, When `/api/...` を要求する, Then 404 を返す。

### Edge Cases

- ルートは `/api/` 接頭辞を取り除いた残りのパスをそのまま R2 キーとして扱う。
- ネストされたパスもそのまま解決対象になる。

### Why Not

- 画像を `public/` のみで配信する方式: 記事本文から参照する可変アセットを同じストレージ境界で扱えないため不採用。

## サイトマップとエラー応答

### Requirements

- [REQ-060] 検索エンジンは、`/sitemap.xml` から公開ルートと記事詳細ルートの一覧を取得できなければならない。
- [REQ-061] 閲覧者は、存在しないページで 404 画面、想定外エラー時に 500 画面を受け取れなければならない。

### Acceptance Criteria

- [REQ-060] Given `/sitemap.xml`, When レスポンスを取得する, Then 通常ルートと公開記事 slug から生成された URL 一覧を含む XML が返る。
- [REQ-060] Given `/sitemap.xml`, When ルート一覧を作成する, Then API ルート、テストファイル、動的プレースホルダ、特別な内部ルートは除外される。
- [REQ-061] Given 未定義ルート, When アクセスする, Then `404 Not Found` を示す画面が返る。
- [REQ-061] Given 未処理の内部エラー, When 画面表示に失敗する, Then `500 Internal Server Error` を示す画面が返る。

### Edge Cases

- サイトマップの `lastmod` は生成時点の日付で統一される。
- サイトマップではトップページの `changefreq` は `daily`、それ以外は `weekly` として出力される。

### Why Not

- 手書きの固定サイトマップを維持する方式: 公開記事の追加漏れを防ぎにくいため不採用。

## 次フェーズの要求（prod1 計画）

### Requirements

- [REQ-100] 管理者は、`/admin/*` 配下の管理画面に認証付きでアクセスできなければならない。
- [REQ-101] 管理者は、既存 R2 バケット上の記事を作成、編集、削除できなければならない。
- [REQ-102] 管理者は、公開ページと同一の Markdown レンダラーで保存前プレビューを確認できなければならない。
- [REQ-103] 閲覧者は、コードブロックや安全化された外部リンクを含む拡張 Markdown 表示を受け取れなければならない。
- [REQ-104] システムは、リンクカード、TOC、sanitize など将来拡張を段階導入できなければならない。

### Acceptance Criteria

- [REQ-100] Given `/admin/*` へのアクセス, When Cloudflare Access で未認証と判定される, Then 管理画面本体は返らず拒否レスポンスとなる。
- [REQ-100] Given `/admin/*` へのアクセス, When Access 通過後に追加検証が必要な構成を選ぶ, Then Workers 側で `cf-access-jwt-assertion` を検証できる。
- [REQ-101] Given 管理画面から新規記事を作成する, When 保存に成功する, Then 対応する Markdown は既存 `POSTS_BUCKET` に保存される。
- [REQ-101] Given 既存記事を編集または削除する, When 操作に成功する, Then 公開一覧と公開詳細に結果が反映される。
- [REQ-102] Given 管理画面で Markdown を編集中, When 本文や frontmatter を更新する, Then 同じレンダラーでプレビューが更新される。
- [REQ-103] Given 公開記事に fenced code block や外部リンクが含まれる, When 記事を表示する, Then 既存ダークテーマに整合した形で表示される。
- [REQ-104] Given リンクカード対象の URL または記法, When OGP 取得に成功する, Then カード UI が表示される。
- [REQ-104] Given リンクカードの OGP 取得に失敗する, When 記事を表示する, Then 通常リンクへフォールバックする。

### Edge Cases

- 管理画面導入後も、公開ルートと同じ R2 バケットを使う前提は維持する。
- 管理画面の責務は記事運用に限定し、会員機能や一般ユーザー向け認証には拡張しない。
- Markdown 拡張は段階導入し、sanitize 設定によって既存記事表示が壊れないことを優先する。
- OGP 取得を伴う機能は、ドメイン制限、タイムアウト、サイズ制限を前提にする。

### Why Not

- 別の CMS や別サービスを立てて管理画面を構築する方式: 現行の R2 ベース運用と配信基盤から離れ、保守対象が増えるため不採用。
- データベースへ記事ソースを移す方式: 現行の Markdown 差分管理と R2 同期の運用利点を失うため不採用。
