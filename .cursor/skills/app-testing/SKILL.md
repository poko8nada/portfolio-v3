---
name: app-testing
description: >
  Testing implementation guidance for application code. Load when deciding what
  to test, how to split tests across layers, or how to avoid redundant tests.
---

# Application Testing

## Relation to docs/behavior.md

`docs/behavior.md` is the lightweight map of expected behavior and current test
coverage.

Use `behavior` to record:

- what the feature or page is expected to do
- which test type covers it
- which test file covers it, or whether it is `未作成` / `不要`

Use this skill to decide:

- which boundary owns the behavior
- which test type is the best fit
- whether a new test adds coverage or only duplicates an existing contract

When behavior changes or test ownership changes, update `docs/behavior.md` too.

## Core Rule

Test the boundary that owns the behavior.
Do not duplicate the same contract across route, feature, and utility tests
unless each layer truly owns a different risk.

## Decision Tree

```text
What owns the behavior?
├─ Shared pure logic or adapter → unit test
├─ Feature-specific processing or rendering → feature test
├─ Critical cross-page flow → E2E test
└─ Small interactive UI detail only → component test
```

## Shared Logic and Adapter Tests

Use unit tests for code that is reusable and framework-light.

Good fit:

- parsers
- serializers
- validators
- API clients
- storage adapters
- cache helpers
- normalization and transformation functions

These tests should verify:

- success behavior
- every important failure path
- edge cases
- deterministic outputs

## Feature Tests

Use feature tests for behavior owned by one feature boundary.

Good fit:

- nested data loading or composition
- feature-specific state transitions
- feature-specific rendering decisions
- feature-level error mapping
- medium-sized feature-owned views

Feature tests should receive explicit inputs whenever possible.
Avoid making them depend on the full route or framework surface unless the
feature truly owns that dependency.

## Component Tests

Use component tests sparingly.

They are most useful when:

- interaction cannot be expressed well at the feature level
- accessibility behavior needs direct verification
- a component has meaningful state transitions of its own

Do not reach for component tests just because JSX exists.

## E2E Tests

Use E2E for critical user journeys that cross multiple boundaries.

Good fit:

- authentication flows
- checkout flows
- publishing flows
- multi-step form submission

Do not use E2E to cover behavior that is already well protected by feature tests unless the end-to-end risk is materially different.

## Anti-Duplication Rules

Before adding a test, ask:

1. Which boundary owns this behavior?
2. Is another test already asserting the same contract?
3. Am I testing framework plumbing when a lower boundary already covers the logic?
4. Am I testing nested logic from a route test when a feature test should own it?

If the answer to the second question is yes, prefer deleting the weaker test
instead of adding another.

## Good Test Names

Use names that describe the behavior and condition:

- `returns not-found when the record does not exist`
- `renders retry state when loading fails`
- `redirects to login when the session is missing`

Avoid names that only describe the function or file.

## General Rules

- mock external dependencies deliberately
- keep tests independent
- cover meaningful failure paths, not only happy paths
- prefer one owned contract per test file
- run the repository's existing validation commands before claiming completion
