---
name: behavior
description: >
  Creates or updates docs/behavior.md — a lightweight summary of expected behavior
  per feature or page. Load when adding a new feature, clarifying intent of an
  existing one, or deciding whether a feature needs tests at all.
  Assumes code and tests are the source of truth; this document is supplementary.
---

# Behavior

## Purpose of docs/behavior.md

Code and tests are the source of truth. This document supplements them.

- Helps decide whether a feature needs tests at all
- Describes roughly what the happy path and failure path should look like
- Does not aim to be exhaustive — if something is not written here, read the code

## What to write

- Feature or page-level description of expected behavior
- Test necessity judgment (and a brief reason if not needed)
- If not needed, don't need to write anything else
- Happy path: what input leads to what outcome
- Failure path: what breaks and what should happen

## What NOT to write

- Implementation details — those belong in code
- Exhaustive test cases — those belong in test files
- Tech stack rationale — that belongs in ADRs
- Things that are self-evident from config or routing structure

## Format

**Write this document in Japanese.**

```markdown
---
last-validated: YYYY-MM-DD
---

# Behavior

## [Feature or Page Name]

- **Tests needed**: yes / no (reason if no)
- **Happy path**:
  - [input] → [expected outcome]
- **Failure path**:
  - [failure condition] → [expected outcome]
```

## Examples

```markdown
## ユーザーログイン

- **テスト要否**: 要
- **正常系**:
  - 正しい認証情報 → セッション発行・/dashboard へ遷移
- **異常系**:
  - 誤った認証情報 → エラーメッセージ表示・リダイレクトなし

---

## ルーティング定義

- **テスト要否**: 不要（next.config および app/ ディレクトリ構造で自明）

---

## データ取得 API（/api/items）

- **テスト要否**: 要
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
