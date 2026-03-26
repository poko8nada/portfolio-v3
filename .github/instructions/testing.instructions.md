---
applyTo: "**/*.test.ts,**/*.test.tsx"
---

# Testing Rules

## Colocation

- Test files live alongside the implementation: `[name].test.ts` in the same directory.
- Never place tests in a separate top-level `__tests__` directory — breaks grep-ability.

## What to Test

- Business logic and domain functions — not framework internals or third-party libraries.
- Every `Result<T, E>` error path explicitly — not just the happy path.
- API integrations: both success and failure cases.

## What NOT to Test

- CSS / styling details
- Trivial code (simple getters, obvious mappings)
- React/Vue rendering internals
