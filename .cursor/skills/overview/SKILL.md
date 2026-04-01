---
name: overview
description: >
  Creates or updates docs/overview.md — the project's purpose and background.
  Load when starting a new project, when the project's goals or context have
  changed, or when docs/overview.md does not exist.
  Covers what to write, what to omit, and how to keep the document agent-friendly.
---

# Project Overview

## Purpose of docs/overview.md

Captures the irreducible knowledge that cannot be derived from code, tests, or ADRs —
the why and why-not behind the project's existence.
Agents use it to understand intent when making architectural decisions.

## What to write

- **Problem**: What problem does this project solve? For whom?
- **Goals**: What does success look like?
- **Non-goals**: What is explicitly out of scope, and why?
- **Constraints**: External constraints (legal, organizational, SLA, third-party).
- **Key decisions**: Why this tech stack over alternatives? Link to ADRs for details.

## What NOT to write

- Current system state — code and tests are the source of truth
- Directory structure — agents can read the filesystem
- How features work — that belongs in code and tests
- Anything that will change as implementation evolves

Do not use `overview` as a substitute for `behavior` or ADR.
Expected behavior per feature belongs in `docs/behavior.md`.
Decision trade-offs and rejected alternatives belong in `docs/adr/*.md`.

## Format

**Write this document in Japanese.**

```markdown
---
last-validated: YYYY-MM-DD
phase: current
---

# [プロジェクト名]

## Problem

[1〜3文：どんな問題を、誰のために解決するか]

## Goals

- [具体的・測定可能なゴール]

## Non-goals

- [対象外にしていること、およびその理由]

## Constraints

- [外部制約：法律・SLA・組織ポリシーなど]

## Tech Stack Rationale

- [選択したもの]：[なぜ他の選択肢でなくこれか] → see ADR-NNNN
```

## Maintenance rule

Update `last-validated` whenever you verify the document still reflects reality.
If any section no longer holds, update it or supersede with a new version.
A stale `last-validated` is a signal the document may have drifted.
