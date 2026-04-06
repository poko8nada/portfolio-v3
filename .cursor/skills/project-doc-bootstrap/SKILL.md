---
name: project-doc-bootstrap
description: Bootstraps project documentation for an existing repository by reading the codebase, README, tests, and package metadata, then creates or updates docs/overview.md, docs/behavior.md, and ADRs when significant architectural decisions are discovered. Use when asked to document a repo, extract project purpose, write overview/behavior docs, review an existing codebase, or capture architecture decisions from source.
---

# Project Documentation Bootstrap

## When to Use This Skill

- The user wants to understand an existing repository and turn it into project docs
- The user asks to create or update `docs/overview.md`, `docs/behavior.md`, or `docs/adr/`
- The user wants to document purpose, goals, constraints, and architectural decisions from source code
- The user mentions reverse engineering, repo audit, project read-through, or documentation bootstrapping

## Prerequisites

- Access to the repository root and its main docs
- The ability to read source files, tests, and package metadata
- A clear target for which documents should be produced

## Workflow

1. Inspect the repository entry points first.
   - Read `README.md`, package manifests, existing docs, and the top-level file tree.
   - Identify the primary language, framework, and execution model.

2. Read the implementation surface that defines behavior.
   - Focus on routes, services, domain logic, tests, and public APIs.
   - Prefer the code paths that drive user-visible behavior and important boundaries.

3. Produce `docs/overview.md` from what the repository establishes.
   - Write the project purpose, goals, non-goals, constraints, and key decisions.
   - Keep only irreducible context that is difficult to infer from code alone.

4. Produce `docs/behavior.md` from observable behavior in the codebase.
   - For each feature or page, judge whether tests are needed or self-evident from config/structure.
   - Describe the happy path and failure path in rough terms — not exhaustive test cases.
   - Code and tests are the source of truth; this document is supplementary.
   - Do not document routing definitions or anything self-evident from the file structure.

5. Create ADRs only when the repository contains a decision with lasting impact.
   - Use ADRs for non-obvious architecture choices, project-wide patterns, rejected alternatives, or external constraints.
   - In this repository, also use ADRs for concrete feature contracts that must be fixed before implementation.
   - If the user asked for planning before coding, include a short implementation plan and planned files in the ADR.
   - This is also the place for "why not" reasoning — alternatives that were considered and rejected.
   - Keep ADRs append-only and mark superseded decisions instead of rewriting history.

6. Cross-check the generated docs against the repository.
   - Do not invent missing facts.
   - If the codebase does not support a claim, either omit it or flag it as an assumption for confirmation.
   - Do not hide unknowns behind vague phrases like "専用バケット" or "適切なファイル".

## Output Expectations

- Write the docs in Japanese
- Keep `overview` focused on why the project exists
- Keep `behavior` focused on what each feature does and whether it needs tests
- Use ADRs for durable rationale and for concrete pre-implementation contracts
- Aim for docs that a fresh agent can act on without relying on prior chat context

## Related Skills

- `overview`
- `behavior`
- `adr`

## Notes

- This skill is for documenting an existing project, not for inventing a new one from scratch
- Prefer direct evidence from the repository over speculation
- If the project is too large to read in one pass, start with the public entry points and expand outward
