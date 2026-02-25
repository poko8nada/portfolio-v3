# prod1実装タスク (tasks-prod1.md)

## 方針

- このドキュメントは `docs/requirement-prod1.md`（FR-11〜FR-16）を、**縦切りで動く単位**に再分解した実装計画。
- 各タスクは「対象ファイル最大5つ」を守る。
- 各タスクで必ず「実行時検証（`pnpm run dev`）」と「自動検証（Vitest/型検査）」を完了する。

---

## Phase 0: セットアップと方針確定

### Task 0: 依存関係・実装方針の固定（ゲートタスク）

- 対象ファイル
  - [ ] `package.json` - 追加依存の確定（`remark-gfm`, ハイライト系, `remark-toc`, `rehype-external-links`, `rehype-sanitize`, 必要時 `jose`）
  - [ ] `pnpm-lock.yaml` - ロック更新
  - [ ] `wrangler.jsonc` - Access/JWT連携に必要な変数を確定
- 依存関係: なし
- リスク: **高**（依存選定と認証方式で後続コストが変わる）

**完了条件**

- 実行時検証: `pnpm run dev` が起動し既存公開ページ（`/`, `/posts`）が崩れない
- 自動検証: `pnpm run typecheck` が通る

---

## Phase 1: 管理画面の縦切り（Skeleton → CRUD完成）

### Task 1: 管理画面の最小動作スライス（FR-11 skeleton）

- 対象ファイル
  - [ ] `app/server.ts` - `/admin/*` ガードの最小実装（拒否レスポンス統一）
  - [ ] `app/routes/admin/index.tsx` - 管理トップの最小UI
  - [ ] `app/routes/admin/index.test.tsx` - 画面/ガードの最小テスト
- 依存関係: Task 0

**完了条件**

- 実行時検証: 未認証相当で `/admin` にアクセスすると拒否され、認証済み相当では管理トップが表示される
- 自動検証: `pnpm run test app/routes/admin/index.test.tsx`

### Task 2: 新規作成フローを先に通す（FR-12 create + FR-13 partial）

- 対象ファイル
  - [ ] `app/routes/admin/new.tsx` - 新規作成フォーム（slug/frontmatter/body バリデーション含む）
  - [ ] `app/lib/r2.ts` - `createPost` 実装
  - [ ] `app/lib/r2.test.ts` - `createPost` 正常/異常
  - [ ] `app/routes/admin/index.tsx` - 作成後の一覧導線を最小追加
- 依存関係: Task 1

**完了条件**

- 実行時検証: `/admin/new` から作成でき、`/admin` へ戻ると新規記事が確認できる
- 自動検証: `pnpm run test app/lib/r2.test.ts`

### Task 3: 編集/削除を追加してCRUDを閉じる（FR-12 complete）

- 対象ファイル
  - [ ] `app/routes/admin/[slug].tsx` - 編集・削除UI
  - [ ] `app/lib/r2.ts` - `updatePost`, `deletePost` 実装
  - [ ] `app/lib/r2.test.ts` - update/delete 正常/異常テスト追加
  - [ ] `app/routes/admin/index.tsx` - 編集導線/削除反映の整合
- 依存関係: Task 2

**完了条件**

- 実行時検証: `/admin/:slug` で更新結果が公開ページに反映され、削除後は対象記事に到達できない
- 自動検証: `pnpm run test app/lib/r2.test.ts`

---

## Phase 2: プレビューと公開表示の同一化（FR-13）

### Task 4: 新規作成画面でリアルタイムプレビューを成立

- 対象ファイル
  - [ ] `app/lib/markdown.ts` - 公開と共通のMarkdown処理をエクスポート
  - [ ] `app/components/post-content.tsx` - 共通レンダラーの再利用
  - [ ] `app/routes/admin/new.tsx` - 入力中プレビュー
  - [ ] `app/lib/markdown.test.ts` - 変換の正常/異常ケース
- 依存関係: Task 3

**完了条件**

- 実行時検証: `/admin/new` で入力変更が即時反映され、公開ページ表示との差異がない
- 自動検証: `pnpm run test app/lib/markdown.test.ts`

### Task 5: 編集画面にも同一プレビューを展開

- 対象ファイル
  - [ ] `app/routes/admin/[slug].tsx` - 編集中プレビュー
  - [ ] `app/lib/markdown.ts` - 編集画面向けの入力/エラー制御調整
  - [ ] `app/lib/markdown.test.ts` - 編集時の不正入力ケース追加
- 依存関係: Task 4

**完了条件**

- 実行時検証: `/admin/:slug` の編集で即時プレビューが安定し、保存前後で表示が破綻しない
- 自動検証: `pnpm run test app/lib/markdown.test.ts`

---

## Phase 3: Markdown拡張（段階導入）

### Task 6: コードシンタックス拡張（FR-14）

- 対象ファイル
  - [ ] `app/lib/markdown.ts` - GFM + ハイライト統合、未対応言語フォールバック
  - [ ] `app/lib/markdown.test.ts` - 複数言語コードブロック検証
  - [ ] `app/style.css` - コードブロック表示調整
- 依存関係: Task 5
- リスク: **中**（採用ライブラリ差分でCSS調整量が変わる）

**完了条件**

- 実行時検証: 公開ページと管理プレビュー双方でコードブロックが崩れず可読
- 自動検証: `pnpm run test app/lib/markdown.test.ts`

### Task 7: 外部リンク/TOC/sanitize を同時に有効化（FR-16）

- 対象ファイル
  - [ ] `app/lib/markdown.ts` - TOC/外部リンク属性/sanitize を統合
  - [ ] `app/lib/markdown.test.ts` - TOC、外部リンク属性、XSS除去のテスト
  - [ ] `app/components/post-content.tsx` - TOC表示位置の最小調整（必要時）
- 依存関係: Task 6
- リスク: **高**（sanitize 設定次第で表示欠損またはXSS残存）

**完了条件**

- 実行時検証: TOC生成、外部リンク属性、危険HTML除去が画面で確認できる
- 自動検証: `pnpm run test app/lib/markdown.test.ts`

### Task 8: リンクカードの最小縦切り（FR-15 skeleton）

- 対象ファイル
  - [ ] `app/components/link-card.tsx` - カードUIの最小実装
  - [ ] `app/lib/markdown.ts` - 対象リンクをカードへ変換する最小処理
  - [ ] `app/lib/markdown.test.ts` - 変換成功/対象外ケース
  - [ ] `app/components/post-content.tsx` - カード描画ルート接続
- 依存関係: Task 7

**完了条件**

- 実行時検証: 対象記法のリンクがカード表示され、対象外は通常リンク表示
- 自動検証: `pnpm run test app/lib/markdown.test.ts`

### Task 9: OGP取得連携とフォールバック完成（FR-15 complete）

- 対象ファイル
  - [ ] `app/routes/api/link-preview.ts` - OGP取得API（タイムアウト/ドメイン制限）
  - [ ] `app/components/link-card.tsx` - APIレスポンス表示と失敗時フォールバック
  - [ ] `app/lib/markdown.ts` - API連携時の変換制御
  - [ ] `app/lib/markdown.test.ts` - API失敗時フォールバック検証
- 依存関係: Task 8
- リスク: **高**（外部サイト依存、SSRF/タイムアウト管理）

**完了条件**

- 実行時検証: OGP取得成功時はカード表示、失敗時は通常リンクへフォールバック
- 自動検証: `pnpm run test app/lib/markdown.test.ts`

---

## Phase 4: 安定化・検証・デプロイ

### Task 10: 認証の本番ハードニング（FR-11 finalize）

- 対象ファイル
  - [ ] `app/server.ts` - 401/403条件の厳密化、必要時JWT検証
  - [ ] `wrangler.jsonc` - 本番環境変数の最終反映
  - [ ] `app/server.test.ts` - 認証境界の正常/異常テスト
- 依存関係: Task 9
- リスク: **高**（Cloudflare Access運用とWorkers実装の責務境界）

**完了条件**

- 実行時検証: `/admin/*` で想定外の通過がなく、拒否理由に応じて 401/403 が返る
- 自動検証: `pnpm run test app/server.test.ts`

### Task 11: 横断リグレッションとリリース準備

- 対象ファイル
  - [ ] `docs/tasks-prod1.md` - 実績反映（必要に応じてチェック更新）
  - [ ] `README.md` - 運用/検証手順の追記（必要時）
- 依存関係: Task 10

**完了条件**

- 実行時検証:
  - `pnpm run preview` で `/admin`, `/admin/new`, `/admin/:slug`, `/posts/:slug` の主要導線が成立
  - Chrome latest / Firefox latest / Safari latest で主要導線が破綻しない
- 自動検証:
  - `pnpm run test`
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run build`

---

## リスク項目（継続監視）

- [ ] 認証責務の境界: Cloudflare Accessのみで十分か、Workers側JWT検証を必須化するか
- [ ] Markdown sanitize: 安全性を上げるほど許容HTMLが狭まり、既存記事表示に影響する
- [ ] OGP取得: 外部依存による遅延/失敗をどこまで許容するか（タイムアウト/キャッシュ方針）
- [ ] 依存ライブラリ: ハイライト/リンクカード実装方式で保守コストが変化する

## デプロイ前チェックリスト

- [ ] 追加依存と `wrangler.jsonc` の設定が反映済み
- [ ] `pnpm run test` が通る
- [ ] `pnpm run typecheck` が通る
- [ ] `pnpm run lint` が通る
- [ ] `pnpm run build` が通る
- [ ] ステージングで `admin認証`, `CRUD`, `プレビュー`, `コード表示`, `リンクカード`, `TOC/外部リンク/sanitize` を確認
- [ ] prod2へ送る未解決事項（認証方式/リンクカード運用/sanitize許可範囲）を記録
