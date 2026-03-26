# Copilot Instructions

## Commands

- Lint: `pnpm run oxlint .`
- Format: `pnpm run oxfmt`
- Lint + Format check (CI): `pnpm run oxlint . && pnpm run oxfmt --check`
- Test: `pnpm run test`
- Type check: `pnpm run tsc --noEmit`
- E2E: `pnpm test:e2e`

## Rules

- Architecture decisions: `docs/adr/` (check status: Accepted / Superseded / Deprecated)
- Project overview: `docs/overview.md`
- Specification: `docs/spec.md`
- Task management: GitHub Issues via gh CLI — see `.github/skills/issue/SKILL.md`

## Prohibitions

- No `any` type — use `unknown` with type guards
- No `git commit --no-verify`
- Never modify config files: `.oxlintrc.json`, `.oxfmtrc.json`, `lefthook.yml`
- No explanatory comments — express intent through code and types

## Skills (load on demand)

- Project overview → `.github/skills/overview/SKILL.md`
- Specification → `.github/skills/spec/SKILL.md`
- Architecture decision → `.github/skills/adr/SKILL.md`
- Project documentation bootstrap → `.github/skills/project-doc-bootstrap/SKILL.md`
- Issue management → `.github/skills/issue/SKILL.md`
- New feature → `.github/skills/new-feature/SKILL.md`
- Coding standards → `.github/skills/coding-standards/SKILL.md`
- Frontend design → `.github/skills/frontend-design/SKILL.md`
- Testing → `.github/skills/app-testing/SKILL.md`
