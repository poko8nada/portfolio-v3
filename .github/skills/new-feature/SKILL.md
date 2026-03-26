---
name: new-feature
description: >
  Implements a new feature using vertical slice architecture and skeleton-first approach.
  Load when adding a new feature, route, or domain concept to the project.
  Covers file structure, colocation pattern, implementation order, and
  how to verify completion. Works regardless of framework.
---

# New Feature

## Approach: Skeleton First

Build in this order — each step must compile and type-check before proceeding:

1. **Types** — define the shape of data and errors
2. **Interfaces** — define function signatures with `Result<T,E>` return types
3. **Tests** — write tests against the interfaces (they will fail at this stage)
4. **Implementation** — fill in logic until tests pass

This order ensures the agent never declares completion without verification.
Type errors and failing tests are the definition of "not done".

## Colocation Pattern

Every file that belongs to a feature lives alongside it.
Never scatter related files across separate top-level directories.

```
[feature-name]/
├── index.ts              # public API — only export what callers need
├── [feature].ts          # core logic
├── [feature].types.ts    # types and error definitions
├── [feature].schema.ts   # validation schemas (Zod etc.) if needed
└── [feature].test.ts     # tests colocated here, not in __tests__/
```

Place this slice wherever your framework dictates — inside `app/`, `src/`, `routes/`,
or a monorepo package. The internal structure above applies regardless.

## Step 1: Types

```typescript
// [feature].types.ts
import type { Result } from "@/shared/types";

export type [Feature] = {
  id: string;
  // ...
};

export type [Feature]Error =
  | "not-found"
  | "invalid-input"
  | "unauthorized";

export type [Feature]Result = Result<[Feature], [Feature]Error>;
```

## Step 2: Interfaces

```typescript
// [feature].ts — signatures only, no implementation yet
import type { [Feature]Result } from "./[feature].types";

export async function get[Feature](id: string): Promise<[Feature]Result> {
  throw new Error("not implemented");
}

export async function create[Feature](
  input: unknown,
): Promise<[Feature]Result> {
  throw new Error("not implemented");
}
```

## Step 3: Tests

```typescript
// [feature].test.ts
import { describe, it, expect } from "vitest";
import { get[Feature], create[Feature] } from "./[feature]";

describe("get[Feature]", () => {
  it("returns feature when found", async () => {
    const result = await get[Feature]("valid-id");
    expect(result.ok).toBe(true);
  });

  it("returns not-found error for unknown id", async () => {
    const result = await get[Feature]("unknown-id");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("not-found");
  });
});
```

## Step 4: Implementation

Fill in logic until all tests pass. Use `try-catch` only for external I/O.
Return `Result<T,E>` — never throw across module boundaries.

## index.ts — Public API

```typescript
// Only export what callers outside this slice need
export type { [Feature], [Feature]Error } from "./[feature].types";
export { get[Feature], create[Feature] } from "./[feature]";
```

Never import from inside a slice except through its `index.ts`.
This enforces the boundary and keeps grep-ability intact.

## Completion Checklist

- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm test` passes including all error paths
- [ ] `pnpm oxlint .` passes
- [ ] Public API is exported only through `index.ts`
