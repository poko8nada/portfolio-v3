---
name: new-feature
description: >
  Implements a new feature using docs-first delivery, boundary-driven structure,
  and skeleton-first execution. Load when adding a route, feature, or new
  user-visible behavior.
---

# New Feature

## Purpose

Use this skill when adding a feature, not just when writing code in isolation.

The goal is to choose boundaries deliberately:

- route or handler boundaries for transport and framework concerns
- feature boundaries for nested processing and rendering
- shared libraries or adapters for reusable low-level capabilities

Do not create files and layers just to satisfy a template.
Create them because they own a distinct reason to change.

## Precondition: Docs Must Be Implementable

Before coding, check whether the repository docs are concrete enough to build
from without chat history.

If the task depends on values such as:

- route paths
- input shapes
- storage keys
- binding or environment variable names
- success behavior
- failure behavior

and those values are still vague, tighten the docs first.

In this repository, tighten the ADR first.
Do not create `docs/spec.md` unless the user explicitly asks for it.

If implementation planning is part of the task, the ADR should also record:

- a short implementation plan
- the planned files and which boundary will own each one

## Delivery Order: Skeleton First

Build in this order:

1. **Types** — define the shape of data and errors
2. **Interfaces** — define the boundary API
3. **Tests** — write tests against that boundary
4. **Implementation** — fill in logic until tests pass

This keeps the design explicit and prevents "done" from meaning
"probably works."

## Choose Boundaries by Ownership

## Route or Handler Boundary

A route or handler owns framework-facing concerns.

Typical responsibilities:

- path, query, params, body, cookies, headers
- request-scoped context, env, auth/session access
- status codes, redirects, headers, metadata
- deciding which feature or service to call
- rendering or returning the top-level response

Routes should not absorb every detail below them.
They should gather inputs, call the right boundary, and own the response
contract.

## Feature Boundary

A feature owns nested behavior once the route has supplied explicit inputs.

Typical responsibilities:

- transforming route inputs into feature data
- loading or combining data for one user-facing capability
- rendering nested views, sections, forms, panels, or composed UI
- feature-specific error mapping
- feature-specific state transitions and decisions

Good feature boundaries are driven by one capability, not by a directory rule.

## Shared Library or Adapter Boundary

Shared libraries or adapters own reusable capabilities that should not care
which route or feature called them.

Typical responsibilities:

- API clients
- storage access
- parsers and serializers
- normalization helpers
- cache helpers
- cross-feature utility logic

If multiple features would need the same low-level behavior, it likely belongs
here instead of inside one feature.

## Colocation Pattern

When a feature boundary exists, colocate the files that belong to it.

```text
[feature-name]/
├── index.ts
├── [feature].ts
├── [feature].tsx      # primary component
├── [feature]-card.tsx # sub-component
├── [feature].types.ts
└── [feature].test.ts
```

Use `index.ts` as the public boundary when the feature is imported from
elsewhere.

This pattern includes not only logic and types, but also the UI component(s) that belong to the feature. A [feature].tsx file colocates the view layer alongside its data and business logic, avoiding the need for a separate components/ directory at the feature level.

- Next.js App Router
- Remix
- React Router data routers
- Nuxt
- SvelteKit
- SolidStart
- HonoX
- Astro

## Feature Slices Are Optional

Do not create a feature slice only because a route has logic.

Keep code local to the route when it is:

- tiny
- truly route-specific
- unlikely to be reused
- mostly transport glue rather than nested behavior

Promote route-local code into a feature when:

- the nested behavior is no longer tiny
- there is meaningful processing after route inputs are gathered
- the rendering below the route deserves its own ownership
- the same capability may be reused by another route or context

Practical rule:

- tiny route-owned behavior can stay in the route file
- medium feature-owned behavior should move into a feature boundary
- reusable low-level behavior should move into shared libraries or adapters

## Types Files Are Optional

Do not create `[feature].types.ts` just because a template says so.

Create a separate types file only when:

- multiple files in the boundary share those types
- the types clarify the public contract
- the contract is important enough to deserve its own surface

Do not use a types file as a dumping ground for unrelated constants.

## Medium-Sized Components Are Allowed

It is acceptable to keep medium-sized feature-local UI inside the same boundary.

Good fit:

- feature-owned views
- sections and panels
- composed cards
- forms tied to one feature flow
- UI that depends mainly on one feature's inputs or state

Promote to shared components only when reuse is real.

## Test Layers by Responsibility

Do not split tests by folder name alone.
Split them by owned contract.

Use feature tests for:

- nested processing and rendering
- feature-specific data combination
- feature-specific error mapping
- feature state and decisions

Use shared library or adapter tests for:

- parsers
- storage access
- client behavior
- cache logic
- normalization helpers

If two test files assert the same behavior at different layers, one of them is
probably too low-level or too high-level.

## Completion Checklist

- [ ] docs were concrete enough to implement from, or were tightened first
- [ ] route, feature, and shared boundaries were chosen by ownership
- [ ] files were added because they own a distinct reason to change
- [ ] tests match the owned contract of each boundary
- [ ] the repository's existing validation commands pass
