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

ADRs record the Why and Why Not behind significant decisions.
They are append-only — never rewrite, only supersede.
Agents use status fields to determine which decisions are currently active.

## What qualifies as an ADR

- Choosing between technical approaches with non-obvious trade-offs
- Establishing a project-wide pattern (error handling, state management, etc.)
- Rejecting a reasonable alternative that might be reconsidered later
- Decisions driven by external constraints (legal, SLA, org policy)

## What does NOT qualify

- Implementation details that belong in code
- Decisions that are obvious given the tech stack
- Temporary decisions with no lasting architectural impact

## Status lifecycle

- `Accepted` — currently active, agents must follow
- `Superseded` — replaced by a later ADR, link to successor
- `Deprecated` — no longer applicable, brief reason why

## Format

**This document should be written in Japanese.**

```markdown
---
status: Accepted
date: YYYY-MM-DD
---

# ADR-NNNN: [Decision Title]

## Context

[What situation or problem prompted this decision?
What constraints or forces were at play?]

## Decision

[What was decided? State it clearly and directly.]

## Rationale

[Why this option over the alternatives?
What trade-offs were accepted?]

## Alternatives Considered

### [Alternative A]

[What it is and why it was rejected]

### [Alternative B]

[What it is and why it was rejected]

## Consequences

[What becomes easier or harder as a result of this decision?
What future decisions does this constrain?]
```

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
