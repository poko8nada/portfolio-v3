**This is a template. Fill in the [] or ``, duplicate or delete the template parts as needed.**

# [プロジェクト名] 要件定義書 (requirement.md)

## 1. 概要 (Overview)

本プロジェクトは、[プロジェクトの目的を簡潔に説明]。

フェーズ1でMVPを達成し、フェーズ2で[追加機能や品質向上]を実現する。

- **サービス名**
  - [サービス名] (仮)
- **目的**
  - [プロジェクトの目的と背景]
- **ターゲット**
  - [想定ユーザー、利用シーン]

---

## 2. 技術スタック (Technology Stack)

### MVP

- **フロントエンド**: [Next.js / React / htmx / など]
- **バックエンド**: [なし / Hono / Express / など]
- **ホスティング**: [Vercel / Cloudflare Workers / Cloud Run / など]
- **認証**: [なし / Clerk / Auth0 / better auth / など]
- **状態管理**: [React Context / Zustand / nuqs / など]
- **スタイリング/コンポーネント**: [Tailwind CSS / shadcn / react aria / など]
- **テスト**: [Vitest / Testing Library / など]
- **ORM+**: [なし / Drizzle ORM / Prisma / など]
- **データベース**: [なし / D1 / Turso / Supabase / Neon /など]
- **Lint/Formatter**: [Biome / ESLint + Prettier / など]
- **パッケージマネージャ**: [pnpm / npm / yarn]
- **主要スクリプト**:
  - `dev`: [開発サーバー起動コマンド]
  - `build`: [ビルドコマンド]
  - `preview`: [ローカルプレビューコマンド]
  - `deploy`: [デプロイコマンド]
  - `test`: [テスト実行コマンド]
  - `lint`: [Lint/フォーマット実行コマンド]
  - `format`: [コードフォーマット実行コマンド]
  - `typecheck`: [型チェックコマンド]
  - `db:migrate`: [データベースマイグレーションコマンド（該当する場合）]
  - `db:seed`: [データベースシードコマンド（該当する場合）]
  - `generate`: [コード生成コマンド（該当する場合）]
- **その他**: [その他、使用する主要ライブラリ・API]

### PRODUCT v1(製品版)

- **フロントエンド**: [変更がある場合のみ記載]
- **バックエンド**: [追加・変更内容]
- **その他**: [追加機能や技術スタック]

---

## 3. 機能要件 (Functional Requirements)

> **原則**: 機能要件は「ユーザー価値/振る舞い」を単位に定義する。  
> 1つのFRが複数ファイルにまたがってもよく、1ファイル内に複数FRが存在してもよい。  
> 実装ファイルは「FRとの対応関係」を明記して、責務とテスト境界を明確化する。

### FR 記述ルール

- FRは `FR-XX` で連番管理し、ファイル名ではなく機能名で命名する
- 各FRに「対象ファイル（複数可）」を必ず記載する
- 1ファイル内で複数機能がある場合は、必要に応じて `FR-XXa`, `FR-XXb` のように分割する
- 各FRに「主要な公開I/F」を記載する（関数名・コンポーネント名・型名）
- 関数/コンポーネント/型は、原則 `export` される境界を優先して記載する
- FRは「実装の都合」ではなく「仕様/期待動作」を先に書く
- テスト観点はFR単位で記述し、必要ならファイル別に補足する

### FR 記述例

**例1: 1つのFRが複数ファイルにまたがるケース**

**FR-01: 記事一覧のタグ絞り込み**

- **要件**: 一覧画面でタグ選択時に該当記事のみ表示する
- **対象ファイル**:
  - `app/routes/posts/index.tsx`
  - `app/features/post-list.tsx`
  - `app/islands/tag-filter.tsx`
- **詳細**:
  - `tag` クエリを取得し、一覧データへ適用する
  - 選択中タグをUI表示し、解除操作で全件表示へ戻す
- **主要な公開I/F**:
  - 関数: `filterPostsByTag(posts, tag): Post[]`
  - コンポーネント: `TagFilter({ tag }): JSX.Element`
  - 型: `type Post`, `type TagFilterProps`
- **テスト観点**:
  - `tag` あり/なしで表示件数が期待通りに変わる
  - 解除操作で `/posts` に戻る

**例2: 1ファイル内に複数FRがあるケース**

- `app/lib/r2.ts` が以下2つのFRを担当
  - **FR-05a: 記事本文の取得**（`getPost`）
  - **FR-05b: 画像アセットの取得**（`getAsset`）
- 同一ファイルでも責務が異なるため、FRを分けて記述する
- 各FRで対象I/Fを分けて記述する（例: `getPost` と `getAsset`、`GetPostResult` と `GetAssetResult`）

### 3.1. [機能カテゴリ名]

**FR-01: [機能名]**

- **要件**: [機能の概要]
- **対象ファイル**:
  - `ファイルパス/ファイル名.ts`
  - `ファイルパス/ファイル名.tsx`
- **詳細**:
  - [実装の詳細]
  - [技術的な制約]
  - [使用するAPI・ライブラリ]
- **関数/コンポーネント**: `関数名(引数): 戻り値`
- **型** (該当する場合): `type TypeName = { ... }`
- **Props** (該当する場合): `{ prop1: type, prop2: type }`
- **戻り値** (該当する場合): `{ value1: type, value2: type }`
- **テスト観点**: [テストで確認すべきポイント]

**FR-02: [機能名]**

- **要件**: [機能の概要]
- **対象ファイル**:
  - `ファイルパス/ファイル名.tsx`
- **詳細**:
  - [実装の詳細]
  - [UIの振る舞い]
  - [状態管理]
- **コンポーネント**: `ComponentName(props): JSX.Element`
- **型**: `type ComponentNameProps`
- **Props**: `{ prop1: type, prop2: type }`
- **テスト観点**: [テストで確認すべきポイント]

### 3.2. [機能カテゴリ名]

**FR-03: [機能名]**

- **要件**: [機能の概要]
- **対象ファイル**:
  - `ファイルパス/ファイル名.ts`
- **詳細**:
  - [実装の詳細]
- **関数**: `関数名(引数): 戻り値`
- **型**: `type TypeName`
- **テスト観点**: [テストで確認すべきポイント]

---

## 4. 非機能要件 (Non-Functional Requirements)

**NFR-01: パフォーマンス**

- [パフォーマンス要件]
- 例: レスポンスタイム、UI更新頻度、バンドルサイズ

**NFR-02: 互換性**

- [ブラウザ・デバイス対応]
- 例: Chrome latest, Firefox latest, Safari latest

**NFR-03: アクセシビリティ**

- [アクセシビリティ要件]
- 例: WCAG 2.1 Level AA準拠、キーボード操作対応

**NFR-04: テスタビリティ**

- [テスト方針]
- 例: ビジネスロジックと重要な関数のみテスト対象。APIとの接続は、正常系と異常系どちらもテストを行う。UIコンポーネントや自明なコードはテスト不要。

**NFR-05: セキュリティ**

- [セキュリティ要件]
- 例: 機密情報の管理、認証・認可

**NFR-06: アーキテクチャ**

- [アーキテクチャ原則]
- 例: フェーズ間の移行を考慮した抽象化、疎結合設計

**NFR-07: ライセンスコンプライアンス**

- [外部リソースのライセンス管理]
- 例: 使用する全ての外部リソースのライセンス遵守、クレジット表記

---

## 5. ディレクトリ構成と作成ファイル (Directory Structure & Files)

### 5.1. フェーズ1: MVP実装時のディレクトリ構成

- 例: Next.js プロジェクトの場合

```
app/
├── dashboard/
│   ├── @modal/              # Parallel route
│   ├── @search/             # Parallel route
│   ├── page.tsx             # Server component
│   ├── loading.tsx          # Loading UI (auto-wrapped in Suspense)
│   ├── error.tsx            # Error boundary
│   ├── _components/         # Route-specific UI
│   ├── _features/           # Route-specific logic
│   ├── _hooks/              # Shared across route features
│   ├── _actions/            # Route-specific server actions
│   ├── _lib/                # Route-specific business logic
│   │   ├── userLogic.ts
│   │   └── userLogic.test.ts
│   ├── _store/              # Route-specific Zustand stores
│   │   └── dashboardStore.ts
│   └── _config/             # Route-specific config
├── posts/
│   ├── [slug]/              # Dynamic route
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── _components/
│   ├── _features/
│   ├── _hooks/
│   ├── _actions/
│   ├── _lib/
│   └── _config/
├── page.tsx                # Root page
├── loading.tsx             # Root loading
├── error.tsx               # Root error boundary
└── layout.tsx              # Root layout

components/                # Global shared UI
├── ui/                     # Atomic UI pieces (shadcn/ui, primitives)
├── layouts/                # Layout components (PageLayout, SectionLayout)
└── ...                     # Custom global components

hooks/                     # Global shared hooks
lib/                       # Global business logic
├── userActions.ts
├── userActions.test.ts
├── auth.ts
└── api.ts
store/                     # Global Zustand stores
├── userStore.ts
└── appStore.ts
utils/                     # Pure utilities only (NOT business logic)
├── format.ts              # Date formatting, string manipulation, etc.
└── types.ts               # Global types only (e.g., Result<T,E>)
public/                    # Static assets
```

---

## 6. 外部リソース・ライセンス (External Resources & Licenses)

| リソース     | 用途   | ライセンス       | クレジット表記     |
| ------------ | ------ | ---------------- | ------------------ |
| [リソース名] | [用途] | [ライセンス種別] | [必要なクレジット] |
| [リソース名] | [用途] | [ライセンス種別] | [必要なクレジット] |

---

## 7. 画面設計 (Screen Design)

### 7.1. 画面一覧 (Screen List)

| No  | 画面名   | URLパス     | 機能概要               | 備考 |
| --- | -------- | ----------- | ---------------------- | ---- |
| 001 | ホーム   | `/`         | サービスのトップページ |      |
| XXX | [画面名] | `[URLパス]` | [機能]                 |      |

### 7.2. ワイヤーフレーム・モックアップ (Wireframes & Mockups)

[ワイヤーフレーム・モックアップの挿入場所]

**Note**: It is enough to provide low-fidelity wireframes or figma links.

---

## 8. デザインシステム (Design System)

### 8.1. カラーパレット (Color Palette)

**カラー対応**

- カラーモード: [シングルカラー / デュアルカラー]

- デュアルカラーの場合:
  - ライトモード: [必須 / 不要]
  - ダークモード: [必須 / 不要 / オプション]
  - システム設定追従: [あり / なし]

**ライトモード** or **シングルカラー**

_プライマリカラー_

- Primary: `#000000` - [用途: メインアクション、ブランドカラー]
- Primary hover: `#000000` - [ホバー時の色]

_セカンダリカラー_

- Secondary: `#000000` - [用途: セカンダリアクション]
- Secondary hover: `#000000` - [ホバー時の色]

_背景・テキストカラー_

- Background: `#FFFFFF` - [背景色]
- Surface: `#F5F5F5` - [カード・パネル背景]
- Text primary: `#1A1A1A` - [メインテキスト]
- Text secondary: `#666666` - [サブテキスト]

_セマンティックカラー_

- Success: `#10B981` - [成功状態、完了]
- Warning: `#F59E0B` - [警告、注意]
- Error: `#EF4444` - [エラー、削除]
- Info: `#3B82F6` - [情報、ヘルプ]

**ダークモード** If applicable

_プライマリカラー_

- Primary: `#FFFFFF` - [用途: メインアクション、ブランドカラー]
- Primary hover: `#E5E5E5` - [ホバー時の色]

_セカンダリカラー_

- Secondary: `#A0A0A0` - [用途: セカンダリアクション]
- Secondary hover: `#B0B0B0` - [ホバー時の色]

_背景・テキストカラー_

- Background: `#0A0A0A` - [背景色]
- Surface: `#1A1A1A` - [カード・パネル背景]
- Text primary: `#E5E5E5` - [メインテキスト]
- Text secondary: `#A0A0A0` - [サブテキスト]

_セマンティックカラー_

- Success: `#10B981` - [成功状態、完了]
- Warning: `#F59E0B` - [警告、注意]
- Error: `#EF4444` - [エラー、削除]
- Info: `#3B82F6` - [情報、ヘルプ]

**コントラスト比**

- Text primary / Background: 4.5:1 以上（WCAG AA準拠）
- Text secondary / Background: 4.5:1 以上
- Interactive elements: 3:1 以上

**実装パターン**

- Tailwind の `dark:` バリアントを使用: `bg-white dark:bg-black`
- `next-themes` などのライブラリでテーマ切り替え実装
- システム設定追従の場合: `darkMode: 'media'` を使用

**Note**: If use design system libraries like shadcn/ui, describe how to customize colors using their theming approach.

---

## 9. 備考・参考資料 (Notes & References)

- [参考URL]
- [デザインモックアップ]
- [その他補足情報]
