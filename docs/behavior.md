---
last-validated: 2026-04-04
---

# Behavior

## 共通レイアウト

- **テストタイプ**: 不要
- **テストファイル**: 不要
- **補足**: `_renderer.tsx` の条件分岐が小さく、canonical URL と GTM の埋め込み条件はコードから直接読み取れる

## トップページ

- **テストタイプ**: `feature`
- **テストファイル**: 未作成
- **正常系**:
  - `/` にアクセス → 自己紹介、外部リンク、`/about` への導線、最新 3 件の記事、制作物リンクを表示する
- **異常系**:
  - 記事一覧の取得に失敗 → About / Tools は表示を続けつつ、Posts セクションにはエラー文言を表示する

## About 詳細ページ

- **テストタイプ**: `feature`, `unit`
- **テストファイル**: `app/routes/about/index.test.tsx`, `app/features/about-detail-data.test.ts`, `app/lib/r2.test.ts`
- **正常系**:
  - `/about` または `/about?sort=genre` → `RESUME_ASSETS_BUCKET` の `resume/stack.json` を読み、ジャンル見出しごとにスタックを表示する
  - `/about?sort=frequency` → `Daily` / `Often` / `Sometimes` の順で表示する
- **異常系**:
  - `sort` が未指定または不正 → `genre` を既定値として扱ってページを表示する
  - `resume/stack.json` の取得に失敗、または JSON 形式が不正 → エラー画面を返す

## Resume ページ

- **テストタイプ**: `feature`, `unit`
- **テストファイル**: `app/routes/resume/index.test.tsx`, `app/features/resume/resume-data.test.ts`
- **補足**: 閲覧制限は Cloudflare Access（Zero Trust）で行い、未認証・未許可のトラフィックは Workers に到達する前にブロックまたはログインへ誘導される。path 単位で運用する場合は `/resume` と `/api/resume-assets/*` を同じ保護対象に含める。アプリは HTTP Basic 認証を行わない。
- **正常系**:
  - Cloudflare Access を通過した状態で `/resume` にアクセス → `RESUME_ASSETS_BUCKET` の `resume/resume.json` を読み、日本の一般的な履歴書として白背景・黒文字で表示する
  - 初期表示 → `resume-content` を `hidden` のまま出し、ページ全体に privacy overlay を重ねる
  - privacy overlay のボタン押下 → browser 標準 confirm を通過したときだけ、0.4 秒の fade 後に `resume-content` の `hidden` を外して本文を表示する
  - ブラウザ印刷 → その時点で表示されている DOM をそのまま印刷する
- **異常系**:
  - `resume/resume.json` の取得に失敗、または JSON 形式が不正 → エラー画面を返す
  - 写真アセットが未設定、または取得に失敗 → ダミー表示を維持し、ページ全体は表示を続ける
  - confirm をキャンセルしたまま表示を続ける → overlay を維持し、本文は hidden のままにする

## 記事一覧

- **テストタイプ**: `feature`
- **テストファイル**: 未作成
- **正常系**:
  - `/posts` → 公開済みかつメタデータを解釈できた記事を新しい順で表示する
  - `/posts?tag=<tag>` → そのタグを持つ記事だけを表示する
- **異常系**:
  - 一覧取得に失敗 → エラー文言を表示する
  - 個別記事のメタデータ解析に失敗 → その記事だけ一覧から除外する

## 記事詳細

- **テストタイプ**: `feature`
- **テストファイル**: 未作成
- **正常系**:
  - `/posts/<slug>` で公開済み記事が存在 → Markdown を表示し、OGP 用 meta、X 共有導線、関連記事 3 件を出す
- **異常系**:
  - slug 不足、R2 取得失敗、Markdown 解析失敗 → エラー画面を返す
  - 未公開記事 → `Not Published` を表示する

## 画像アセット配信 API

- **テストタイプ**: `feature`
- **テストファイル**: `app/routes/api/images/[path].test.ts`
- **正常系**:
  - `/api/images/<path>` で既存アセットを要求 → `POSTS_BUCKET` から該当オブジェクトを返し、`Content-Type`、`ETag`、`Cache-Control`、`X-Cache` を付与する
- **異常系**:
  - オブジェクト不存在または取得失敗 → 404 を返す

## 履歴書アセット配信 API

- **テストタイプ**: `feature`
- **テストファイル**: `app/routes/api/resume-assets/[...path].test.ts`
- **正常系**:
  - `/api/resume-assets/<path>` で既存アセットを要求 → `RESUME_ASSETS_BUCKET` から該当オブジェクトを返し、`Content-Type`、`ETag`、`Cache-Control`、`X-Cache` を付与する
- **異常系**:
  - オブジェクト不存在または取得失敗 → 404 を返す

## サイトマップ

- **テストタイプ**: `feature`
- **テストファイル**: 未作成
- **正常系**:
  - `/sitemap.xml` → API 以外の静的ルートと `POSTS_BUCKET` から列挙した記事 slug を使って XML を生成して返す
- **異常系**:
  - 記事 slug 一覧の取得に失敗 → 投稿 URL を含めず、静的ルートのみで XML を返す
