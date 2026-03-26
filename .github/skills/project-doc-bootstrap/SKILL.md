---
name: project-doc-bootstrap
description: Bootstraps project documentation for an existing repository by reading the codebase, README, tests, and package metadata, then creates or updates docs/overview.md, docs/spec.md, and ADRs when significant architectural decisions are discovered. Use when asked to document a repo, extract project purpose, write overview/spec docs, review an existing codebase, or capture architecture decisions from source.
---

# Project Documentation Bootstrap

## When to Use This Skill

- The user wants to understand an existing repository and turn it into project docs
- The user asks to create or update `docs/overview.md`, `docs/spec.md`, or `docs/adr/`
- The user wants to document purpose, goals, constraints, requirements, and architectural decisions from source code
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

4. Produce `docs/spec.md` from observable behavior and intended requirements.
   - Document functional requirements, acceptance criteria, edge cases, and external interfaces.
   - Express requirements in a verifiable form and avoid implementation detail.

5. Create ADRs only when the repository contains a decision with lasting impact.
   - Use ADRs for non-obvious architecture choices, project-wide patterns, rejected alternatives, or external constraints.
   - Keep ADRs append-only and mark superseded decisions instead of rewriting history.

6. Cross-check the generated docs against the repository.
   - Do not invent missing facts.
   - If the codebase does not support a claim, either omit it or flag it as an assumption for confirmation.

## Output Expectations

- Write the docs in Japanese
- Keep `overview` focused on why the project exists
- Keep `spec` focused on what the system must do
- Use ADRs only for decisions that need durable rationale

## Related Skills

- `overview`
- `spec`
- `adr`
- `coding-standards`

## Notes

- This skill is for documenting an existing project, not for inventing a new one from scratch
- Prefer direct evidence from the repository over speculation
- If the project is too large to read in one pass, start with the public entry points and expand outward
