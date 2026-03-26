---
name: spec
description: >
  Creates or updates docs/spec.md — the project's functional requirements.
  Load when defining new features, when requirements have changed,
  or when docs/spec.md does not exist.
  Covers what to write, what to omit, and how to express requirements
  in a way that is verifiable and agent-friendly.
---

# Specification

## Purpose of docs/spec.md

Captures what the system must do — not how it does it.
Agents use it to understand the expected behavior when implementing
or modifying features. Requirements that can be expressed as tests
should be — docs/spec.md is for what cannot.

## What to write

- **Functional requirements**: what the system must do, from the user's perspective
- **Acceptance criteria**: specific, verifiable conditions for each requirement
- **Edge cases**: explicit decisions about boundary conditions and error states
- **External interfaces**: API contracts, third-party integrations, data formats
- **Why Not**: why alternative approaches were rejected for each requirement

## What NOT to write

- Implementation details — how the system works belongs in code
- Technology choices — those belong in docs/overview.md and ADRs
- Anything derivable from code, tests, or type definitions

## Format

**This document should be written in Japanese.**

```markdown
---
last-validated: YYYY-MM-DD
phase: current
---

# Specification

## [Feature Name]

### Requirements

- [REQ-001] [Actor] must be able to [action] so that [outcome]
- [REQ-002] ...

### Acceptance Criteria

- [REQ-001] Given [context], when [action], then [expected result]
- [REQ-001] Given [context], when [invalid input], then [error state]

### Edge Cases

- [Explicit decision about a boundary condition]

### Why Not

- [Alternative approach]: [reason rejected]
```

## Writing good acceptance criteria

- Express in Given / When / Then format
- One criterion per observable behavior
- Error paths are first-class requirements — not afterthoughts
- If a criterion can be directly expressed as a test, write the test instead

## Maintenance rule

Update `last-validated` whenever you verify requirements still reflect intent.
Mark superseded requirements explicitly rather than deleting them —
deletion loses the Why Not context that prevents agents from reintroducing
rejected approaches.
