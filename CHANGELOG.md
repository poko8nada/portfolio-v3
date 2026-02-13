# Changelog

## Unreleased

### Added

- `typecheck` script (`pnpm exec tsc --noEmit`)
- `format` script (`biome format --write .`)
- README を追加
- MVP 要件/タスクドキュメントに運用タスク（GA4・カスタムドメイン）を追記

### Changed

- `app/lib/r2.ts` のキャッシュ処理を共通化し可読性を改善

### Fixed

- Cache API ヘルパーの戻り値型を `Response | null` に統一
- TypeScript をローカル依存に追加し、`honox/client` の誤検知型エラーを解消
