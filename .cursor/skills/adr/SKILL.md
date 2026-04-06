---
name: adr
description: >
  Creates a new Architecture Decision Record in docs/adr/.
  Load when making a significant architectural decision, choosing between
  technical approaches, establishing a new pattern, or recording why an
  alternative was rejected.
  Covers ADR format, status lifecycle, and what qualifies as an ADR.
---

# Architecture Decision Records

## Purpose

ADRs record the why and why-not behind significant decisions.
They are append-only — never rewrite, only supersede.
Agents use status fields to determine which decisions are currently active.

This is also the canonical place for rejected alternatives — including
feature-level "why not" reasoning that used to live in behavior documents.

In this repository, ADRs are also the default place for concrete feature
contracts that must be fixed before implementation.
Do not create `docs/spec.md` unless the user explicitly asks for it.

## What qualifies as an ADR

- Choosing between technical approaches with non-obvious trade-offs
- Establishing a project-wide pattern (error handling, state management, etc.)
- Rejecting a reasonable alternative that might be reconsidered later
- Decisions driven by external constraints (legal, SLA, org policy)
- Fixing concrete system boundaries: route ownership, binding names,
  storage locations, integration contracts, or failure policy

## What does NOT qualify

- Implementation details that belong in code
- Decisions that are obvious given the tech stack
- Temporary decisions with no lasting architectural impact

## Status lifecycle

- `Accepted` — currently active, agents must follow
- `Superseded` — replaced by a later ADR, link to successor
- `Deprecated` — no longer applicable, brief reason why

## Format

**Write this document in Japanese.**

```markdown
---
status: Accepted
date: YYYY-MM-DD
---

# ADR-NNNN: [決定のタイトル]

## Context

- [この決定を促した状況・問題は何か]

## Decision

- [何を決定したか。明確・直接的に記述する]

## Rationale

- [なぜこの選択肢か。どのトレードオフを受け入れたか]

## Alternatives Considered

### [代替案 A]

- [内容と、採用しなかった理由]

### [代替案 B]

- [内容と、採用しなかった理由]

## Consequences

- [この決定によって何が楽になり、何が難しくなるか。将来の決定に何を制約するか]

## Initial Implementation Plan

1. [実装の大枠を 3〜5 手順で書く]

## Planned Files

- `path/to/file`: [何を担当する予定か]
- `path/to/file`: [何を担当する予定か]
```

When implementation depends on concrete route paths, binding names, object keys,
JSON shapes, print behavior, theme policy, or similar fixed values, include those
exact values in the ADR itself.

When the user asks for planning before coding, include both:

- a short implementation plan
- the planned files and their ownership

## Concreteness rule

If the ADR decides a concrete value, write the exact value.

Good:

- `RESUME_ASSETS_BUCKET`
- `portfolio-resume-assets`
- `/about`

Bad:

- "専用バケット"
- "skills 系の Markdown"
- "about 用の別ルート"

An ADR should not become a task-by-task checklist, but it must be specific
enough that a fresh implementer understands both the fixed boundary and the
intended implementation shape without additional chat.

If the exact value is not yet known and implementation depends on it, ask before finalizing.

## Naming convention

```
docs/adr/
├── 0001-result-type-pattern.md
├── 0002-colocation-pattern.md
└── 0003-vertical-slice-architecture.md
```

Zero-padded 4-digit sequence. Title is kebab-case summary of the decision.

## Superseding an ADR

Do not edit the original. Create a new ADR and add to the original:

```markdown
---
status: Superseded by ADR-NNNN
date: YYYY-MM-DD
---
```

Agents check status first — a superseded ADR is never authoritative.
