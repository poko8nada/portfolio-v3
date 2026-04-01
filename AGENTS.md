# Instructions

## Commands

- Lint: `pnpm run oxlint .`
- Format: `pnpm run oxfmt`
- Lint + Format check (CI): `pnpm run oxlint . && pnpm run oxfmt --check`
- Test: `pnpm run test`
- Type check: `pnpm run tsc --noEmit`
- E2E: `pnpm test:e2e`

## Rules

Rules are **What to do next** and **Why to do it** in this repo. Always follow first.

- Architecture decisions: `docs/adr/` (check status: Accepted / Superseded / Deprecated)
- Project overview: `docs/overview.md`
- Behavior expectations: `docs/behavior.md`
- Task management: GitHub Issues via gh CLI — see `.cursor/skills/issue/SKILL.md`

## Prohibitions

- No `any` type — use `unknown` with type guards
- No `git commit --no-verify`
- Never modify config files: `.oxlintrc.json`, `.oxfmtrc.json`, `lefthook.yml`
- No explanatory comments — express intent through code and types

## Skills (load on demand)

Skills are a static "TYPES" for you. So that you just need to stick to them.

- Project overview → `.cursor/skills/overview/SKILL.md`
- Behavior documentation → `.cursor/skills/behavior/SKILL.md`
- Architecture decision → `.cursor/skills/adr/SKILL.md`
- Project documentation bootstrap → `.cursor/skills/project-doc-bootstrap/SKILL.md`
- Issue management → `.cursor/skills/issue/SKILL.md`
- New feature → `.cursor/skills/new-feature/SKILL.md`
- Coding standards → `.cursor/skills/coding-standards/SKILL.md`
- Frontend design → `.cursor/skills/frontend-design/SKILL.md`
- Testing → `.cursor/skills/app-testing/SKILL.md`
- Library / framework docs → `.cursor/skills/context7-mcp/SKILL.md`
- Agent memory → `.cursor/skills/agent-memory/SKILL.md`
