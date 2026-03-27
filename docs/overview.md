---
last-validated: 2026-03-27
phase: current
---

# portfolio-v3

## Problem

Poko Hanada のプロフィール、公開記事、制作物を 1 つの公開サイトで静かに提示しつつ、更新コストを抑えたまま継続運用できる状態を作ることがこのプロジェクトの目的です。

単なる名刺代わりの静的ページではなく、R2 に置いた Markdown 記事を継続的に公開できるポートフォリオ兼ブログとして機能する必要があります。

## Goals

- Poko Hanada の自己紹介、外部プロフィール、制作物への導線を 1 つのサイトで提供する。
- 公開記事を Markdown ベースで継続運用できるようにし、一覧・詳細・タグ導線を保つ。
- Cloudflare Workers 上で、静的サイトに近い体感速度と低い運用負荷を両立する。
- 本番用とステージング用の公開環境を分けたまま、同一のコンテンツバケットを利用できるようにする。

## Non-goals

- ブラウザ上の管理画面や記事 CRUD UI を現行フェーズで提供すること。リポジトリ内の現行実装には `/admin` 系ルートが存在しません。
- 会員機能、コメント、検索、複数著者対応を提供すること。公開閲覧用サイトとして構成されています。
- データベースや ORM を導入して投稿を管理すること。現行のコンテンツソースは R2 上の Markdown とアセットです。
- 高度なアニメーションや装飾を主目的にすること。テキスト中心で落ち着いた表現が優先されています。
- 本番 R2 バケットを唯一の編集元として運用すること。編集と差分確認はローカルディレクトリを起点に行う前提です。

## Constraints

- 実行基盤は Cloudflare Workers で、デプロイ設定は Wrangler により管理されます。
- 記事本文と配信用アセットは `POSTS_BUCKET` にバインドされた R2 バケットを前提とします。
- 公開記事用コンテンツの source of truth は `seeds/blogs`、プロフィール資料用コンテンツの source of truth は `seeds/resume-assets` とします。
- ローカル開発で参照する `.wrangler/state` と本番 R2 は、どちらもローカルディレクトリから push される配信先として扱います。
- 本番環境は `pokohanada.com`、ステージング環境は `staging.pokohanada.com` のカスタムドメイン運用を前提とします。
- GTM は `GTM_CONTAINER_ID` 環境変数が設定された場合のみ共通レイアウトへ埋め込まれます。

## Planned Evolution

- `About` 詳細ページは `/about` として独立させ、記事用 `POSTS_BUCKET` とは別の R2 バケットにあるプロフィール用 Markdown 群を組み立てて表示する方針です。 → see ADR-0003
- 次フェーズでは、同じ Workers アプリの中に `/admin/*` 配下の管理画面を追加し、Cloudflare Access を第一防衛線として保護する方針です。 → see ADR-0002
- 記事の作成、編集、削除、プレビューは、既存の R2 ベース運用を維持したままブラウザから扱えるようにする方針です。 → see ADR-0002
- Markdown 表示は、コードハイライト、外部リンク制御、TOC、sanitize、必要に応じたリンクカードまで拡張する想定ですが、具体的なライブラリ選定はまだ固定されていません。
- 将来の優先順位は、独立 CMS や別 API サービスを増やすことよりも、現行の配信基盤を保ったまま執筆運用と表示品質を高めることにあります。

## Tech Stack Rationale

- HonoX + Hono: JSX ベースのサーバーレンダリングと Cloudflare Workers への適合を両立しやすいため。 → see ADR-0001
- Cloudflare R2: 記事 Markdown と画像アセットをオブジェクトストレージで配信しつつ、ローカル側の Markdown/asset ディレクトリを編集起点に保てるため。 → see ADR-0001, ADR-0004
- Cloudflare Cache API: R2 読み出しを都度発生させず、公開閲覧時の応答性を改善するため。 → see ADR-0001
- About 用の別 R2 バケット: 記事コンテンツ契約とプロフィール資料の更新単位を分離したまま、同じ Workers アプリで表示責務を保てるため。 → see ADR-0003
- `rclone` と Wrangler R2 CLI の併用: production R2 は exact mirror の fetch/push を `rclone` で扱い、local `.wrangler/state` は Wrangler 経由で明示的に再構築するため。 → see ADR-0004
- Tailwind CSS v4: 少ないコンポーネント数でも一貫したダークトーンの UI を保ちやすいため。
- Cloudflare Access: 将来の管理画面をアプリ内に同居させつつ、公開面と管理面の責務を分けるのに適しているため。 → see ADR-0002
