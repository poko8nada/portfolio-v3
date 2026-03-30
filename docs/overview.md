---
last-validated: 2026-03-30
phase: current
---

# portfolio-v3

## Problem

- Poko Hanada のプロフィール、制作物、公開記事を 1 つの公開サイトで提示し、個人運用でも無理なく更新を続けられる状態を作る。
- 単なる静的な名刺ページではなく、記事公開を継続できるポートフォリオ兼ブログとして運用する。

## Goals

- 自己紹介、外部プロフィール、制作物、記事への導線を 1 つのサイトに集約する。
- Markdown ベースの記事を一覧、詳細、タグ導線つきで継続公開できるようにする。
- Cloudflare Workers 上で、静的サイトに近い体感速度と低い運用負荷を両立する。
- R2 配信コンテンツをローカルディレクトリ起点で管理し、差分確認や復旧をしやすくする。

## Non-goals

- 現行フェーズでブラウザ上の管理画面や記事 CRUD UI を提供すること。
- 会員機能、コメント、検索、複数著者対応を提供すること。
- データベースや外部 CMS を導入して投稿管理を行うこと。
- 高度な演出やアニメーションを主目的にすること。

## Constraints

- 実行基盤は Cloudflare Workers で、デプロイ設定は Wrangler で管理する。
- 公開記事と記事用アセットは `POSTS_BUCKET` を通じて R2 から配信する。
- 公開記事コンテンツの編集起点は `seeds/blogs` とする。
- `seeds/resume-assets` は保持できるが、現行 `/about` のランタイム入力にはしない。
- 本番環境は `pokohanada.com`、ステージング環境は `staging.pokohanada.com` のカスタムドメインを前提とする。
- GTM は `GTM_CONTAINER_ID` が設定された場合のみ埋め込む。

## Tech Stack Rationale

- HonoX + Hono: Cloudflare Workers 上で JSX ベースの SSR を扱いやすくするため。 → see ADR-0001
- Cloudflare R2 + Cache API: Markdown と画像アセットを軽量に配信しつつ、再読込時の応答性を確保するため。 → see ADR-0001
- ローカルディレクトリ起点の content sync: Git とファイル差分を編集の正本として扱い、production R2 と local preview の同期責務を明確にするため。 → see ADR-0006
- アプリ内の構造化データ: `/about` のスタック表示で安定した並び替えと型付けを保つため。 → see ADR-0005
- Tailwind CSS v4: 少ない UI コンポーネントでも一貫した見た目を維持しやすいため。
