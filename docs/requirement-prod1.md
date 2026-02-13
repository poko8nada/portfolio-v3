# portfolio v3 要件定義書 (requirement-prod1.md)

## 1. 概要 (Overview)

本フェーズ（prod1）は、公開ブログ運用を継続しつつ、更新運用を効率化するために管理画面とMarkdown拡張を追加する。

- **サービス名**
  - portfolio v3
- **目的**
  - 管理者がブラウザ上で記事（md）をCRUDし、公開前にプレビューできる状態にする
  - 記事表現力を強化する（コードシンタックス、リンクカード）
- **ターゲット**
  - サイト管理者（投稿者）
  - 一般閲覧者（拡張Markdown表示の受益者）

---

## 2. 技術スタック (Technology Stack)

### PRODUCT v1 (prod1)

- **フロントエンド**: HonoX (hono/jsx)
- **バックエンド**: Hono (Cloudflare Workers)
- **ホスティング**: Cloudflare Workers (Wrangler)
- **認証**: Cloudflare Access（第一候補） / Basic認証（非採用方針）
- **データストア**: R2（既存継続、管理画面から操作）
- **テスト**: Vitest
- **Lint/Formatter**: Biome
- **パッケージマネージャ**: pnpm
- **Markdown拡張候補（Context7確認済み）**:
  - `remark-gfm`（GFM拡張: table/tasklist/strikethrough）
  - シンタックスハイライトは `rehype-highlight` または `rehype-prism-plus` を候補
  - 目次生成は `remark-toc` を候補
  - 数式は必要時のみ `remark-math + rehype-katex` を候補
  - HTMLサニタイズは `rehype-sanitize` を候補
  - 外部リンク制御は `rehype-external-links` を候補
  - リンクカードは `remark-link-card` または自前OGP取得（`open-graph-scraper` / API経由）を候補

---

## 3. 機能要件 (Functional Requirements)

### 3.1. 管理画面 (Admin)

**FR-11: 管理画面ルート保護**

- **要件**: `/admin/*` を未認証ユーザーから保護する
- **対象ファイル**:
  - `app/routes/admin/**`
  - `app/server.ts`（またはミドルウェア配置箇所）
  - `wrangler.jsonc`
- **詳細**:
  - Cloudflare Access で admin ルートへのアクセス制御を行う
  - 必要に応じて `cf-access-jwt-assertion` を Workers 側で検証可能にする（`jose`）
  - 認証失敗時は 401/403 を返し、管理画面本体は表示しない
- **テスト観点**:
  - 未認証で `/admin` が拒否される
  - 認証済みで `/admin` に到達できる

**FR-12: Markdown CRUD**

- **要件**: 管理者が記事を作成・編集・削除できる
- **対象ファイル**:
  - `app/routes/admin/index.tsx`
  - `app/routes/admin/new.tsx`
  - `app/routes/admin/[slug].tsx`
  - `app/routes/admin/actions/*.ts`（作成時）
  - `app/lib/r2.ts`
- **詳細**:
  - フロントマター（title, createdAt, updatedAt, isPublished, tags, version）を扱う
  - 保存先は既存 R2 バケット（`POSTS_BUCKET`）
  - 削除は slug 単位で実行し、結果をUIに反映する
- **テスト観点**:
  - 作成/更新/削除の正常系
  - 存在しない slug 編集・削除時の異常系

**FR-13: Markdown Preview**

- **要件**: 編集中 Markdown を即時プレビューできる
- **対象ファイル**:
  - `app/routes/admin/new.tsx`
  - `app/routes/admin/[slug].tsx`
  - `app/lib/markdown.ts`
  - `app/components/post-content.tsx`
- **詳細**:
  - 保存前プレビューと保存後プレビューの双方をサポート
  - 公開ページと同一のパーサー/レンダラーを使い、表示差異を最小化する
- **テスト観点**:
  - 入力変更がプレビューへ反映される
  - 不正なMarkdown入力時のエラー表示

### 3.2. Markdown拡張

**FR-14: コードシンタックス拡張**

- **要件**: fenced code block を言語別に視認しやすく表示する
- **対象ファイル**:
  - `app/lib/markdown.ts`
  - `app/style.css`（必要に応じて）
- **詳細**:
  - 既存 unified パイプラインに GFM + ハイライト処理を追加する
  - 実装候補は `rehype-highlight` または `rehype-prism-plus` とし、比較後に決定する
  - テーマは既存ダーク基調UIと整合すること
- **テスト観点**:
  - 複数言語ブロックでのHTML出力確認
  - 未対応言語のフォールバック確認

**FR-15: リンクカード拡張**

- **要件**: 対象リンク記法をカードUIで表示する
- **対象ファイル**:
  - `app/lib/markdown.ts`
  - `app/components/link-card.tsx`（作成時）
  - `app/routes/api/link-preview.ts`（作成時）
- **詳細**:
  - 記法候補: 通常URLを自動変換、または独自ディレクティブ（例: `::link-card{url=...}`）
  - 実装候補は `remark-link-card` または自前OGP取得（`open-graph-scraper`）とし、比較後に決定する
  - OGP取得失敗時は通常リンク表示へフォールバック
  - SSR時のタイムアウトとキャッシュ方針を定義する
- **テスト観点**:
  - OGP取得成功/失敗の双方で表示崩れがない
  - 外部ドメイン制限ルールが機能する

**FR-16: 外部リンク・目次・安全性拡張**

- **要件**: 外部リンク挙動、目次生成、HTML安全性を統一する
- **対象ファイル**:
  - `app/lib/markdown.ts`
  - `app/style.css`（目次・数式スタイルが必要な場合）
- **詳細**:
  - 外部リンクは新規タブ + `rel` 付与（`rehype-external-links`）
  - 見出しに基づく目次を生成（`remark-toc`）
  - 必要時のみ数式変換を有効化（`remark-math + rehype-katex`）
  - HTML変換後は `rehype-sanitize` で許可タグを制御
- **テスト観点**:
  - 外部リンク属性が適切に付与される
  - TOCが見出し構造に追従する
  - sanitizeで危険なHTMLが除去される

---

## 4. 非機能要件 (Non-Functional Requirements)

**NFR-08: セキュリティ**

- admin は Cloudflare Access 前提で公開し、一般公開しない
- 外部メタ情報取得API（リンクカード）は SSRF を避けるためドメイン制限・タイムアウトを持つ

**NFR-09: パフォーマンス**

- 公開ページ表示の劣化を避ける（Markdown変換は既存パイプラインを拡張）
- リンクカードの外部参照はキャッシュを前提にし、初回遅延を局所化する

**NFR-10: 互換性**

- Chrome / Firefox / Safari latest

**NFR-11: テスタビリティ**

- `app/lib/markdown.ts` と管理画面の主要ビジネスロジックは Vitest 対象

---

## 5. 画面一覧 (Screen List)

| No  | 画面名             | URLパス        | 機能概要                          |
| --- | ------------------ | -------------- | --------------------------------- |
| 101 | Admin Dashboard    | `/admin`       | 記事一覧、作成導線                |
| 102 | Admin New          | `/admin/new`   | 新規作成、プレビュー、保存        |
| 103 | Admin Edit         | `/admin/:slug` | 編集、プレビュー、更新、削除      |
| 104 | Public Post Detail | `/posts/:slug` | 拡張Markdown（コード/リンク）表示 |

---

## 6. 備考・参考資料 (Notes & References)

- Cloudflare Access で Workers URL を保護し、必要に応じて JWT (`cf-access-jwt-assertion`) を Worker で検証する
- Context7: `/cloudflare/cloudflare-docs`, `/remarkjs/remark-gfm`
