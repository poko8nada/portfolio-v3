---
title: スタック
type: stack
createdAt: "2026-03-27"
updatedAt: "2026-03-27"
---

<!--
  メモ: この Markdown は About 等をコンポーネントで組み立てるときの参照用ソース想定。
  レベル列の意味:
  - Aware    … 触れた・学習・補助的に使う
  - Applied  … 実務・個人開発で継続的に使う
  - Primary  … 設計の中心・日常的に主力で使う
-->

## 技術スタック

### 言語・マークアップ

| 項目                    | レベル  | 内容                                            |
| ----------------------- | ------- | ----------------------------------------------- |
| TypeScript / JavaScript | Primary | ES2015 以降、型を意識した実装                   |
| HTML5 / CSS3            | Primary | セマンティックHTML、Grid、Flexbox、レスポンシブ |

### フロントエンド

| 項目         | レベル  | 内容                                               |
| ------------ | ------- | -------------------------------------------------- |
| React        | Primary | 関数コンポーネント、Hooks、Context                 |
| Next.js      | Applied | App Router、Server Components、Server Actions      |
| Tailwind CSS | Primary | ユーティリティファースト、デザイントークンとの併用 |
| shadcn/ui    | Applied | Radix 系を前提としたコンポーネント構成             |
| HeroUI       | Aware   | モダンUIコンポーネントの選定・カスタマイズ         |

### バックエンド・データ

| 項目                | レベル  | 内容                                |
| ------------------- | ------- | ----------------------------------- |
| Node.js             | Applied | API・バッチ、Server Actions 連携    |
| Drizzle ORM         | Applied | 型安全なスキーマとクエリ            |
| Turso               | Aware   | SQLite ベースのエッジ向けDB         |
| Supabase            | Applied | PostgreSQL 前提のBaaS、認証・RLS    |
| MongoDB / Firestore | Aware   | NoSQL・ドキュメント指向の設計・操作 |

### ビルド・品質・リポジトリ

| 項目           | レベル  | 内容                                       |
| -------------- | ------- | ------------------------------------------ |
| Vite           | Primary | 開発サーバー、本番ビルド                   |
| Git / GitHub   | Primary | ブランチ運用、レビュー、GitHub Actions     |
| Biome          | Applied | Linter / Formatter                         |
| Oxlint / Oxfmt | Applied | Linter / Formatter（Oxc 系ツールチェーン） |

### 連携・ドキュメント

| 項目                | レベル  | 内容                                   |
| ------------------- | ------- | -------------------------------------- |
| Notion / Notion API | Applied | ドキュメント管理、コンテンツ取得・連携 |
| Resend              | Aware   | トランザクションメール                 |

### インフラ・クラウド

| 項目                 | レベル  | 内容                                 |
| -------------------- | ------- | ------------------------------------ |
| Cloudflare Workers   | Primary | エッジでのルーティング・API          |
| Cloudflare Pages     | Applied | 静的フロントのホスティング           |
| Cloudflare R2        | Applied | オブジェクトストレージ               |
| Cloudflare Turnstile | Applied | Bot対策                              |
| Vercel / Netlify     | Applied | フロント・サーバーレスのデプロイ     |
| Google Cloud         | Aware   | 各種マネージドサービスの利用         |
| Docker               | Aware   | イメージの利用、基本的なコンテナ操作 |

### 分析・マーケティング（ツール）

| 項目               | レベル  | 内容                                             |
| ------------------ | ------- | ------------------------------------------------ |
| Google Analytics 4 | Applied | イベント設計、計測レビュー                       |
| Google Tag Manager | Applied | タグ管理、配信設定                               |
| MAツール           | Primary | キャンペーン企画・設計、制作・運用ディレクション |

## プロフェッショナルスキル

| 項目           | レベル  | 内容                                             |
| -------------- | ------- | ------------------------------------------------ |
| プロジェクト   | Primary | 工程・品質の整理、小さめチームでのリード経験     |
| 提案・営業寄り | Applied | BtoB向けの資料・打合せ                           |
| 関係者との調整 | Applied | 自治体・事業者など、立場の違う相手とのすり合わせ |
| チーム周り     | Applied | 採用の補助、研修の一部                           |

## 領域知識・キャリア

| 項目              | レベル  | 内容                                   |
| ----------------- | ------- | -------------------------------------- |
| 建設・土木        | Applied | 耐震診断、劣化調査、コンクリート構造物 |
| 環境・リサイクル  | Applied | 廃棄物処理、マッチングビジネス         |
| 教育・人材育成    | Applied | 学校運営、研修の企画・実施             |
| Webマーケティング | Applied | コンテンツ制作、MA と連動した施策      |

## 学習・キャリアの傾向

| 項目               | レベル  | 内容                            |
| ------------------ | ------- | ------------------------------- |
| 独学でのスキル獲得 | Primary | Web開発を自主的に習得           |
| キャリアチェンジ   | Applied | 建設コンサル → 環境 → 教育 → IT |
| 継続的改善         | Primary | 業務プロセスの見直し、効率化    |
