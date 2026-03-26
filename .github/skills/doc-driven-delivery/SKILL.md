---
name: doc-driven-delivery
description: >
  Drives a repository change through a docs-first workflow.
  Load when a task must be recorded in project docs before implementation,
  may be implemented by the agent or the user, and must be validated and
  reconciled back into docs at the end.
---

# Doc-Driven Delivery

## Purpose

Use this skill when the request is not just "change code", but
"leave a durable project trail while changing code."

This skill exists to prevent important work from living only in:

- chat history
- a session-only `plan.md`
- the implementer's head

For meaningful work, the durable source of truth is the repository docs.

## Core Rule

For any non-trivial change:

1. write the intent into project docs first
2. implement from those docs
3. validate the result
4. update docs again if implementation changed the plan

Do not stop after a session plan if the project itself still has no record.

The docs written in step 1 must be concrete enough that a fresh agent can
implement the change without needing chat history or issue comments.

## When to Use

Load this skill when:

- a feature, bug fix, or refactor needs requirements recorded in the repo
- architecture or storage boundaries may change
- the user wants planning to remain visible in project files
- implementation may be done by the agent, a custom agent, or the user
- the work should end with docs and code aligned

## Which Docs to Update

Choose the smallest correct surface:

- `docs/spec.md`
  - use for behavior, requirements, acceptance criteria, edge cases
- `docs/overview.md`
  - use for project purpose, constraints, planned evolution, background
- `docs/adr/*.md`
  - use for architectural decisions, boundary changes, important alternatives

If these docs are missing or badly stale, invoke `project-doc-bootstrap` first.

## Related Skills

Invoke the relevant skill at the phase where it is needed:

- `spec`
- `overview`
- `adr`
- `project-doc-bootstrap`
- `new-feature`
- `coding-standards`
- `app-testing`

Do not create helper files or extra skill wrappers for these references.

## Standard Flow

### Phase 1: Understand the request

Clarify:

- what changes
- whether the change is behavioral, architectural, or both
- who will implement it

Implementation owner must be made explicit:

- the current agent
- another custom agent
- the user

### Phase 2: Record the plan in project docs

Before implementation, update the repository docs that should govern the work.

Examples:

- add or refine requirements in `docs/spec.md`
- update `docs/overview.md` if the project direction or constraints changed
- add an ADR if a new storage, routing, or system boundary decision was made

At the end of this phase, another collaborator should be able to continue
without needing the original chat to understand the intended change.

That means writing concrete contracts, not vague summaries. When a value is
part of the decision, record the exact value:

- route paths
- binding names
- bucket names
- environment variable names
- object keys or path patterns
- required vs optional inputs
- success behavior
- failure behavior
- explicit non-goals for this iteration

If one of these is needed for implementation and is still unknown, ask before
considering the docs phase complete.

### Phase 3: Track execution

Track work with SQL todos.

- create concrete todos
- add dependencies where needed
- mark a todo `in_progress` before starting it
- mark it `done` only after verification

Session planning artifacts are optional support only.
They never replace repository docs.

### Phase 4: Branch by implementation owner

#### Agent-led implementation

If the agent implements:

- invoke `new-feature` when the task is a feature or route
- invoke `coding-standards` when shaping implementation details
- invoke `app-testing` when deciding or adding tests
- implement against the documented requirements, not against memory

#### Custom-agent-led implementation

If another custom agent implements:

- hand off using the updated project docs as the contract
- require the implementing agent to report any divergence
- reconcile docs after reviewing the result

This keeps the workflow stable even when a custom agent explains first,
codes later, or collaborates differently from the default agent.

#### User-led implementation

If the user implements:

- still finish the docs-first phase
- leave a clear task breakdown and acceptance path
- do not claim implementation is complete
- keep the task open for later review, testing, or doc reconciliation

In this path, the agent is responsible for durable docs, clear execution
guidance, and final review support.

### Phase 5: Validate

Run only the repository's existing validation commands that apply.

Typical examples:

- lint
- format check
- tests
- typecheck
- build

Completion without verification is not completion.

### Phase 6: Reconcile docs after implementation

After implementation, compare reality with the earlier docs update.

Update docs again when:

- behavior changed during implementation
- acceptance criteria became more precise
- an architectural decision appeared during coding
- the user implemented something slightly different from the original plan

The goal is not "docs were updated once."
The goal is "docs match the final agreed result."

## Completion Checklist

- [ ] the intended change was recorded in repository docs before implementation
- [ ] todos were tracked during execution
- [ ] implementation ownership was handled explicitly
- [ ] relevant validation commands were run
- [ ] repository docs were reviewed again after implementation
- [ ] final docs reflect the shipped or agreed outcome

## Anti-Patterns

Avoid:

- keeping the only plan in `plan.md`
- implementing first and promising docs later
- skipping docs because the user will implement
- skipping final docs reconciliation after implementation drift
- declaring completion before validation
- writing phrases like "専用バケット" or "適切なファイル" when the concrete value is already part of the decision
