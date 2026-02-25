# portfolio v3 要件定義書 (requirement-prod1.md)

## 概要 (Overview)

本フェーズ（prod1）は、公開ブログ運用を継続しながら、管理画面による記事運用（CRUD/プレビュー）と Markdown 表現拡張（コードシンタックス、リンクカード等）を追加する。

- **サービス名**
  - portfolio v3
- **目的**
  - 管理者がブラウザ上で記事（Markdown）を作成・編集・削除できる状態にする
  - 公開記事の可読性と表現力を強化する
- **ターゲット**
  - サイト管理者（投稿者）
  - 一般閲覧者（拡張 Markdown 表示の受益者）

---

## 技術スタック (Technology Stack)

### PRODUCT v1 (prod1)

ライブラリ・パッケージ（確定済み + 導入候補）:

| 項目                    | ライブラリ・フレームワーク・パッケージ                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| フロントエンド          | HonoX (`hono/jsx`)                                                                                     |
| バックエンド            | Hono (Cloudflare Workers)                                                                              |
| ホスティング            | Cloudflare Workers (`wrangler`)                                                                        |
| 認証                    | Cloudflare Access（必要時 `jose` で `cf-access-jwt-assertion` を検証）                                 |
| 状態管理                | なし（フォームローカル state を基本）                                                                  |
| スタイル/コンポーネント | Tailwind CSS v4 + 既存 CSS (`app/style.css`)                                                           |
| ORM                     | なし                                                                                                   |
| データベース            | なし（記事データは R2 バケット `POSTS_BUCKET`）                                                        |
| リンター/フォーマッター | Biome                                                                                                  |
| パッケージマネージャー  | pnpm                                                                                                   |
| テスト                  | Vitest                                                                                                 |
| その他                  | `gray-matter-es`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, `remark-gfm`（追加） |
| その他（候補）          | `rehype-highlight` or `rehype-prism-plus`, `remark-toc`, `rehype-external-links`, `rehype-sanitize`    |
| その他（候補）          | `remark-link-card` or OGP 取得 API（必要時）                                                           |

スクリプト（現行 `package.json`）:

- `dev`: `vite`
- `build`: `vite build --mode client && vite build`
- `preview`: `wrangler dev`
- `deploy:staging`: `pnpm run build && wrangler deploy --env=staging`
- `deploy:prod`: `pnpm run build && wrangler deploy --env=production`
- `test`: `vitest`
- `lint`: `biome check --write`
- `format`: `biome format --write .`
- `typecheck`: `pnpm exec tsc --noEmit`
- `seed:r2:local`: `pnpm run sync:r2 && node seeds/r2.mjs --local`
- `seed:r2:prod`: `pnpm run sync:r2 && node seeds/r2.mjs --prod`

### PRODUCT v1以降

- 管理画面 UX の改善（下書き管理、差分表示、公開予約）は次フェーズで検討する。
- Markdown 拡張の採用候補は、保守性・表示品質・運用コストを比較して確定する。

---

## 機能要件 (Functional Requirements)

### FR-11: 管理画面ルート保護

- 要件: `/admin/*` を未認証ユーザーから保護する。
- 詳細:
  - Cloudflare Access で `/admin/*` のアクセス制御を行う。
  - 必要時のみ Workers 側で JWT（`cf-access-jwt-assertion`）を検証する。
  - 認証失敗時は 401/403 を返し、管理画面本体は表示しない。
- 作成予定のファイル・関数・コンポーネント・型など:

```ts
// app/server.ts
adminAuthGuard(c: Context, next: Next): Promise<void>

// app/routes/admin/index.tsx
AdminIndexPage(): JSX.Element

// wrangler.jsonc
vars: { TEAM_DOMAIN?: string; POLICY_AUD?: string }
```

- テスト: 単体テスト + 手動確認
- テスト観点(正常と異常):
  - 認証済みで `/admin` にアクセスできること
  - 未認証で `/admin` にアクセスした場合に拒否されること

### FR-12: Markdown CRUD

- 要件: 管理者が記事を作成・編集・削除できる。
- 詳細:
  - frontmatter（`title`, `createdAt`, `updatedAt`, `isPublished`, `tags`, `version`）を扱う。
  - 保存先は既存 R2 バケット（`POSTS_BUCKET`）を利用する。
  - 削除は slug 単位で実行し、一覧 UI へ反映する。
- 作成予定のファイル・関数・コンポーネント・型など:

```ts
// app/lib/r2.ts
createPost(bucket: R2Bucket, slug: string, content: string): Promise<Result<void, string>>
updatePost(bucket: R2Bucket, slug: string, content: string): Promise<Result<void, string>>
deletePost(bucket: R2Bucket, slug: string): Promise<Result<void, string>>

// app/routes/admin/new.tsx
AdminNewPage(): JSX.Element

// app/routes/admin/[slug].tsx
AdminEditPage(): JSX.Element
```

- テスト: 単体テスト + 手動確認
- テスト観点(正常と異常):
  - 作成/更新/削除が成功し、結果が一覧へ反映されること
  - 存在しない slug 編集・削除時に適切なエラーを返すこと

### FR-13: Markdown Preview

- 要件: 編集中 Markdown を即時プレビューできる。
- 詳細:
  - 保存前プレビューと保存後プレビューをサポートする。
  - 公開ページと同一の Markdown パーサー/レンダラーを利用する。
- 作成予定のファイル・関数・コンポーネント・型など:

```ts
// app/lib/markdown.ts
parseMarkdown(content: string): Promise<Result<PostData, string>>

// app/components/post-content.tsx
PostContent({ postData }: { postData: PostData }): JSX.Element

// app/routes/admin/new.tsx, app/routes/admin/[slug].tsx
PreviewPane({ markdown }: { markdown: string }): JSX.Element
```

- テスト: 単体テスト + 手動確認
- テスト観点(正常と異常):
  - 入力変更がプレビューへ反映されること
  - 不正 Markdown 入力時にエラー表示されること

### FR-14: コードシンタックス拡張

- 要件: fenced code block を言語別に視認しやすく表示する。
- 詳細:
  - 既存の unified パイプラインに GFM + ハイライト処理を追加する。
  - `rehype-highlight` と `rehype-prism-plus` は比較後に片方を採用する。
  - 既存ダーク基調 UI と整合したスタイルを適用する。
- 作成予定のファイル・関数・コンポーネント・型など:

```ts
// app/lib/markdown.ts
buildMarkdownProcessor(): Processor

// app/lib/markdown.test.ts
it('renders fenced code blocks with syntax classes', ...)

// app/style.css
.prose pre code { /* highlight style */ }
```

- テスト: 単体テスト
- テスト観点(正常と異常):
  - 複数言語コードブロックで期待した HTML/class が出力されること
  - 未対応言語でも本文表示が崩れないこと

### FR-15: リンクカード拡張

- 要件: 対象リンクをカード UI で表示する。
- 詳細:
  - 記法は通常 URL 自動変換または独自ディレクティブのいずれかを採用する。
  - 実装は `remark-link-card` または OGP 取得 API を比較して決定する。
  - OGP 取得失敗時は通常リンク表示へフォールバックする。
- 作成予定のファイル・関数・コンポーネント・型など:

```ts
// app/routes/api/link-preview.ts
getLinkPreview(c: Context): Promise<Response>

// app/components/link-card.tsx
LinkCard({ title, description, image, url }: LinkCardProps): JSX.Element

type LinkCardProps = {
  title: string
  description?: string
  image?: string
  url: string
}
```

- テスト: 単体テスト + 手動確認
- テスト観点(正常と異常):
  - OGP 取得成功時にカード表示されること
  - OGP 取得失敗時に通常リンク表示へフォールバックすること

### FR-16: 外部リンク/目次/安全性拡張

- 要件: 外部リンク挙動、目次生成、HTML 安全性を統一する。
- 詳細:
  - 外部リンクに `target="_blank"` と `rel` 属性を付与する。
  - 見出し構造から TOC を生成する。
  - HTML 変換後に sanitize を適用して許可タグのみ通す。
- 作成予定のファイル・関数・コンポーネント・型など:

```ts
// app/lib/markdown.ts
buildMarkdownProcessor(options: MarkdownOptions): Processor

type MarkdownOptions = {
  enableToc: boolean
  enableExternalLinks: boolean
  enableSanitize: boolean
}
```

- テスト: 単体テスト
- テスト観点(正常と異常):
  - 外部リンク属性が期待どおり付与されること
  - TOC が見出し構造に追従すること
  - 危険な HTML が除去されること

---

## 非機能要件 (Non-Functional Requirements)

### NFR-01: パフォーマンス

- 公開ページ表示性能を維持し、Markdown 変換の追加処理による遅延を最小化する。
- 外部参照を伴うリンクカードはキャッシュ前提で設計する。

### NFR-02: 互換性

- Chrome latest / Firefox latest / Safari latest を対象とする。

### NFR-03: アクセシビリティ

- リンクカードを含む拡張 UI はキーボード操作可能とする。
- 見出し構造、リンクテキスト、コントラストを維持する。

### NFR-04: セキュリティ

- `/admin/*` は Cloudflare Access 前提で公開する。
- リンクプレビュー API は SSRF 対策としてドメイン制限、タイムアウト、サイズ制限を持つ。

### NFR-05: ライセンスコンプライアンス

| リソース                      | 用途                          | ライセンス       | クレジット表記                  |
| ----------------------------- | ----------------------------- | ---------------- | ------------------------------- |
| npm パッケージ（prod1追加分） | Markdown 拡張・表示機能の実装 | 各パッケージ準拠 | 必要時に `README.md` へ追記する |

### NFR-06: テスタビリティ

- `app/lib/markdown.ts` と `app/lib/r2.ts` の変更点は Vitest で検証する。
- 管理画面の主要導線（作成/編集/削除/プレビュー）は手動確認する。

---

## ディレクトリ構成と作成ファイル (Directory Structure & Files)

```txt
app/
├── routes/
│   ├── admin/
│   │   ├── index.tsx          # 管理トップ
│   │   ├── new.tsx            # 新規作成
│   │   └── [slug].tsx         # 編集/削除
│   ├── api/
│   │   └── link-preview.ts    # OGP取得API（採用時）
│   └── posts/
│       └── [slug].tsx         # 公開記事表示（拡張Markdown反映）
├── components/
│   ├── post-content.tsx        # 記事本文
│   └── link-card.tsx           # リンクカード（採用時）
├── lib/
│   ├── markdown.ts             # Markdown処理パイプライン
│   ├── markdown.test.ts
│   ├── r2.ts                   # 記事CRUD
│   └── r2.test.ts
└── server.ts                   # admin認証ガード
```

---

## 画面設計 (Screen Design)

### 画面一覧 (Screen List)

| No  | 画面名             | URLパス        | 機能概要                           | 備考       |
| --- | ------------------ | -------------- | ---------------------------------- | ---------- |
| 101 | Admin Dashboard    | `/admin`       | 記事一覧、作成導線                 | 認証必須   |
| 102 | Admin New          | `/admin/new`   | 新規作成、プレビュー、保存         | 認証必須   |
| 103 | Admin Edit         | `/admin/:slug` | 編集、プレビュー、更新、削除       | 認証必須   |
| 104 | Public Post Detail | `/posts/:slug` | 拡張 Markdown（コード/リンク）表示 | 公開ページ |

### ワイヤーフレーム・モックアップ (Wireframes & Mockups)

- `docs/drafts/` 配下の最新モックを参照する（未配置の場合は実装優先で進行）。

---

## デザインシステム (Design System)

### デザイン方針

- 既存の静かなダーク基調デザインを維持し、管理画面にも同一トーンを適用する。
- 機能追加よりも可読性、運用性、誤操作防止を優先する。

### カラーパレット (Color Palette)

- カラーモード: シングルカラー（ダーク）
- Primary: `#E5E7EB`
- Secondary: `#A1A1AA`
- Background: `#0A0A0A`
- Surface: `#111827`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

---

## 備考・参考資料 (Notes & References)

- Cloudflare Access: https://developers.cloudflare.com/cloudflare-one/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- remark-gfm: https://github.com/remarkjs/remark-gfm
