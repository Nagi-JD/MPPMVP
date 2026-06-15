# Contributing to MPP+

Thanks for your interest in contributing! This document describes how we work.

## Workflow

1. **Branch** off `main` using a descriptive name: `feat/prediction-flow`, `fix/lock-time`, `docs/architecture`.
2. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` a new feature
   - `fix:` a bug fix
   - `docs:` documentation only
   - `chore:` tooling, deps, config
   - `test:` adding or fixing tests
   - `refactor:` code change that neither fixes a bug nor adds a feature
3. **Open a PR** against `main`. Fill in the PR template. CI must pass.
4. **Review** — at least one approval before merge. Squash-merge preferred.

## Development

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Before pushing:

```bash
npm run lint
npm run typecheck
npm test
```

## Code style

- TypeScript everywhere; no `any` without justification.
- Keep modules small and single-purpose (see `docs/ARCHITECTURE.md`).
- Business logic (scoring, settlement) lives in pure, unit-tested functions.

## Reporting issues

Use the issue templates. Include steps to reproduce, expected vs actual behavior,
and environment details.
