# portfolio v3 要件定義書 (requirement-mvp.md)

## 1. 概要 (Overview)

本プロジェクトは、最小構成のポートフォリオ v3 を HonoX で構築し、静的に近い体験でブログ閲覧を提供する。

フェーズ1でMVPを達成し、フェーズ2でAbout/管理機能/運用系の拡張を実現する。

- **サービス名**
  - portfolio v3
- **目的**
  - シンプルで静かなテキスト中心デザインのポートフォリオを公開する
- **ターゲット**
  - 制作物・ブログを閲覧する一般閲覧者

---

## 2. 技術スタック (Technology Stack)

### MVP

- **フロントエンド**: HonoX (hono/jsx)
- **バックエンド**: Hono (Cloudflare Workers)
- **ホスティング**: Cloudflare Workers (Wrangler)
- **認証**: なし
- **状態管理**: なし
- **スタイリング/コンポーネント**: Tailwind CSS v4
- **テスト**: Vitest
- **ORM+**: なし
- **データベース**: R2 (ブログ記事格納)
- **Lint/Formatter**: Biome
- **パッケージマネージャ**: pnpm
- **主要スクリプト**:
  - `dev`: vite
  - `build`: vite build --mode client && vite build
  - `preview`: wrangler dev
  - `deploy`: pnpm run build && wrangler deploy
  - `test`: vitest
  - `lint`: biome check --write
  - `format`: biome format --write .
  - `typecheck`: pnpm exec tsc --noEmit
  - `db:migrate`: なし
  - `seed:r2`: pnpm run seed:r2:local
  - `seed:r2:local`: node seeds/r2.mjs --local
  - `seed:r2:prod`: node seeds/r2.mjs --prod
  - `seed:reset`: rm -rf .wrangler/state && pnpm run seed:r2:local
  - `generate`: なし
- **その他**: gray-matter-es, unified/remark/rehype

### PRODUCT v1(製品版)

- **フロントエンド**: 変更なし
- **バックエンド**: 変更なし
- **その他**: Aboutページ、管理ページ、運用設定（GA4/GTM、カスタムドメイン）

---

## 3. 機能要件 (Functional Requirements)

> **原則**: 1ファイル = 1機能要件を基本とする。各ファイルの責務を明確化し、テスト可能な単位で設計する。

### 3.1. ルーティング/レイアウト

**FR-01: `app/routes/_renderer.tsx`**

- **要件**: 全ページ共通のHTML骨格、フォント/スタイル読み込み、ヘッダー/フッター共通レイアウト
- **詳細**:
  - `<title>`/`<meta>` はページ側で定義し、HonoXタグホイスティングを利用
  - ヘッダーは上部固定、フッターはレイアウト末尾（固定ではない）
  - リンク/ボタンは軽い色変化の hover と transition を使用
- **関数/コンポーネント**: `jsxRenderer({ children }): JSX.Element`
- **テスト観点**: 主要ルートの表示が崩れないこと

**FR-01a: `app/routes/_404.tsx`**

- **要件**: 404時に "404 Not Found" を返す
- **関数**: `handler(c): Response`
- **テスト観点**: 404ステータスの設定

**FR-01b: `app/routes/_error.tsx`**

- **要件**: 500時に "Internal Server Error" を返す（Hono標準例外は passthrough）
- **関数**: `handler(e, c): Response`
- **テスト観点**: 500ステータスの設定

**FR-02: `app/routes/index.tsx`**

- **要件**: Homeページ（about/posts/tools概要）を表示
- **詳細**:
  - About: テキスト + GitHub/X の外部リンクボタン
  - Posts: `PostList` でR2から取得した一覧の抜粋（最大3件）
  - 一覧導線は `/posts` へのリンクを設置
  - Tools: 固定の外部リンク一覧
  - 詳細ルートは `/posts/:slug`
  - タグボタンは `/posts?tag=...` へのリンクを生成
- **Props**: なし
- **テスト観点**: R2一覧取得失敗時のエラー表示

### 3.2. ブログ

**FR-03: `app/routes/posts/index.tsx`**

- **要件**: ブログ一覧ページを表示
- **詳細**:
  - `tag` クエリを取得して `TagFilter` と `PostList` に渡す
  - `PostList` が一覧とタグボタンを生成
  - `tag` 未指定時は全件表示
- **Props**: なし
- **テスト観点**: R2失敗時のエラー表示

**FR-03a: `app/features/post-list.tsx`**

- **要件**: 記事メタデータの一覧表示コンポーネント
- **詳細**:
  - `getAllPosts` で記事を取得し `parseMetadata` で解析
  - `updatedAt`/`createdAt` の降順で並べ替え
  - `displayCount` があれば件数を制限（絞り込み前に適用）
  - `tag` 指定時は該当タグのみ表示（`displayCount` 適用後）
  - `title` 指定時は該当タイトルを除外表示（記事詳細ページで同記事を重複表示しないため）
  - タグボタンは `/posts?tag=...` へ遷移
- **Props**: `{ bucket: R2Bucket, displayCount?: number, tag?: string | null, cacheOptions?: CacheOptions, title?: string }`
- **テスト観点**: 手動確認

**FR-04: `app/routes/posts/[slug].tsx`**

- **要件**: ブログ詳細ページを表示
- **詳細**:
  - R2から記事本文を取得しMarkdownをHTMLへ変換
  - frontmatterの title を反映
  - `isPublished: false` の記事は表示しない
  - 記事詳細ページ下部に「Recent Posts」セクション（同記事を除く3件）を表示
  - HTMLは `PostContent` コンポーネントで出力
- **関数/コンポーネント**: `createRoute(async c): Response`
- **テスト観点**: 取得失敗/パース失敗時/非公開記事のエラー表示

**FR-05: `app/lib/r2.ts`**

- **要件**: R2から記事/アセット取得の共通処理
- **詳細**:
  - listPosts/getPost/getAllPosts/getAsset を提供
  - 失敗時は Result エラー
- **関数**: `listPosts(bucket)`, `getPost(bucket, slug)`, `getAllPosts(bucket, limit)`, `getAsset(bucket, path)`
- **テスト観点**: 正常/異常の戻り値（`app/lib/r2.test.ts`）

**FR-06: `app/lib/markdown.ts`**

- **要件**: Markdown本文のHTML化とfrontmatter抽出
- **詳細**:
  - `parseMarkdown` はHTMLとfrontmatterを返却
  - `parseMetadata` はfrontmatterのみ返却
  - `PostData` 型を外部エクスポート（他モジュールから型参照可能）
- **関数**: `parseMarkdown(content)`, `parseMetadata(content)`
- **型**: `export type PostData`
- **テスト観点**: frontmatter未定義時の挙動（`app/lib/markdown.test.ts`）

**FR-06a: `app/components/post-content.tsx`**

- **要件**: ブログ記事本文を表示するコンポーネント
- **詳細**:
  - `PostData` を受け取り、タイトルと本文を表示
  - HTMLは `dangerouslySetInnerHTML` で出力
  - `isPublished` が `false` の場合は本文を表示しない
- **Props**: `{ postData: PostData }`
- **テスト観点**: 手動確認

### 3.3. タグフィルタ

**FR-08: `app/islands/tag-filter.tsx`**

- **要件**: 選択中タグの表示と解除
- **詳細**:
  - `tag` がある場合のみ表示する
  - 解除ボタンで `/posts` に遷移しフィルタを解除
- **Props**: `{ tag: string | null }`
- **テスト観点**: 解除操作でクエリが外れること

### 3.4. 画像配信

**FR-09: `app/routes/api/images/[path].ts`**

- **要件**: R2から画像を取得して配信
- **詳細**:
  - 該当パスがない場合は404
  - `X-Cache: HIT/MISS` と `Cache-Control` を付与
- **関数**: `getAsset(bucket, path)`
- **テスト観点**: 404ハンドリング・ヘッダー付与（`app/routes/api/images/[path].test.ts`）

**FR-10: キャッシュロジック (Cache API)**

- **要件**: R2からの取得結果を Cloudflare Cache API でキャッシュする
- **詳細**:
  - `getPost` および `getAsset` 時に `caches.default` を使用してレスポンスをキャッシュ
  - キャッシュキーは実際のリクエストホスト名と正規化されたパス（`/__r2_cache__/`）を組み合わせて生成
  - `ctx.waitUntil` を使用し、レスポンスを返した後に非同期でキャッシュを更新
  - 開発/検証用に `X-Cache: HIT/MISS` ヘッダーを付与
- **関数**: `app/lib/r2.ts` 内の各関数を拡張
- **テスト観点**: `caches.default` の呼び出しおよび `X-Cache` ヘッダーの検証（`app/lib/r2.test.ts`）

---

## 4. 非機能要件 (Non-Functional Requirements)

**NFR-01: パフォーマンス**

- 静的に近い体験を維持し、Islandsを最小限にする
- 追加R2アクセスを避け、一覧取得は1回
- Cache API を活用し、R2へのリクエスト回数を最小化（10倍程度の高速化を目標）

**NFR-02: 互換性**

- Chrome latest, Firefox latest, Safari latest

**NFR-03: アクセシビリティ**

- WCAG 2.1 Level AA を意識
- キーボード操作可能なリンク構造

**NFR-04: テスタビリティ**

- r2/markdownユーティリティは単体テスト対象
- UIは最小の手動確認

**NFR-05: セキュリティ**

- 認証なし、公開コンテンツのみ
- 環境変数はwrangler設定で管理

**NFR-06: アーキテクチャ**

- HonoXのサーバーレンダリングを基本
- Islandsは `tag-filter` のみ利用（フィルタ解除UI）

**NFR-07: ライセンスコンプライアンス**

- 外部リソースがある場合はライセンス遵守

---

## 5. ディレクトリ構成と作成ファイル (Directory Structure & Files)

### 5.1. 現状のディレクトリ構成（MVP）

```
app/
├── client.ts
├── server.ts
├── global.d.ts
├── style.css
├── routes/
│   ├── _404.tsx
│   ├── _error.tsx
│   ├── _renderer.tsx
│   ├── index.tsx
│   ├── posts/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   └── api/
│       └── images/
│           ├── [path].ts
│           └── [path].test.ts
├── islands/
│   └── tag-filter.tsx
├── features/
│   └── post-list.tsx
├── components/
│   ├── button.tsx
│   ├── footer.tsx
│   ├── header.tsx
│   ├── list-content.tsx
│   ├── section.tsx
│   └── text-link.tsx
├── lib/
│   ├── markdown.ts
│   ├── markdown.test.ts
│   ├── r2.ts
│   └── r2.test.ts
├── utils/
│   └── types.ts
public/
└── [static-assets]
```

---

## 6. 外部リソース・ライセンス (External Resources & Licenses)

| リソース | 用途 | ライセンス | クレジット表記 |
| -------- | ---- | ---------- | -------------- |
| なし     | -    | -          | -              |

---

## 7. 画面設計 (Screen Design)

### 7.1. 画面一覧 (Screen List)

| No  | 画面名     | URLパス        | 機能概要                | 備考 |
| --- | ---------- | -------------- | ----------------------- | ---- |
| 001 | ホーム     | `/`            | About/Posts/Tools概要   |      |
| 002 | ブログ詳細 | `/posts/:slug` | 記事本文表示            |      |
| 003 | ブログ一覧 | `/posts`       | 記事一覧 + タグフィルタ |      |

### 7.2. 画面フロー図 (Screen Flow Diagram)

- `/` → `/posts/:slug`
- `/` → `/posts` → `/posts/:slug`
- `/` → `/posts?tag=...` → `/posts/:slug`

### 7.3. ワイヤーフレーム・モックアップ (Wireframes & Mockups)

- `docs/drafts/portfolio-v3-wire.png`

**Note**: It is enough to provide low-fidelity wireframes or figma links.

---

## 8. デザインシステム (Design System)

### 8.1. カラーパレット (Color Palette)

**カラー対応**

- カラーモード: シングルカラー

**シングルカラー（ダーク）**

_プライマリカラー_

- Primary: `#E5E7EB` - テキスト主

_セカンダリカラー_

- Secondary: `#A1A1AA` - サブテキスト

_背景・テキストカラー_

- Background: `#0A0A0A` - 背景
- Surface: `#111827` - セクション背景
- Text primary: `#E5E7EB` - メインテキスト
- Text secondary: `#A1A1AA` - サブテキスト

_セマンティックカラー_

- Success: `#10B981` - 最小限
- Warning: `#F59E0B` - 最小限
- Error: `#EF4444` - 最小限
- Info: `#3B82F6` - 最小限

**コントラスト比**

- Text primary / Background: 4.5:1 以上
- Text secondary / Background: 4.5:1 以上

**実装パターン**

- Tailwind v4 のテーマ変数を利用
- Hoverは軽微な色変化のみ（transitionは使用）
- Animation/Icon は使用しない

---

## 9. 備考・参考資料 (Notes & References)

### 9.1. 運用タスク（MVP後・ダッシュボード作業）

- [ ] GA4 / GTM 設定
- [ ] カスタムドメイン設定を Cloudflare ダッシュボードで反映

### 9.2. 備考

- 既存ポートフォリオ v2 から GA4(GTM) / カスタムドメイン設定を移行予定（MVP後）
