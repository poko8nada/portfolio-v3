---
name: behavior
description: >
  Creates or updates docs/behavior.md — a lightweight summary of expected behavior
  per feature or page. Load when adding a new feature, clarifying intent of an
  existing one, or aligning behavior with test coverage.
  Assumes code and tests are the source of truth; this document is supplementary.
---

# Behavior

## Purpose of docs/behavior.md

Code and tests are the source of truth. This document supplements them.

- Helps connect behavior with existing or intended test coverage
- Describes roughly what the happy path and failure path should look like
- Does not aim to be exhaustive — if something is not written here, read the code

## Relation to app-testing

Use `.cursor/skills/app-testing/SKILL.md` when deciding which boundary should own
the test and which test type fits best.

Use this skill to record that decision in `docs/behavior.md` as:

- expected behavior
- chosen test type
- current test file path, `未作成`, or `不要`

`behavior` records the mapping.
`app-testing` decides the testing strategy.

## What to write

- Feature or page-level description of expected behavior
- One or more test types for that behavior, such as `unit`, `feature`, `component`, `e2e`
- One or more test file paths if they exist, `未作成` if coverage is intended but not implemented yet, or `不要` if no test is needed
- If the test file is `不要`, add a brief reason in `補足`
- When the correct test type or ownership is unclear, consult `app-testing` before writing the entry
- Happy path: what input leads to what outcome
- Failure path: what breaks and what should happen

## What NOT to write

- Implementation details — those belong in code
- Exhaustive test cases — those belong in test files
- Tech stack rationale — that belongs in ADRs
- Exact runtime contracts, env names, object keys, or planned files — those belong in ADRs
- Things that are self-evident from config or routing structure
- Fake or guessed test file paths

## Format

**Write this document in Japanese.**

```markdown
---
last-validated: YYYY-MM-DD
---

# Behavior

## [Feature or Page Name]

- **テストタイプ**: `unit` / `feature` / `component` / `e2e` / `不要` を 1 つ以上
- **テストファイル**: `path/to/test-file` を 1 つ以上 / `未作成` / `不要`
- **補足**: [required only when `テストファイル` is `不要`]
- **Happy path**:
  - [input] → [expected outcome]
- **Failure path**:
  - [failure condition] → [expected outcome]
```

## Examples

```markdown
## ユーザーログイン

- **テストタイプ**: `feature`
- **テストファイル**: `app/routes/login/index.test.tsx`
- **正常系**:
  - 正しい認証情報 → セッション発行・/dashboard へ遷移
- **異常系**:
  - 誤った認証情報 → エラーメッセージ表示・リダイレクトなし

---

## ルーティング定義

- **テストタイプ**: 不要
- **テストファイル**: 不要
- **補足**: next.config および app/ ディレクトリ構造で自明

---

## データ取得 API（/api/items）

- **テストタイプ**: `feature`
- **テストファイル**: `app/routes/api/items.test.ts`
- **正常系**:
  - 認証済みリクエスト → 200 + アイテム一覧
- **異常系**:
  - 未認証 → 401
  - DB接続失敗 → 500（ログにのみ記録、レスポンスには出さない）
```

## Maintenance rule

- Update when behavior changes. Slight drift is acceptable — this is not the source of truth
- Update `last-validated` when you verify the content still reflects intent
- Do not delete entries — mark them as deprecated with a brief note to preserve context
