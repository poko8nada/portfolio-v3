# prod1実装タスク (tasks-prod1.md)

## Phase 1: Admin基盤・アクセス制御

### Task 0: 依存関係のセットアップ

- [ ] 必要パッケージ追加（必要最小限）
  - `pnpm add remark-gfm`
  - `pnpm add rehype-highlight` または `pnpm add rehype-prism-plus`
  - `pnpm add remark-toc rehype-external-links rehype-sanitize`
  - `pnpm add remark-math rehype-katex`（数式を有効化する場合のみ）
  - `pnpm add remark-link-card` または `pnpm add open-graph-scraper`（リンクカード方式に応じて）
  - `pnpm add jose`（Worker内JWT検証を行う場合）
- [ ] 開発環境確認
  - `pnpm dev` で起動確認
- [ ] 認証構成方針を設定
  - Cloudflare Access で `/admin/*` を保護
  - 必要に応じて `wrangler.jsonc` に認証用変数追加（`TEAM_DOMAIN`, `POLICY_AUD` など）

**依存関係**: なし  
**成果物**: prod1機能追加に必要な依存と認証前提の整備  
**完了条件**: 管理ルートが保護される方針と実装面の準備が完了  
**テスト**: 手動確認

### Task 1: 候補比較と採用決定（議論後確定）

- [ ] ハイライト方式を決定
  - `rehype-highlight` / `rehype-prism-plus` の比較（保守性、CSS負荷、表示品質）
- [ ] リンクカード方式を決定
  - `remark-link-card` / 自前OGP取得（`open-graph-scraper`）の比較（制御性、SSR安定性）
- [ ] 追加Markdown拡張の採用有無を決定
  - `remark-toc`, `rehype-external-links`, `rehype-sanitize`
  - `remark-math + rehype-katex`（必要時のみ）

**依存関係**: Task 0  
**成果物**: 実装に使うライブラリ構成の確定  
**完了条件**: 採用パッケージと非採用理由が記録されている  
**テスト**: 不要

### Task 2: Adminルート・認証ガード実装

- [ ] `app/routes/admin/index.tsx` - 管理トップ（記事一覧）
- [ ] `app/server.ts`（またはミドルウェア） - admin ルートの認証ガード **(FR-11)**
- [ ] `wrangler.jsonc` - 必要な環境変数定義（JWT検証時）

**依存関係**: Task 1  
**成果物**: `/admin/*` のアクセス保護とダッシュボード入口  
**完了条件**: 未認証アクセスが拒否される  
**テスト**: 手動確認 + 必要に応じて単体テスト

## Phase 2: Markdown CRUD + Preview

### Task 3: 新規作成フロー

- [ ] `app/routes/admin/new.tsx` - フォーム、プレビュー、保存 **(FR-12, FR-13)**
- [ ] `app/lib/r2.ts` - create処理追加
- [ ] `app/lib/markdown.ts` - プレビュー向け共通処理整備

**依存関係**: Task 2  
**成果物**: 記事の新規作成が可能  
**完了条件**: 作成後に一覧/詳細に反映される  
**テスト**: Vitest（ロジック）+ 手動確認

### Task 4: 編集・削除フロー

- [ ] `app/routes/admin/[slug].tsx` - 編集、プレビュー、更新、削除 **(FR-12, FR-13)**
- [ ] `app/lib/r2.ts` - update/delete処理追加
- [ ] `app/lib/r2.test.ts` - CRUD系テスト追加

**依存関係**: Task 3  
**成果物**: 既存記事の更新・削除が可能  
**完了条件**: 更新内容が反映され、削除後は一覧から消える  
**テスト**: Vitest + 手動確認

## Phase 3: Markdown拡張（コード・リンクカード）

### Task 5: GFM + コードシンタックス拡張

- [ ] `app/lib/markdown.ts` - `remark-gfm` とハイライト処理を統合 **(FR-14)**
- [ ] `app/style.css` - コードブロック表示調整（必要時）
- [ ] `app/lib/markdown.test.ts` - コードブロック変換の検証追加

**依存関係**: Task 3  
**成果物**: コードブロックの可読性向上  
**完了条件**: 公開ページ/管理プレビューで同一表示になる  
**テスト**: Vitest

### Task 6: リンクカード + TOC + 外部リンク + sanitize拡張

- [ ] `app/routes/api/link-preview.ts` - OGP取得API（タイムアウト/制限付き） **(FR-15)**
- [ ] `app/lib/markdown.ts` - リンクカード記法の変換処理
- [ ] `app/components/link-card.tsx` - 表示コンポーネント（必要時）
- [ ] `app/lib/markdown.ts` - `remark-toc`, `rehype-external-links`, `rehype-sanitize` 統合 **(FR-16)**
- [ ] `app/lib/markdown.ts` - `remark-math + rehype-katex` を必要時に統合 **(FR-16)**

**依存関係**: Task 5  
**成果物**: 記事内リンクのカード表示  
**完了条件**: OGP取得成功/失敗の双方で崩れず表示し、TOC/外部リンク/sanitize方針が反映される  
**テスト**: Vitest + 手動確認

## Phase 4: 検証・運用準備

### Task 7: 検証

- [ ] `pnpm test`（既存 + 追加テスト）
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] 手動確認（Chrome/Firefox/Safari）
  - [ ] admin認証とCRUD
  - [ ] プレビュー整合
  - [ ] コードシンタックス表示
  - [ ] リンクカード表示とフォールバック
  - [ ] 目次生成 / 外部リンク属性 / sanitize

**依存関係**: Task 2〜6  
**成果物**: prod1出荷前の品質確認結果  
**完了条件**: 主要機能の正常系/異常系が確認済み  
**テスト**: 既存コマンド + 手動確認

---

## FRトレーサビリティ

| FR ID | 機能名                     | 主対象ファイル                                          | 対応Task  |
| ----- | -------------------------- | ------------------------------------------------------- | --------- |
| FR-11 | adminルート保護            | `app/server.ts`, `app/routes/admin/*`                   | Task 2    |
| FR-12 | md CRUD                    | `app/routes/admin/*`, `app/lib/r2.ts`                   | Task 3, 4 |
| FR-13 | md preview                 | `app/routes/admin/*`, `app/lib/markdown.ts`             | Task 3, 4 |
| FR-14 | コードシンタックス拡張     | `app/lib/markdown.ts`, `app/style.css`                  | Task 5    |
| FR-15 | リンクカード拡張           | `app/routes/api/link-preview.ts`, `app/lib/markdown.ts` | Task 6    |
| FR-16 | 外部リンク/目次/安全性拡張 | `app/lib/markdown.ts`                                   | Task 6    |
