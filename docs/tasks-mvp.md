# MVP実装タスク (tasks-mvp.md)

## Phase 1: 基盤/レイアウト

### Task 0: 依存関係のセットアップ

- [x] 追加パッケージなし（現状の依存関係を維持）
- [x] `package.json` のスクリプト確認
  - `dev`, `build`, `preview`, `deploy`, `test`, `lint`
- [x] 開発環境の動作確認
  - `pnpm dev` でエラーが出ないことを確認
- [x] 不要なファイル・コードの削除
  - なし

**依存関係**: なし
**成果物**: 開発に必要なライブラリとスクリプトが利用可能な状態
**完了条件**: `pnpm dev` が起動できる
**テスト**: 不要

### Task 1: グローバルレイアウト

- [x] `app/routes/_renderer.tsx` - HTML骨格/ヘッダー/フッター固定 **(FR-01)**
- [x] `app/components/header.tsx` - ナビゲーション/ロゴ
- [x] `app/components/footer.tsx` - 固定フッター
- [x] `app/style.css` - ベーススタイル/フォント/カラー

**依存関係**: Task 0
**成果物**: 共通レイアウトの完成
**完了条件**: 主要ページでヘッダー/フッターが固定表示
**テスト**: 手動確認

### Task 1.5: 共通コンポーネント作成

- [x] `app/components/text-link.tsx` - 再利用可能なテキストリンクコンポーネント
- [x] `app/components/section.tsx` - セクションラッパーコンポーネント（必要に応じて）
- [x] `app/components/button.tsx` - 再利用可能なボタンコンポーネント（必要に応じて）
- [x] `app/components/list-content.tsx` - コンテンツリスト表示コンポーネント（必要に応じて）

**依存関係**: Task 1
**成果物**: 共通パーツの整備
**完了条件**: 他コンポーネントで使用可能
**テスト**: 不要

## Phase 2: Home/Posts

### Task 2: Homeページ

- [x] `app/routes/index.tsx` - About/Posts/Tools概要 **(FR-02)**

**依存関係**: Task 1
**成果物**: Home画面
**完了条件**: 各セクションが表示される
**テスト**: 手動確認

### Task 2.1: Postsリンク整合

- [x] `app/routes/index.tsx` - タグリンク(`/posts?tag=...`)と一覧ルート(`/posts`)の整合

**依存関係**: Task 2
**成果物**: Homeからの導線が正しいURLに統一
**完了条件**: Posts詳細/一覧の遷移が正しく動作
**テスト**: 手動確認

### Task 3: ブログ一覧

- [x] `app/routes/posts/index.tsx` - 一覧表示 **(FR-03)**
- [x] `app/features/post-list.tsx` - 一覧取得/タグ・タイトルフィルタ/表示 **(FR-03a)**
- [x] `app/lib/r2.ts` - R2取得の調整 **(FR-05)**
- [x] `app/lib/r2.test.ts` - R2ユーティリティのテスト更新 **(FR-05)**

**依存関係**: Task 2
**成果物**: ブログ一覧ページ
**完了条件**: R2から一覧が表示される、タイトルフィルタで記事除外が動作
**テスト**: 既存テスト + 手動確認

### Task 4: ブログ詳細

- [x] `app/routes/posts/[slug].tsx` - 詳細表示 + Recent Posts表示 **(FR-04)**
- [x] `app/components/post-content.tsx` - 記事本文表示コンポーネント **(FR-06a)**
- [x] `app/lib/markdown.ts` - Markdown変換 + PostData型エクスポート **(FR-06)**
- [x] `app/lib/markdown.test.ts` - Markdownユーティリティのテスト更新 **(FR-06)**

**依存関係**: Task 3
**成果物**: ブログ詳細ページ + Recent Postsセクション
**完了条件**: slugで本文が表示される、下部にRecent Postsが表示される、非公開記事は表示されない
**テスト**: 既存テスト + 手動確認

## Phase 3: タグフィルタ

### Task 5: タグフィルタ（UI）

- [x] `app/islands/tag-filter.tsx` - 選択中タグの表示/解除 **(FR-08)**
- [x] `app/routes/posts/index.tsx` - tagをURLクエリから設定

**依存関係**: Task 3
**成果物**: タグフィルタUI
**完了条件**: 選択中タグが表示され、解除で `/posts` に戻る
**テスト**: 手動確認

## Phase 4: 画像配信

### Task 6: 画像API

- [x] `app/routes/api/images/[path].ts` - R2画像配信 **(FR-09)**
- [x] `app/routes/api/images/[path].test.ts` - 画像APIのキャッシュ/404挙動テスト

**依存関係**: Task 0
**成果物**: 画像API
**完了条件**: 画像が取得できる
**テスト**: 既存テスト

## Phase 4.5: キャッシュ最適化

### Task 7: Cache API 実装

- [x] `app/lib/r2.ts` - Cache API ロジックの追加 **(FR-10)**
- [x] `app/lib/r2.test.ts` - キャッシュロジックのテストコード追加
- [x] `app/routes/posts/[slug].tsx` - ExecutionContext の受け渡し対応
- [x] `app/routes/api/images/[path].ts` - ExecutionContext の受け渡しと X-Cache ヘッダー追加

**依存関係**: Task 3, Task 6
**成果物**: キャッシュ対応済みR2クライアント
**完了条件**: 重複リクエスト時にキャッシュが利用され、`X-Cache: HIT` が返ること
**テスト**: `app/lib/r2.test.ts` (Vitest)

---

## Phase 5: 検証・最適化・デプロイ (Validation & Deployment)

### Task 8: ブラウザ互換性・パフォーマンス確認

- [x] ブラウザ互換性テスト（手動確認）
  - Chrome latest: 全機能動作確認
  - Firefox latest: 全機能動作確認
  - Safari latest: 全機能動作確認
- [x] パフォーマンス測定
  - 主要ページのLCP/CLS確認
- [x] アクセシビリティ監査（手動）
  - WCAG AA 基準を意識
- [x] 最小限の単体テスト実行

**依存関係**: 機能実装完了
**完了条件**: 全ブラウザで動作確認完了、最小限のテストがパス
**注**: E2E テストは実施しない

### Task 9: デプロイ準備・本番環境確認

- [x] OGP 画像作成・配置 (`ogp.png`)
- [x] Favicon 準備・追加 (`favicon.ico`)
- [x] メタデータ実装 (title, description, OGP)
  - [x] `app/routes/_renderer.tsx`: 共通のOGP/Twitterタグ設定
  - [x] `app/routes/index.tsx`: Home個別のメタ情報
  - [x] `app/routes/posts/index.tsx`: 一覧ページのメタ情報
  - [x] `app/routes/posts/[slug].tsx`: 記事ごとの動的なメタ情報
- [ ] 本番環境での動作確認
  - 全機能の動作確認
  - レスポンシブ表示確認
- [ ] 次段階への移行準備ドキュメント作成
  - requirement-v3-1.md, tasks-v3-1.md

**依存関係**: ブラウザ互換性・パフォーマンス確認完了
**成果物**: デプロイ済み MVP、運用ドキュメント
**完了条件**: 本番環境で全機能が動作すること

### Task 10: ダッシュボード運用設定（手動）

- [ ] GA4 / GTM 移設（ダッシュボード作業）
  - [ ] 既存ポートフォリオの GTM コンテナ設定（タグ/トリガー/変数）を棚卸し
  - [ ] 本ポートフォリオの GTM コンテナへ GA4 設定タグ・イベントタグを移設
  - [ ] GTM Preview で主要ページ（`/`, `/posts`, `/posts/:slug`）の発火確認
  - [ ] GA4 Realtime でイベント受信確認後、GTM を Publish
- [ ] GA4 / GTM 受け口実装（コード作業）
  - [x] GTM スニペット埋め込み位置を `_renderer.tsx` で確認・反映
  - [x] GTM/GA4 で利用する環境変数を `wrangler.jsonc` に定義
  - [ ] ローカル/Preview で環境変数注入時のタグ出力を確認
- [ ] カスタムドメイン移設（Cloudflare管理）
  - [ ] Cloudflare DNS/Workers Routes で既存ドメイン設定を引き継ぎ
  - [ ] SSL/TLS 証明書状態とリダイレクト設定（www有無）を確認
  - [ ] 公開URLでルーティング・計測（GA4）・静的アセット配信を確認

**依存関係**: Task 9
**成果物**: 運用設定が本番環境へ反映された状態
**完了条件**: GA4 / カスタムドメインが期待通り動作すること
**テスト**: 手動確認（ダッシュボード + 公開URL）

---

## チェックリスト（デプロイ前最終確認）

### テスト

- [x] 最小限の単体テストがパス（`pnpm test`）
- [x] 全ブラウザで手動動作確認完了（Chrome, Firefox, Safari）

### リソース・メタデータ

- [x] OGP画像・Favicon設置完了
- [x] メタデータ設定完了（title, description, OGP）

### 機能確認

- [x] Home 動作確認
- [x] post一覧 動作確認
- [x] post詳細 動作確認
- [x] タグフィルタ動作確認
- [x] エラーハンドリング動作確認

### デプロイ

- [x] 本番環境で全機能動作確認
- [x] 環境変数設定確認（該当する場合）
- [x] ビルド成功確認

### ドキュメント

- [x] README.md 更新完了
