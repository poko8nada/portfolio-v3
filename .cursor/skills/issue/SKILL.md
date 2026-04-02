---
name: issue
description: >
  Manages GitHub Issues using gh CLI — creation, decomposition, update, and close.
  Load when asked to create a new issue, break down a large task into issues,
  update issue status or labels, or close an issue after a PR is merged.
  Human decides whether to create an issue. Agent handles all gh CLI operations.
---

# Issue Management

## Principle

- 1 Issue = 1 PR — scope each issue to what can be completed in a single PR
- Human decides whether to create. Agent handles creation, updates, and closing.
- Issues are the session-to-session bridge — always reference the issue number in commits and PRs
- If implementation depends on fixed contracts or planned files, create or update the ADR first and link it from the issue

## Granularity Guide

**Good scope (1 PR完結)**

- Add a specific feature function with tests
- Fix a specific bug
- Refactor a specific module

**Too large — decompose first**

- "Implement authentication" → break into: session management, login flow, token refresh, etc.
- "Redesign dashboard" → break into individual components or data-fetching concerns

When asked to implement something large, list the decomposed Issues for human approval before creating them.

## Commands

### Create

```bash
# Single issue
gh issue create \
  --title "[concise action-oriented title]" \
  --body "[context, acceptance criteria, references]" \
  --label "[label]" \
  --assignee "@me"

# Decompose a large task — list first, then create after approval
gh issue create --title "..." --body "..." --assignee "@me"
gh issue create --title "..." --body "..." --assignee "@me"
```

### View & List

```bash
gh issue list --state open --assignee "@me"
gh issue view [number]
```

### Update

```bash
gh issue edit [number] --title "..." --body "..."
gh issue edit [number] --add-label "in-progress" --remove-label "todo"
```

### Close

```bash
# Close when PR is merged
gh issue close [number] --comment "Resolved in PR #[pr-number]"
```

## Issue Body Format

```markdown
## Context

[Why this needs to be done]

## Acceptance Criteria

- [ ] [specific verifiable condition]
- [ ] [specific verifiable condition]

## References

- Related: #[issue-number]
- ADR: docs/adr/NNNN-\*.md (if applicable)
- Behavior: docs/behavior.md (if behavior mapping changed)
```

## Labels Convention

| Label      | Meaning                             |
| ---------- | ----------------------------------- |
| `bug`      | Something is broken                 |
| `feature`  | New capability                      |
| `refactor` | Code change with no behavior change |
| `docs`     | Documentation only                  |
| `chore`    | Tooling, config, dependencies       |

## Commit & PR convention

Always reference the issue:

```bash
# Commit
git commit -m "feat: add [feature] (#[issue-number])"

# PR — closes issue automatically on merge
gh pr create \
  --title "feat: [title] (#[issue-number])" \
  --body "Closes #[issue-number]"
```
