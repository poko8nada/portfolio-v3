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
  - `format`: なし
  - `typecheck`: なし
  - `db:migrate`: なし
  - `db:seed`: seed:r2
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

- **要件**: 全ページ共通のHTML骨格、フォント/スタイル読み込み、ヘッダー/フッター固定レイアウト
- **詳細**:
  - `<title>`/`<meta>` はページ側で定義し、HonoXタグホイスティングを利用
  - ヘッダーは上部固定、フッターは下部固定
  - hover/animation/icon は使わない
- **関数/コンポーネント**: `jsxRenderer({ children }): JSX.Element`
- **テスト観点**: 主要ルートの表示が崩れないこと

**FR-02: `app/routes/index.tsx`**

- **要件**: Homeページ（about/blog/tools概要）を表示
- **詳細**:
  - blogはR2から取得した一覧の抜粋を表示
  - toolsは外部リンクのみ
  - contactはXリンクのみ
  - モバイルはテキストリンク一覧のレイアウト
- **Props**: なし
- **テスト観点**: R2一覧取得失敗時のエラー表示

### 3.2. ブログ

**FR-03: `app/routes/posts/index.tsx`**

- **要件**: ブログ一覧ページを表示
- **詳細**:
  - R2から記事一覧を取得
  - タグは固定リストと照合して表示
  - 追加のR2アクセスを抑えるため一覧取得は1回
- **Props**: なし
- **テスト観点**: R2失敗時のエラー表示

**FR-04: `app/routes/posts/[slug].tsx`**

- **要件**: ブログ詳細ページを表示
- **詳細**:
  - R2から記事本文を取得しMarkdownをHTMLへ変換
  - frontmatterの title/tags を反映
- **関数/コンポーネント**: `PostComponent({ bucket, slug }): JSX.Element`
- **テスト観点**: 取得失敗/パース失敗時のエラー表示

**FR-05: `app/lib/r2.ts`**

- **要件**: R2から記事/アセット取得の共通処理
- **詳細**:
  - listPosts/getPost/getAsset を提供
  - 失敗時は Result エラー
- **関数**: `listPosts(bucket)`, `getPost(bucket, slug)`, `getAsset(bucket, path)`
- **テスト観点**: 正常/異常の戻り値

**FR-06: `app/lib/markdown.ts`**

- **要件**: Markdown本文のHTML化とfrontmatter抽出
- **詳細**:
  - title/tags/content を返す
- **関数**: `parseMarkdown(content)`
- **テスト観点**: frontmatter未定義時の挙動

### 3.3. タグフィルタ

**FR-07: `app/config/tags.ts`**

- **要件**: タグ固定リストをローカル定義
- **詳細**:
  - 投稿作成時にこのリストから選択する前提
- **戻り値**: `string[]`
- **テスト観点**: 不要

**FR-08: `app/islands/tag-filter.tsx`**

- **要件**: クライアント側で一覧をタグフィルタ
- **詳細**:
  - 初期タグはURLクエリ（HonoX標準）から取得して反映
  - 一覧表示の絞り込みはクライアントのみ（追加R2アクセスなし）
  - nuqsは使用しない
- **Props**: `{ tags: string[], posts: PostSummary[], initialTag?: string }`
- **テスト観点**: フィルタ状態の切替、URLクエリ反映

### 3.4. 画像配信

**FR-09: `app/routes/api/images/[path].ts`**

- **要件**: R2から画像を取得して配信
- **詳細**:
  - 該当パスがない場合は404
- **関数**: `getAsset(bucket, path)`
- **テスト観点**: 404/500のハンドリング

---

## 4. 非機能要件 (Non-Functional Requirements)

**NFR-01: パフォーマンス**

- 静的に近い体験を維持し、Islandsを最小限にする
- 追加R2アクセスを避け、一覧取得は1回

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

- HonoXのIslands設計に準拠
- サーバーレンダリングを基本、クライアントはタグフィルタのみ

**NFR-07: ライセンスコンプライアンス**

- 外部リソースがある場合はライセンス遵守

---

## 5. ディレクトリ構成と作成ファイル (Directory Structure & Files)

### 5.1. フェーズ1: MVP実装時のディレクトリ構成

```
app/
├── client.ts
├── server.ts
├── routes/
│   ├── _renderer.tsx
│   ├── index.tsx
│   ├── posts/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   └── api/
│       └── images/[path].ts
├── islands/
│   └── tag-filter.tsx
├── components/
│   ├── header.tsx
│   └── footer.tsx
├── config/
│   └── tags.ts
├── lib/
│   ├── r2.ts
│   └── markdown.ts
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
| 001 | ホーム     | `/`            | About/Blog/Tools概要    |      |
| 002 | ブログ一覧 | `/posts`       | 記事一覧 + タグフィルタ |      |
| 003 | ブログ詳細 | `/posts/:slug` | 記事本文表示            |      |

### 7.2. 画面フロー図 (Screen Flow Diagram)

- `/` → `/posts` → `/posts/:slug`

### 7.3. ワイヤーフレーム・モックアップ (Wireframes & Mockups)

- `docs/drafts/portfolio-v3-wire.png`

**Note**: It is enough to providee low-fidelity wireframes or figma links.

---

## 8. デザインシステム (Design System)

### 8.1. カラーパレット (Color Palette)

**カラー対応**

- カラーモード: シングルカラー

**シングルカラー（ダーク）**

_プライマリカラー_

- Primary: `#E5E7EB` - テキスト主
- Primary hover: `#E5E7EB` - hoverは使用しない

_セカンダリカラー_

- Secondary: `#A1A1AA` - サブテキスト
- Secondary hover: `#A1A1AA` - hoverは使用しない

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
- Hover/Animation/Icon は使用しない

---

## 9. 備考・参考資料 (Notes & References)

- 既存ポートフォリオ v2 から GA4(GTM) / カスタムドメイン設定を移行予定（MVP後）
