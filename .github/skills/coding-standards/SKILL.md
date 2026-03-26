---
name: coding-standards
description: >
  TypeScript coding patterns and implementation standards. Load when structuring
  logic, defining boundaries, handling errors, or deciding what belongs in a
  route, feature, or shared module.
---

# Coding Standards

## Result<T, E>

### Definition

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

### When to Use

- domain functions that return structured failure
- route or handler orchestration
- feature-level async operations
- client or adapter calls where callers need explicit failure handling

### When NOT to Use

- expected absence — prefer `T | undefined` or `T | null`
- trivial synchronous code with no meaningful error contract

Promote absence to a domain error only at the boundary that actually owns that
decision.

## Boundary-Driven Organization

Choose module boundaries by ownership, not by habit.

## Route or Handler Boundary

Owns:

framework context

- params, query, body, cookies, headers
- auth/session lookup
- status codes, redirects, headers, metadata
- selecting which downstream boundary to call

Should usually not own:

- large nested rendering trees
- feature-specific transformation logic
- reusable low-level integration code

## Feature Boundary

Owns:

- nested processing after route inputs are gathered
- feature-specific state and decision-making
- medium-sized rendering owned by one capability
- combining inputs from multiple lower-level helpers

Should usually receive explicit inputs rather than framework context when that
keeps the contract cleaner.

## Shared Library or Adapter Boundary

Owns:

- reusable infrastructure access
- parsing and serialization
- cache helpers
- normalization utilities
- low-level client logic

Should not know about route metadata, redirects, or page-level rendering.

## Extraction Rule

Start with the smallest boundary that matches the ownership of the code.

Extract upward only when one of these becomes true:

- the nested behavior is no longer tiny
- the code has a different reason to change than the caller
- the code is reused elsewhere
- the contract becomes important enough to test and evolve independently

Do not extract a file or layer if it does not create a clearer boundary.

## Composable Logic Design

1. isolate pure logic from side effects
2. make inputs explicit
3. return derived values instead of duplicating state
4. keep framework concerns at the edge

## Component Architecture

### Pattern 1: Route or Container Owns a Small View

Use when:

- the UI is tiny
- the logic is simple
- the behavior is not worth its own boundary yet

### Pattern 2: Route Delegates to a Feature

Use when:

- nested processing or rendering is medium or large
- the feature has its own meaningful inputs and outputs
- the feature deserves focused tests

### Pattern 3: Feature Uses Shared Components or Libraries

Use when:

- reuse is real
- multiple features depend on the same lower-level capability
- a component or helper now has its own independent reason to change

## Error Handling

Use `try-catch` for external I/O and impure boundaries.
Return structured errors rather than throwing across module boundaries.

When catching external I/O failures:

- log deliberately
- map to a clear error contract
- avoid silent fallbacks that hide failure

## Comments

Comment only when the intent cannot be made obvious with names, types, or
structure.

Do not use comments to compensate for muddy boundaries.
